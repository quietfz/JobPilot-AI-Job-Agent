'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  Quote,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { getJob } from '@/lib/data/jobs';
import { dimensionLabel } from '@/lib/ai/interview';
import type { InterviewTurn } from '@/lib/types';
import { Card, EmptyState, Meter, ScoreRing, SectionTitle } from '@/components/ui';
import { RadarChart } from '@/components/radar';
import { cn, formatDate } from '@/lib/utils';

const DIMS = ['relevance', 'evidence', 'depth', 'structure', 'reflection'];

export default function ReportPage() {
  const params = useParams();
  const id = String(params.id);
  const session = useApp((s) => s.sessions.find((x) => x.id === id));
  const addTasks = useApp((s) => s.addTasks);
  const [planning, setPlanning] = useState(false);
  const [planned, setPlanned] = useState(false);

  const analysis = useMemo(() => {
    if (!session) return null;
    const scored = session.turns.filter((t) => t.role === 'candidate' && t.score);
    const avg = (key: keyof NonNullable<InterviewTurn['score']>) =>
      scored.length
        ? Math.round(
            (scored.reduce((s, t) => s + (t.score![key] as number), 0) / scored.length) * 10,
          ) / 10
        : 0;

    const dims = DIMS.map((k) => ({
      key: k,
      label: dimensionLabel(k),
      value: avg(k as keyof NonNullable<InterviewTurn['score']>),
    }));
    const total = scored.length
      ? Math.round(scored.reduce((s, t) => s + t.score!.total, 0) / scored.length)
      : 0;

    const timeline = session.turns
      .map((t, i) => {
        if (t.role !== 'interviewer') return null;
        const answer = session.turns.slice(i + 1).find((x) => x.role === 'candidate');
        return { question: t, answer };
      })
      .filter(Boolean) as { question: InterviewTurn; answer?: InterviewTurn }[];

    const weakest = [...dims].sort((a, b) => a.value - b.value).slice(0, 3);

    return { scored, dims, total, timeline, weakest };
  }, [session]);

  if (!session || !analysis) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={<Target size={20} />}
          title="没有找到这场面试"
          desc="面试记录保存在本地浏览器中，如果清理过数据则无法恢复。"
          action={
            <Link href="/interview" className="btn-primary px-4 py-2.5">
              开始新的面试
            </Link>
          }
        />
      </div>
    );
  }

  const job = getJob(session.jobId);
  const weaknessMap = Object.fromEntries(analysis.dims.map((d) => [d.key, Math.round(d.value)]));

  async function generatePlan() {
    setPlanning(true);
    try {
      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakness: weaknessMap, limit: 3 }),
      });
      const data = (await res.json()) as { tasks?: Parameters<typeof addTasks>[0] };
      if (data.tasks) {
        addTasks(data.tasks);
        setPlanned(true);
      }
    } finally {
      setPlanning(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">面试复盘</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            {job?.title} · {formatDate(session.createdAt)} · {analysis.scored.length} 轮有效回答
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/interview" className="btn-ghost px-3 py-1.5 text-xs">
            再面一场
          </Link>
          <button
            onClick={generatePlan}
            disabled={planning || planned}
            className="btn-primary px-3 py-1.5 text-xs"
          >
            {planning ? <Loader2 size={13} className="animate-spin" /> : <TrendingUp size={13} />}
            {planned ? '已生成学习任务' : '生成学习任务'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                  本场综合得分
                </p>
                <p className="mt-1 text-[12px] text-ink-500">
                  {analysis.total >= 70 ? '表现稳定，接近岗位基准' : '低于岗位基准，需要针对性补齐'}
                </p>
              </div>
              <ScoreRing value={analysis.total} size={84} />
            </div>
          </Card>

          <Card>
            <SectionTitle title="能力雷达" desc="虚线为岗位基准 70" />
            <div className="flex justify-center">
              <RadarChart
                data={analysis.dims.map((d) => ({ label: d.label.replace('与', ''), value: d.value }))}
                size={236}
              />
            </div>
          </Card>

          <Card>
            <SectionTitle title="维度明细" />
            <div className="space-y-3">
              {analysis.dims.map((d) => (
                <Meter key={d.key} label={d.label} value={d.value} />
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="Top 3 失分点" />
            <ul className="space-y-2">
              {analysis.weakest.map((w, i) => (
                <li key={w.key} className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2">
                  <span className="text-[11px] font-semibold text-ink-400">0{i + 1}</span>
                  <span className="flex-1 text-[12.5px] font-medium">{w.label}</span>
                  <span className="text-[12px] font-semibold text-partial">{Math.round(w.value)}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={generatePlan}
              disabled={planning || planned}
              className="btn-soft mt-3 w-full py-2 text-xs"
            >
              {planned ? <CheckCircle2 size={13} /> : <BrainCircuit size={13} />}
              {planned ? '任务已加入成长中心' : '把失分点变成学习任务'}
            </button>
            {planned && (
              <Link href="/plan" className="mt-2 block text-center text-[11.5px] text-brand-600">
                去成长中心查看 →
              </Link>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <SectionTitle
              title="面试时间轴"
              desc="问题 → 回答 → 评分 → 扣分理由，逐句可回溯"
            />
            <div className="space-y-4">
              {analysis.timeline.map((item, i) => (
                <div key={item.question.id} className="relative border-l border-ink-200 pl-5">
                  <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-semibold text-ink-400">第 {i + 1} 轮</span>
                    <span className="chip text-[10px]">
                      {dimensionLabel(item.question.targetDimension ?? 'relevance')}
                    </span>
                    {item.answer?.score && (
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10.5px] font-semibold',
                          item.answer.score.total >= 70
                            ? 'bg-hit/10 text-hit'
                            : item.answer.score.total >= 55
                              ? 'bg-brand-50 text-brand-600'
                              : 'bg-partial/10 text-partial',
                        )}
                      >
                        {item.answer.score.total} 分
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-800">
                    {item.question.content}
                  </p>
                  {item.question.probeReason && (
                    <p className="mt-1 text-[11px] text-partial">追问原因：{item.question.probeReason}</p>
                  )}

                  {item.answer ? (
                    <div className="mt-2 rounded-xl bg-ink-50 p-3">
                      <p className="text-[12.5px] leading-relaxed text-ink-600">{item.answer.content}</p>
                      {item.answer.score && (
                        <div className="mt-2 space-y-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              ['相关', item.answer.score.relevance],
                              ['证据', item.answer.score.evidence],
                              ['深度', item.answer.score.depth],
                              ['结构', item.answer.score.structure],
                              ['反思', item.answer.score.reflection],
                            ].map(([k, v]) => (
                              <span key={k as string} className="rounded bg-white px-1.5 py-0.5 text-[10.5px] text-ink-500">
                                {k} <span className="font-semibold text-ink-700">{v}</span>
                              </span>
                            ))}
                          </div>
                          {item.answer.score.reasons.map((r) => (
                            <p key={r} className="flex gap-1.5 text-[11.5px] leading-relaxed text-ink-500">
                              <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-partial" />
                              {r}
                            </p>
                          ))}
                          <p className="flex items-start gap-1.5 rounded-md bg-brand-50 px-2 py-1 text-[11px] text-brand-700">
                            <Quote size={11} className="mt-0.5 shrink-0" />
                            证据句：{item.answer.score.evidenceQuote}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-[11.5px] text-ink-400">本轮未作答</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="rounded-xl2 border border-brand-200/70 bg-brand-50/60 p-5">
            <div className="flex items-start gap-3">
              <BrainCircuit size={18} className="mt-0.5 shrink-0 text-brand-500" />
              <div>
                <p className="text-[13px] font-semibold text-brand-800">这场面试会被记住</p>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-600">
                  维度得分已写入你的能力图谱。下一场面试开场时，面试官会直接点出你最弱的维度并重点验证。
                </p>
                <Link href="/interview" className="btn-primary mt-3 px-3 py-1.5 text-xs">
                  再面一场验证
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
