import type {
  InterviewSession,
  InterviewTurn,
  Job,
  ResumeProfile,
  SessionState,
  TurnScore,
} from '@/lib/types';
import { TECH_TERMS } from '@/lib/data/skills';
import { QUESTIONS, type QuestionItem } from '@/lib/data/questions';
import { retrieveQuestions } from '@/lib/rag/retrieve';
import { clamp, uid } from '@/lib/utils';

const DIM_LABEL: Record<string, string> = {
  relevance: '内容相关性',
  evidence: '量化与证据',
  depth: '技术深度',
  structure: '结构表达',
  reflection: '反思复盘',
};

export function dimensionLabel(key: string) {
  return DIM_LABEL[key] ?? key;
}

/** 确定性评分器：同一回答永远得到相同分数，避免"AI 打分随机" */
export function scoreAnswer(answer: string, dimension: string): TurnScore {
  const text = answer.trim();
  const len = text.length;
  const numbers = (text.match(/\d+(\.\d+)?\s*(%|ms|s|秒|万|k|K|个|人|倍|天|小时|次|条|页|分)/g) ?? []).length;
  const hasDigit = /\d/.test(text);
  const vague = /(很多|比较好|大概|差不多|一些|有点|可能|应该|算是|还行|感觉)/.test(text);
  const techHits = TECH_TERMS.filter((t) => text.toLowerCase().includes(t)).length;
  const causal = /(因为|所以|因此|通过|采用|为了|权衡|对比|原因|考虑到|取舍)/.test(text);
  const structured = /(首先|其次|最后|第一|第二|第三|1\.|2\.|①|②|③|一是|二是)/.test(text);
  const reflective = /(复盘|不足|改进|下次|教训|踩坑|反思|如果重来|后续)/.test(text);
  const sentences = text.split(/[。！？!?；;\n]/).filter((s) => s.trim().length > 3).length;

  const relevance = clamp(
    42 + Math.min(28, len / 8) + (len > 60 ? 14 : 0) - (len < 25 ? 24 : 0),
  );
  const evidence = clamp(35 + numbers * 15 + (hasDigit ? 10 : 0) - (vague && numbers === 0 ? 14 : 0));
  const depth = clamp(32 + techHits * 8 + (causal ? 13 : 0));
  const structure = clamp(38 + (structured ? 30 : 0) + (sentences >= 2 && sentences <= 6 ? 15 : 0));
  const reflection = clamp(34 + (reflective ? 36 : 0) + (causal ? 6 : 0));

  const total = clamp(
    relevance * 0.3 + evidence * 0.25 + depth * 0.25 + structure * 0.1 + reflection * 0.1,
  );

  const reasons: string[] = [];
  if (len < 40) reasons.push('回答偏短，未展开细节，面试官难以判断真实水平');
  if (numbers === 0) reasons.push('没有任何量化数据，成果无法归因');
  if (vague && numbers === 0) reasons.push('使用了模糊表述（如"很多""比较好"），削弱可信度');
  if (techHits < 2) reasons.push('技术细节不足，只停留在"做了什么"层面');
  if (!causal) reasons.push('缺少选型与权衡的原因说明');
  if (!structured) reasons.push('表达未分点，逻辑层次不清晰');
  if (!reflective) reasons.push('缺少反思与改进视角');
  if (!reasons.length) reasons.push('表达完整、有数据支撑，是一段高质量回答');

  const evidenceSource = text.match(/[^。！？!?\n]*\d[^。！？!?\n]*/)?.[0] ?? text.slice(0, 46);

  return {
    relevance,
    evidence,
    depth,
    structure,
    reflection,
    total,
    reasons: reasons.slice(0, 3),
    evidenceQuote: evidenceSource.slice(0, 70),
  };
}

function trailingProbeDepth(turns: InterviewTurn[]): number {
  let depth = 0;
  for (let i = turns.length - 1; i >= 0; i -= 1) {
    const t = turns[i];
    if (t.role !== 'interviewer') continue;
    if (t.probeReason) depth += 1;
    else break;
  }
  return depth;
}

function weakestDimension(weakness: Record<string, number>): string {
  const keys = ['relevance', 'evidence', 'depth', 'structure', 'reflection'];
  return keys.reduce((a, b) => ((weakness[a] ?? 70) <= (weakness[b] ?? 70) ? a : b));
}

function fillTemplate(text: string, job: Job, profile: ResumeProfile, seed: number): string {
  const tech = job.skills[seed % Math.max(1, job.skills.length)] ?? '这个技术';
  const project = profile.projects[seed % Math.max(1, profile.projects.length)]?.name ?? '你的项目';
  return text.replace('{tech}', tech).replace('{project}', project);
}

function extractTopic(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const tech = TECH_TERMS.find((t) => clean.toLowerCase().includes(t));
  if (tech) return tech;
  // 取第一个有实质内容的短句片段（6-20字）
  const parts = clean.split(/[，,。；;、]/).map((s) => s.trim()).filter(Boolean);
  const meaningful = parts.find((p) => p.length >= 4 && p.length <= 20);
  if (meaningful) return meaningful;
  return clean.slice(0, 16);
}

export function buildOpening(
  job: Job,
  profile: ResumeProfile,
  weakness: Record<string, number> = {},
): { content: string; targetDimension: string } {
  const weak = Object.entries(weakness)
    .filter(([, v]) => v < 65)
    .sort((a, b) => a[1] - b[1]);

  const memory =
    weak.length > 0
      ? `先说一句：上次模拟面试里，你在「${dimensionLabel(weak[0][0])}」这一项只有 ${Math.round(weak[0][1])} 分，这次我会重点验证这一块。\n\n`
      : '';

  return {
    content: `${memory}你好，我是本次「${job.title}」岗位的模拟面试官。面试大概 8 轮，我会顺着你的回答往下追问，不需要背标准答案。\n\n我们先从自我介绍开始：请用 2 分钟讲讲你和这个岗位最相关的一段经历。`,
    targetDimension: 'relevance',
  };
}

export interface InterviewStep {
  question: string;
  score: TurnScore;
  state: SessionState;
  targetDimension: string;
  probeReason?: string;
  finished: boolean;
  weaknessPatch: Record<string, number>;
}

function pickQuestion(
  job: Job,
  profile: ResumeProfile,
  session: InterviewSession,
  dimension: string,
): QuestionItem {
  const query = `${job.title} ${job.skills.join(' ')} ${DIM_LABEL[dimension] ?? ''}`;
  const retrieved = retrieveQuestions(query, { category: job.category, dimension, topK: 6 }).map(
    (x) => x.item,
  );
  const pool = retrieved.length ? retrieved : QUESTIONS.filter((q) => q.categories.includes(job.category));
  const consulted = session.turns.filter((t) => t.role === 'interviewer' && !t.probeReason).length;
  return pool[consulted % pool.length];
}

export function stepInterview(args: {
  session: InterviewSession;
  job: Job;
  profile: ResumeProfile;
  answer: string;
}): InterviewStep {
  const { session, job, profile, answer } = args;
  const prev = [...session.turns].reverse().find((t) => t.role === 'interviewer');
  const dimension = prev?.targetDimension ?? 'evidence';
  const score = scoreAnswer(answer, dimension);

  const answered = session.turns.filter((t) => t.role === 'candidate').length + 1;
  const max = session.maxRounds;
  const weaknessPatch: Record<string, number> = { [dimension]: score.total };

  const state: SessionState =
    answered >= max
      ? 'end'
      : answered <= 1
        ? 'warmup'
        : answered <= max - 3
          ? 'deep_dive'
          : answered < max
            ? 'stress'
            : 'candidate_qa';

  if (answered >= max) {
    return {
      question:
        '时间差不多了，今天的面试到这里。整体表现我会整理成一份复盘报告：包括每一轮的评分、扣分理由，以及下一步最该补的三件事。\n\n谢谢你的时间，辛苦了。',
      score,
      state: 'end',
      targetDimension: dimension,
      finished: true,
      weaknessPatch,
    };
  }

  const probeDepth = trailingProbeDepth(session.turns);
  const needProbe = probeDepth < 2 && (score.evidence < 62 || score.depth < 62);
  const quote = score.evidenceQuote || answer.slice(0, 30);
  const topic = extractTopic(answer);

  if (needProbe && answer.trim().length > 0) {
    const probe =
      score.evidence < score.depth
        ? `你提到「${quote}」，这里有没有具体的数据？比如优化前后的指标对比、影响的用户量或效率提升比例。`
        : `你提到「${quote}」，能展开说说具体是怎么实现的吗？当时为什么选这个方案，而不是另一种？`;
    return {
      question: probe,
      score,
      state,
      targetDimension: dimension,
      probeReason:
        score.evidence < score.depth
          ? '上一轮回答缺少量化证据，触发追问'
          : '上一轮回答停留在结论层，未说明实现与选型，触发追问',
      finished: false,
      weaknessPatch,
    };
  }

  const weak = weakestDimension({ ...session.weakness, ...weaknessPatch });
  const pick = pickQuestion(job, profile, session, state === 'stress' ? dimension : weak);
  const consulted = session.turns.filter((t) => t.role === 'interviewer' && !t.probeReason).length;
  let content = fillTemplate(pick.text, job, profile, consulted);

  // 切换考察点时先接住候选人上一轮的回答，避免"跳到无关话题"的割裂感
  if (topic && answer.trim().length > 0) {
    content = `你刚才提到了「${topic}」。接下来换个角度：${content}`;
  }

  if (state === 'stress') {
    content = `（语气放缓）我再确认一下：` + content;
  }
  if (state === 'candidate_qa') {
    content = '最后，你有什么想问我的吗？比如团队情况、业务方向、技术栈，都可以问。';
  }

  return {
    question: content,
    score,
    state,
    targetDimension: state === 'candidate_qa' ? 'relevance' : pick.dimension,
    finished: false,
    weaknessPatch,
  };
}

export function createSession(jobId: string, maxRounds: number, mode: 'text' | 'voice'): InterviewSession {
  return {
    id: uid(),
    jobId,
    createdAt: Date.now(),
    state: 'intro',
    turns: [],
    weakness: {},
    maxRounds,
    finished: false,
    mode,
  };
}
