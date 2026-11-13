'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
} from 'lucide-react';
import { getClientApiKey, useApp } from '@/lib/store';
import { getJob } from '@/lib/data/jobs';
import { dimensionLabel } from '@/lib/ai/interview';
import type { InterviewSession, InterviewTurn } from '@/lib/types';
import { Card, ScoreRing, SectionTitle } from '@/components/ui';
import { RadarChart } from '@/components/radar';
import { cn, uid } from '@/lib/utils';

const DIMS = [
  { key: 'relevance', label: '内容相关性' },
  { key: 'evidence', label: '量化与证据' },
  { key: 'depth', label: '技术深度' },
  { key: 'structure', label: '结构表达' },
  { key: 'reflection', label: '反思复盘' },
];

export default function InterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params.id);

  const session = useApp((s) => s.sessions.find((x) => x.id === id));
  const profile = useApp((s) => s.profile);
  const weakness = useApp((s) => s.weakness);
  const saveSession = useApp((s) => s.saveSession);
  const mergeWeakness = useApp((s) => s.mergeWeakness);

  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState('');
  const [tool, setTool] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');
  const [listening, setListening] = useState(false);

  const started = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  const call = useCallback(
    async (current: InterviewSession, answer: string) => {
      setBusy(true);
      setError('');
      setStreaming('');
      setPending(answer);
      try {
        const res = await fetch('/api/interview/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session: current,
            jobId: current.jobId,
            profile,
            answer,
            apiKey: getClientApiKey(),
          }),
        });
        if (!res.ok) throw new Error('面试服务暂时不可用');

        // 一次性读取完整响应体再按行解析，避免流式读取在 React 重渲染时被中断
        const raw = await res.text();
        let acc = '';
        let meta: Record<string, unknown> | null = null;
        for (const line of raw.split('\n')) {
          if (!line.trim()) continue;
          let evt: Record<string, unknown>;
          try {
            evt = JSON.parse(line) as Record<string, unknown>;
          } catch {
            continue;
          }
          if (evt.t === 'token') {
            acc += String(evt.v ?? '');
          } else if (evt.t === 'tool') {
            setTool(String(evt.label ?? ''));
          } else if (evt.t === 'meta') {
            meta = evt;
          } else if (evt.t === 'error') {
            throw new Error(String(evt.message ?? '生成失败'));
          }
        }
        if (acc) setStreaming(acc);

        if (!meta) throw new Error('未收到面试官回复');

        const turns: InterviewTurn[] = [...current.turns];
        if (answer.trim()) {
          turns.push({
            id: uid(),
            index: turns.length + 1,
            role: 'candidate',
            content: answer,
            score: (meta.score as InterviewTurn['score']) ?? undefined,
          });
        }
        turns.push({
          id: uid(),
          index: turns.length + 1,
          role: 'interviewer',
          content: acc,
          targetDimension: String(meta.targetDimension ?? 'relevance'),
          probeReason: meta.probeReason ? String(meta.probeReason) : undefined,
        });

        saveSession({
          ...current,
          turns,
          state: (meta.state as InterviewSession['state']) ?? current.state,
          finished: Boolean(meta.finished),
        });

        if (meta.weaknessPatch && typeof meta.weaknessPatch === 'object') {
          mergeWeakness(meta.weaknessPatch as Record<string, number>);
        }

        if (current.mode === 'voice') speak(acc);
        setStreaming('');
        setPending('');
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setError(e instanceof Error ? e.message : '生成失败，请重试');
        } else {
          // 请求被中断（如 StrictMode 双挂载）时允许开场重试
          started.current = false;
        }
      } finally {
        setBusy(false);
        setTool('');
      }
    },
    [profile, saveSession, mergeWeakness],
  );

  useEffect(() => {
    if (!session || !profile) return;
    if (session.turns.length === 0 && !started.current) {
      started.current = true;
      void call(session, '');
    }
  }, [session, profile, call]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [session?.turns.length, streaming]);

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="text-center">
          <p className="text-[14px] font-semibold">没有找到这场面试</p>
          <p className="mt-1 text-[12.5px] text-ink-500">会话可能已被清除，或链接已过期。</p>
          <Link href="/interview" className="btn-primary mt-4 px-4 py-2">
            重新开始
            <ArrowRight size={14} />
          </Link>
        </Card>
      </div>
    );
  }

  const job = getJob(session.jobId);
  const answered = session.turns.filter((t) => t.role === 'candidate').length;
  const progress = Math.min(100, Math.round((answered / session.maxRounds) * 100));
  const lastInterviewer = [...session.turns].reverse().find((t) => t.role === 'interviewer');
  const currentDim = lastInterviewer?.targetDimension ?? 'relevance';

  const radarData = DIMS.map((d) => ({
    label: d.label.replace('与', ''),
    value: weakness[d.key]?.score ?? 60,
  }));

  function send() {
    if (!input.trim() || busy || session!.finished) return;
    // 开场问题还没保存到会话前，不允许发送，避免开场丢失或重复
    if (session!.turns.length === 0) return;
    const answer = input.trim();
    setInput('');
    void call(session!, answer);
  }

  function toggleMic() {
    const w = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) {
      setError('当前浏览器不支持语音识别，请使用文字作答');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = 'zh-CN';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i += 1) {
        text += e.results[i][0].transcript;
      }
      setInput(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[18px] font-semibold">{job?.title ?? '模拟面试'}</h1>
            <span className="chip text-[10px]">
              {answered}/{session.maxRounds} 轮
            </span>
            {session.finished && (
              <span className="chip border-hit/20 bg-hit/10 text-hit">
                <CheckCircle2 size={11} /> 已完成
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[12px] text-ink-400">
            模拟面试官会顺着你的回答追问 · 评分使用固定 rubric
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-ink-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {session.finished ? (
            <Link href={`/interview/${session.id}/report`} className="btn-primary px-3 py-1.5 text-xs">
              查看复盘
              <ArrowRight size={13} />
            </Link>
          ) : (
            <button
              className="btn-ghost px-3 py-1.5 text-xs"
              onClick={() => {
                saveSession({ ...session, finished: true });
                router.push(`/interview/${session.id}/report`);
              }}
            >
              结束并复盘
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-gap/20 bg-gap/5 px-4 py-2.5 text-[12.5px] text-gap">
          <span>{error}</span>
          <button
            className="inline-flex items-center gap-1 font-medium"
            onClick={() => {
              setError('');
              if (pending) void call(session, pending);
              else void call(session, '');
            }}
          >
            <RotateCcw size={13} />
            重试
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[248px_1fr_264px]">
        {/* left */}
        <div className="order-2 hidden space-y-4 lg:order-1 lg:block">
          <Card className="p-4">
            <SectionTitle title="能力雷达" desc="随面试动态更新" />
            <div className="flex justify-center">
              <RadarChart data={radarData} size={212} />
            </div>
            <p className="mt-2 text-center text-[10.5px] text-ink-400">虚线为岗位基准 70 分</p>
          </Card>

          <Card className="p-4">
            <SectionTitle title="评分维度" />
            <div className="space-y-2.5">
              {DIMS.map((d) => {
                const v = weakness[d.key]?.score ?? 60;
                return (
                  <div key={d.key}>
                    <div className="flex justify-between text-[11.5px]">
                      <span className="text-ink-600">{d.label}</span>
                      <span className="font-semibold tabular-nums text-ink-500">{Math.round(v)}</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-ink-100">
                      <div
                        className={cn(
                          'h-1 rounded-full transition-all duration-700',
                          v >= 75 ? 'bg-hit' : v >= 55 ? 'bg-brand-500' : 'bg-partial',
                        )}
                        style={{ width: `${Math.max(3, v)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* chat */}
        <div className="order-1 flex min-h-[560px] flex-col rounded-xl2 border border-ink-200/70 bg-white shadow-card lg:order-2">
          <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5" style={{ maxHeight: '62vh' }}>
            {session.turns.map((turn) => (
              <MessageBubble key={turn.id} turn={turn} />
            ))}

            {pending && !session.turns.some((t) => t.role === 'candidate' && t.content === pending) && (
              <div className="flex justify-end">
                <div className="max-w-[86%] rounded-2xl rounded-br-md bg-brand-50 px-4 py-2.5 text-[13px] leading-relaxed text-brand-800">
                  {pending}
                </div>
              </div>
            )}

            {(streaming || busy) && (
              <div className="flex gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500 text-[11px] font-semibold text-white">
                  面
                </span>
                <div className="max-w-[86%]">
                  {tool && !streaming && (
                    <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-lg bg-ink-50 px-2.5 py-1 text-[11px] text-ink-500">
                      <Loader2 size={11} className="animate-spin" />
                      {tool}
                    </div>
                  )}
                  <div className="rounded-2xl rounded-tl-md border border-ink-200 bg-white px-4 py-2.5 text-[13px] leading-relaxed text-ink-700">
                    {streaming ? <span className="caret whitespace-pre-wrap">{streaming}</span> : <span className="text-ink-400">正在思考…</span>}
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {session.finished ? (
            <div className="border-t border-ink-100 p-4">
              <div className="flex flex-col items-center gap-3 rounded-xl bg-ink-50 p-4 text-center sm:flex-row sm:text-left">
                <CheckCircle2 className="text-hit" size={20} />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold">这场面试结束了</p>
                  <p className="text-[11.5px] text-ink-500">
                    复盘报告会标出每一处失分点，并给出下一步任务。
                  </p>
                </div>
                <Link href={`/interview/${session.id}/report`} className="btn-primary px-4 py-2 text-[13px]">
                  查看复盘报告
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="border-t border-ink-100 p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={2}
                  placeholder={session.turns.length === 0 ? '面试官开场中，请稍候…' : '用你的真实经历回答，尽量带上具体数据…（Enter 发送，Shift+Enter 换行）'}
                  className="input min-h-[52px] resize-none"
                  disabled={busy}
                />
                <button
                  onClick={toggleMic}
                  className={cn(
                    'btn h-[52px] w-[52px] shrink-0 rounded-[10px] border',
                    listening
                      ? 'border-gap/30 bg-gap/10 text-gap'
                      : 'border-ink-200 bg-white text-ink-500 hover:bg-ink-50',
                  )}
                  title={listening ? '停止录音' : '语音输入'}
                >
                  {listening ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
                <button
                  onClick={send}
                  disabled={busy || !input.trim() || session.turns.length === 0}
                  className="btn-primary h-[52px] w-[52px] shrink-0 rounded-[10px]"
                >
                  {busy ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
                </button>
              </div>
              <p className="mt-1.5 px-1 text-[10.5px] text-ink-400">
                评分只针对回答内容，不对个人做任何评价。
              </p>
            </div>
          )}
        </div>

        {/* right */}
        <div className="order-3 hidden space-y-4 lg:block">
          <Card className="p-4">
            <SectionTitle title="当前考察点" />
            <div className="rounded-xl bg-brand-50 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-500">
                {dimensionLabel(currentDim)}
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-brand-800">
                {DIM_HINT[currentDim] ?? '结合简历与岗位要求作答'}
              </p>
            </div>
            {lastInterviewer?.probeReason && (
              <div className="mt-3 rounded-xl border border-partial/20 bg-partial/5 p-3">
                <p className="text-[10px] font-semibold text-partial">触发追问</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-600">
                  {lastInterviewer.probeReason}
                </p>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <SectionTitle title="最近一轮评分" />
            {(() => {
              const scored = [...session.turns].reverse().find((t) => t.score);
              if (!scored?.score) {
                return <p className="text-[12px] text-ink-400">完成第一轮回答后显示。</p>;
              }
              const s = scored.score;
              return (
                <div>
                  <div className="flex items-center gap-3">
                    <ScoreRing value={s.total} size={64} />
                    <div className="text-[11.5px] text-ink-500">
                      <div>相关 {s.relevance}</div>
                      <div>证据 {s.evidence}</div>
                      <div>深度 {s.depth}</div>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {s.reasons.map((r) => (
                      <li key={r} className="flex gap-1.5 text-[11.5px] leading-relaxed text-ink-500">
                        <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-partial" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </Card>

          <div className="flex items-center gap-2 rounded-xl border border-ink-200/70 bg-white px-3 py-2.5 text-[11px] text-ink-400">
            <BarChart3 size={13} className="text-brand-500" />
            追问不超过 2 层 · 状态机驱动
          </div>
        </div>
      </div>
    </div>
  );
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult:
    | ((e: { results: { length: number; [i: number]: { 0: { transcript: string } } } }) => void)
    | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

const DIM_HINT: Record<string, string> = {
  relevance: '回答要直接回应问题，并扣住岗位要求。',
  evidence: '用具体数字证明结果，避免"很多""比较好"。',
  depth: '说清实现细节与选型原因，而不只是结论。',
  structure: '结论先行，分 2–3 点展开。',
  reflection: '讲清不足、根因与下次改进。',
};

function MessageBubble({ turn }: { turn: InterviewTurn }) {
  if (turn.role === 'candidate') {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <div className="max-w-[86%] rounded-2xl rounded-br-md bg-brand-50 px-4 py-2.5 text-[13px] leading-relaxed text-brand-800">
          {turn.content}
        </div>
        {turn.score && (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                turn.score.total >= 70
                  ? 'bg-hit/10 text-hit'
                  : turn.score.total >= 55
                    ? 'bg-brand-50 text-brand-600'
                    : 'bg-partial/10 text-partial',
              )}
            >
              本轮 {turn.score.total}
            </span>
            {turn.score.reasons.slice(0, 1).map((r) => (
              <span key={r} className="text-[10.5px] text-ink-400">
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-500 text-[11px] font-semibold text-white">
        面
      </span>
      <div className="max-w-[86%]">
        {turn.probeReason && (
          <div className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-partial/10 px-2 py-0.5 text-[10px] font-medium text-partial">
            <Sparkles size={10} />
            追问 · {turn.probeReason}
          </div>
        )}
        <div className="whitespace-pre-wrap rounded-2xl rounded-tl-md border border-ink-200 bg-white px-4 py-2.5 text-[13px] leading-relaxed text-ink-700">
          {turn.content}
        </div>
      </div>
    </div>
  );
}

function speak(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 600));
    u.lang = 'zh-CN';
    u.rate = 1.02;
    window.speechSynthesis.speak(u);
  } catch {
    /* 语音播报失败不影响主流程 */
  }
}
