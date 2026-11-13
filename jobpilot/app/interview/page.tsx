'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Layers,
  Mic,
  MessageSquareCode,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { JOBS, getJob, getJobTitle } from '@/lib/data/jobs';
import { dimsLabel } from '@/lib/labels';
import { createSession } from '@/lib/ai/interview';
import { Card, EmptyState, Meter, SectionTitle } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';

const ROUND_OPTIONS = [6, 8, 10];

export default function InterviewConfigPage() {
  const router = useRouter();
  const { profile, resumeText, targetJobId, sessions, weakness, setTargetJob, saveSession } = useApp();
  const [jobId, setJobId] = useState(targetJobId ?? 'fe-01');
  const [rounds, setRounds] = useState(8);
  const [mode, setMode] = useState<'text' | 'voice'>('text');

  const job = getJob(jobId) ?? JOBS[0];
  const finished = useMemo(() => sessions.filter((s) => s.finished), [sessions]);
  const weakDims = useMemo(
    () =>
      Object.entries(weakness)
        .sort((a, b) => a[1].score - b[1].score)
        .slice(0, 3),
    [weakness],
  );

  if (!profile || !resumeText) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<FileText size={20} />}
          title="先导入简历，才能开始面试"
          desc="面试官会读取你的项目经历并顺着回答追问。没有简历，追问就没有依据。"
          action={
            <Link href="/resume" className="btn-primary px-4 py-2.5">
              去导入简历
              <ArrowRight size={15} />
            </Link>
          }
        />
      </div>
    );
  }

  function start() {
    const session = createSession(job.id, rounds, mode);
    setTargetJob(job.id);
    saveSession(session);
    router.push(`/interview/${session.id}`);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight">模拟面试</h1>
        <p className="mt-1 text-[13px] text-ink-500">
          选择一个岗位，面试官会基于你的简历提问，并根据回答质量决定是否追问。
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <SectionTitle title="选择面试岗位" desc="岗位决定考察点与题库范围" />
          <div className="grid max-h-[320px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
            {JOBS.map((j) => (
              <button
                key={j.id}
                onClick={() => setJobId(j.id)}
                className={cn(
                  'rounded-xl border p-3 text-left transition',
                  jobId === j.id
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/10'
                    : 'border-ink-200 bg-white hover:border-ink-300',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[13px] font-semibold leading-snug">{j.title}</span>
                  {jobId === j.id && <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand-500" />}
                </div>
                <div className="mt-1 text-[11px] text-ink-400">
                  {j.category} · {j.location} · {j.salary}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label">面试轮数</label>
              <div className="flex gap-2">
                {ROUND_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setRounds(n)}
                    className={cn(
                      'flex-1 rounded-[10px] border py-2 text-[13px] font-medium transition',
                      rounds === n
                        ? 'border-brand-500 bg-brand-500 text-white'
                        : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300',
                    )}
                  >
                    {n} 轮
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">作答方式</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('text')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border py-2 text-[13px] transition',
                    mode === 'text'
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-ink-200 bg-white text-ink-600',
                  )}
                >
                  <MessageSquareCode size={14} />
                  文字
                </button>
                <button
                  onClick={() => setMode('voice')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border py-2 text-[13px] transition',
                    mode === 'voice'
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-ink-200 bg-white text-ink-600',
                  )}
                >
                  <Mic size={14} />
                  语音
                </button>
              </div>
              {mode === 'voice' && (
                <p className="mt-1.5 text-[11px] text-ink-400">
                  使用浏览器语音识别；不支持时自动降级为文字输入。
                </p>
              )}
            </div>
          </div>

          <button className="btn-primary mt-6 w-full py-3" onClick={start}>
            <Sparkles size={16} />
            开始面试（{rounds} 轮 · {job.category}）
          </button>
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionTitle title="本场考察重点" />
            <div className="rounded-xl bg-ink-50 p-3">
              <p className="text-[12.5px] font-semibold">{job.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-500">
                {job.responsibilities.join('；')}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {weakDims.length ? (
                weakDims.map(([dim, node]) => (
                  <Meter key={dim} label={dimsLabel(dim)} value={node.score} hint="来自历史面试" />
                ))
              ) : (
                <p className="text-[12px] leading-relaxed text-ink-400">
                  还没有历史能力数据。第一场面试会建立初始能力图谱，之后每场都会针对弱项加大考察。
                </p>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-2 text-[11px] text-brand-700">
              <Layers size={13} />
              追问最多 2 层，评分使用固定 rubric
            </div>
          </Card>

          <Card>
            <SectionTitle title="历史面试" desc="点击查看复盘" />
            {finished.length ? (
              <ul className="space-y-2">
                {finished.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/interview/${s.id}/report`}
                      className="flex items-center justify-between rounded-lg border border-ink-100 px-3 py-2 text-[12px] hover:border-ink-200"
                    >
                      <span className="truncate">{getJobTitle(s.jobId)}</span>
                      <span className="ml-2 shrink-0 text-ink-400">{formatDate(s.createdAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-ink-400">还没有完成的面试记录。</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
