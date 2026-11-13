'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle2, Circle, Loader2, Route, Sparkles, Target } from 'lucide-react';
import { useApp } from '@/lib/store';
import { dimsLabel } from '@/lib/labels';
import { Card, EmptyState, Meter, SectionTitle } from '@/components/ui';
import { RadarChart } from '@/components/radar';
import { cn } from '@/lib/utils';

const DIMS = ['relevance', 'evidence', 'depth', 'structure', 'reflection'];

export default function PlanPage() {
  const { weakness, tasks, addTasks, toggleTask } = useApp();
  const [planning, setPlanning] = useState(false);

  const dims = DIMS.map((k) => ({ key: k, label: dimsLabel(k), value: weakness[k]?.score ?? 60 }));
  const doneCount = tasks.filter((t) => t.done).length;

  async function generate() {
    setPlanning(true);
    try {
      const res = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weakness: Object.fromEntries(dims.map((d) => [d.key, d.value])) }),
      });
      const data = (await res.json()) as { tasks?: Parameters<typeof addTasks>[0] };
      if (data.tasks) addTasks(data.tasks);
    } finally {
      setPlanning(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">成长中心</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            你的能力图谱与学习任务。所有数据来自真实面试评分，不是自评。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/workspace" className="btn-ghost px-4 py-2 text-[13px]">
            <ArrowLeft size={14} />
            返回工作台
          </Link>
          <button onClick={generate} disabled={planning} className="btn-primary px-4 py-2 text-[13px]">
            {planning ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            按当前弱点生成任务
          </button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
        <div className="space-y-5">
          <Card>
            <SectionTitle title="能力图谱" desc="跨会话累计 · 虚线为基准 70" />
            <div className="flex justify-center">
              <RadarChart data={dims.map((d) => ({ label: d.label.replace('与', ''), value: d.value }))} size={260} />
            </div>
            <div className="mt-4 space-y-3">
              {dims.map((d) => (
                <Meter
                  key={d.key}
                  label={d.label}
                  value={d.value}
                  hint={
                    weakness[d.key]?.history.length
                      ? `历史：${weakness[d.key].history.join(' → ')}`
                      : '暂无历史记录'
                  }
                />
              ))}
            </div>
          </Card>

          <Card>
            <SectionTitle title="任务进度" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">{doneCount}</span>
              <span className="text-[13px] text-ink-400">/ {tasks.length} 项已完成</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-100">
              <div
                className="h-full rounded-full bg-hit transition-[width] duration-500"
                style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-400">
              任务完成后，建议再面一场同岗位面试验证提升。
            </p>
            <Link href="/interview" className="btn-ghost mt-3 w-full py-2 text-xs">
              去验证
            </Link>
          </Card>
        </div>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <EmptyState
              icon={<Route size={20} />}
              title="还没有学习任务"
              desc="完成一场模拟面试后，系统会把失分点自动转成具体任务；也可以直接按当前弱点生成。"
              action={
                <div className="flex gap-2">
                  <Link href="/interview" className="btn-primary px-4 py-2.5">
                    先去面试
                  </Link>
                  <button onClick={generate} className="btn-ghost px-4 py-2.5">
                    按弱点生成
                  </button>
                </div>
              }
            />
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className={cn('transition', task.done && 'opacity-60')}>
                <div className="flex gap-3">
                  <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                    {task.done ? (
                      <CheckCircle2 size={19} className="text-hit" />
                    ) : (
                      <Circle size={19} className="text-ink-300 hover:text-brand-500" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={cn('text-[14px] font-semibold', task.done && 'line-through')}>
                        {task.title}
                      </h3>
                      <span className="chip text-[10px]">{task.dimension}</span>
                    </div>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{task.detail}</p>
                    {task.resources.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        {task.resources.map((r) => (
                          <div
                            key={r.title}
                            className="flex items-center gap-2 rounded-lg bg-ink-50 px-2.5 py-1.5 text-[11.5px] text-ink-600"
                          >
                            <BookOpen size={12} className="shrink-0 text-brand-500" />
                            <span className="truncate">{r.title}</span>
                            <span className="ml-auto shrink-0 text-[10px] text-ink-400">{r.source}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}

          {tasks.length > 0 && (
            <div className="flex items-start gap-3 rounded-xl2 border border-ink-200/70 bg-white p-4">
              <Target size={16} className="mt-0.5 shrink-0 text-brand-500" />
              <p className="text-[12px] leading-relaxed text-ink-500">
                任务资料来自本地题库 RAG 检索，按你的弱点维度排序；每一条都能回溯到具体维度与历史得分。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
