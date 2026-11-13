import { NextResponse } from 'next/server';
import { buildOpening, dimensionLabel, stepInterview } from '@/lib/ai/interview';
import { aiEnabled, aiMode, chatJSON, INTERVIEW_SYSTEM_PROMPT } from '@/lib/ai/provider';
import { getJob } from '@/lib/data/jobs';
import { maskPII } from '@/lib/security/pii';
import type { InterviewSession, ResumeProfile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DIMS = ['relevance', 'evidence', 'depth', 'structure', 'reflection'];

function probeDepthOf(session: InterviewSession): number {
  let depth = 0;
  for (let i = session.turns.length - 1; i >= 0; i -= 1) {
    const t = session.turns[i];
    if (t.role !== 'interviewer') continue;
    if (t.probeReason) depth += 1;
    else break;
  }
  return depth;
}

function buildContext(
  session: InterviewSession,
  jobTitle: string,
  profile: ResumeProfile,
  answer: string,
  weakness: Record<string, number>,
  isOpening: boolean,
): string {
  const history = session.turns
    .slice(-6)
    .map((t) => `${t.role === 'interviewer' ? '面试官' : '候选人'}：${t.content}`)
    .join('\n');
  const weak = Object.entries(weakness)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([k, v]) => `${dimensionLabel(k)}=${Math.round(v)}`)
    .join('，');
  const probeDepth = probeDepthOf(session);
  return [
    `你正在面试「${jobTitle}」岗位的候选人。`,
    `候选人姓名：${profile.name || '候选人'}`,
    `候选人目标岗位：${profile.targetRole || '未填写'}`,
    `候选人项目：${profile.projects.map((p) => p.name).join('、') || '暂无'}`,
    `候选人技能：${profile.skills.slice(0, 12).join('、') || '暂无'}`,
    `历史弱点：${weak || '暂无'}`,
    `当前已连续追问层数：${probeDepth}（最多 2 层，超过必须切换考察点）`,
    isOpening
      ? '这是面试开场，请用面试官身份致开场白并提出第一个问题（请候选人做与岗位相关的自我介绍）。'
      : `候选人最新回答：${answer}`,
    `最近对话：\n${history || '（面试刚开始）'}`,
    isOpening ? '请生成开场白。' : '请决定下一步：追问（probe）还是切换考察点（next）。',
  ].join('\n\n');
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    session: InterviewSession;
    jobId: string;
    profile: ResumeProfile;
    answer: string;
    apiKey?: string;
  };
  const apiKey = body.apiKey;

  const job = getJob(body.jobId);
  if (!job) return NextResponse.json({ error: '岗位不存在' }, { status: 404 });

  const answer = maskPII(body.answer ?? '');
  const profile = body.profile;
  const session = body.session;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (payload: unknown) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

      const typeOut = async (text: string) => {
        const step = 3;
        for (let i = 0; i < text.length; i += step) {
          send({ t: 'token', v: text.slice(i, i + step) });
          await wait(12);
        }
      };

      try {
        let question = '';
        let meta: Record<string, unknown> = {
          state: 'warmup',
          targetDimension: 'relevance',
          finished: false,
          weaknessPatch: {},
          score: null,
          probeReason: null,
          mode: aiMode(apiKey),
        };

        const isOpening = !session.turns.length && !answer.trim();
        const aiOn = aiEnabled(apiKey);

        // 1) 先让 DeepSeek 以面试官身份生成问题（开场 / 追问 / 切换考察点）
        if (aiOn) {
          send({
            t: 'tool',
            label: isOpening ? '正在以面试官身份开场' : '面试官正在分析你的回答',
          });
          await wait(isOpening ? 380 : 260);

          const ai = await chatJSON<{
            action?: 'probe' | 'next' | 'opening';
            question: string;
            targetDimension?: string;
            reasoning?: string;
          }>(
            INTERVIEW_SYSTEM_PROMPT,
            buildContext(session, job.title, profile, answer, session.weakness, isOpening),
            apiKey,
          );

          if (ai?.question && ai.question.length >= 6) {
            question = ai.question;
            if (!isOpening && DIMS.includes(ai.targetDimension ?? '')) {
              meta.targetDimension = ai.targetDimension;
            }
            meta.mode = 'live';
            // LLM 判定为追问时标记 probeReason（但不超过 2 层）
            if (!isOpening && ai.action === 'probe' && probeDepthOf(session) < 2) {
              meta.probeReason = ai.reasoning?.slice(0, 40) || '面试官针对你的回答继续追问';
            }
          }
        }

        // 2) 本地引擎负责确定性评分与状态机；当 LLM 未出题时兜底生成问题
        if (isOpening) {
          if (!question) {
            const opening = buildOpening(job, profile, session.weakness);
            question = opening.content;
            meta.targetDimension = opening.targetDimension;
          }
          meta.state = 'warmup';
        } else {
          const step = stepInterview({ session, job, profile, answer });
          if (!question) question = step.question;
          meta = {
            ...meta,
            state: step.state,
            targetDimension: meta.targetDimension ?? step.targetDimension,
            finished: step.finished,
            weaknessPatch: step.weaknessPatch,
            score: step.score,
            // 若 LLM 没判 probe，沿用本地判定
            probeReason: meta.probeReason ?? step.probeReason ?? null,
          };
          // 若已达最大追问层数，强制清除 probeReason
          if (probeDepthOf(session) >= 2) meta.probeReason = null;
        }

        await typeOut(question);
        send({ t: 'meta', ...meta });
        send({ t: 'done' });
      } catch {
        send({ t: 'error', message: '生成回答失败，请重试' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}
