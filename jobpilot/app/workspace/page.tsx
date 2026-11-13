'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileText,
  MessageSquareCode,
  Route,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { getJobTitle } from '@/lib/data/jobs';
import { dimsLabel } from '@/lib/labels';
import { Card, Meter, SectionTitle } from '@/components/ui';
import { RadarChart } from '@/components/radar';
import { cn, formatDate } from '@/lib/utils';

const DIMS = ['relevance', 'evidence', 'depth', 'structure', 'reflection'];

export default function WorkspacePage() {
  const { profile, diagnosis, sessions, tasks, weakness } = useApp();
  const finished = sessions.filter((s) => s.finished);
  const last = finished[0];
  const doneTasks = tasks.filter((t) => t.done).length;

  const steps = [
    {
      icon: FileText,
      title: '导入并诊断简历',
      desc: profile ? `${profile.name} · ${profile.skills.length} 项技能` : '上传或粘贴一份简历',
      href: '/resume',
      done: Boolean(profile && diagnosis),
      cta: profile ? (diagnosis ? '重新诊断' : '生成诊断') : '导入简历',
    },
    {
      icon: Briefcase,
      title: '查看可解释匹配',
      desc: '逐条命中 / 半命中 / 缺口',
      href: '/jobs',
      done: Boolean(profile),
      cta: '去岗位中心',
    },
    {
      icon: MessageSquareCode,
      title: '完成一场模拟面试',
      desc: finished.length ? `已完成 ${finished.length} 场` : '至少 8 轮追问',
      href: '/interview',
      done: finished.length > 0,
      cta: finished.length ? '再面一场' : '开始面试',
    },
    {
      icon: Route,
      title: '补齐短板',
      desc: tasks.length ? `${doneTasks}/${tasks.length} 项任务完成` : '把失分点变成任务',
      href: '/plan',
      done: tasks.length > 0,
      cta: '去成长中心',
    },
  ];

  const next =
    !profile
      ? { text: '第一步：导入简历，3 分钟拿到诊断', href: '/resume', cta: '导入简历' }
      : !diagnosis
        ? { text: '简历已就绪，先选定目标岗位生成诊断', href: '/resume', cta: '生成诊断' }
        : finished.length === 0
          ? { text: '诊断完成，去模拟面试验证真实水平', href: '/interview', cta: '开始模拟面试' }
          : tasks.length === 0
            ? { text: '面试有结果了，把失分点转成学习任务', href: `/interview/${last?.id}/report`, cta: '查看复盘' }
            : { text: '继续补齐短板，完成后再面一场验证', href: '/plan', cta: '继续学习' };

  const radarData = DIMS.map((k) => ({
    label: dimsLabel(k).replace('与', ''),
    value: weakness[k]?.score ?? 60,
  }));

  const doneSteps = steps.filter((s) => s.done).length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">工作台 · Workspace</span>
          <h1 className="mt-1.5 text-[24px] font-semibold tracking-tight">
            {profile ? `${profile.name}，欢迎回来` : '欢迎来到职途 JobPilot'}
          </h1>
          <p className="mt-1 text-[13px] text-ink-500">
            {profile
              ? `目标岗位：${profile.targetRole} · 数据只保存在本机`
              : '一个有记忆、会追问、能陪跑的 AI 求职 Agent'}
          </p>
        </div>
        <Link href={next.href} className="btn-primary px-4 py-2 text-[13px]">
          {next.cta}
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mb-5 overflow-hidden rounded-xl2 border border-brand-200/70 bg-gradient-to-br from-brand-50 via-white to-white p-5 shadow-[0_1px_2px_rgba(14,18,34,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white shadow-[0_8px_16px_-8px_rgba(47,75,255,0.7)]">
              <Sparkles size={16} />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-500">
                下一步建议
              </p>
              <p className="mt-0.5 text-[14px] font-semibold">{next.text}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10.5px] text-ink-400">链路进度</p>
              <p className="text-[15px] font-semibold tabular-nums">
                {doneSteps}
                <span className="text-[11px] font-normal text-ink-400"> / 4 步</span>
              </p>
            </div>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white ring-1 ring-inset ring-brand-200/70">
              <div
                className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
                style={{ width: `${(doneSteps / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {steps.map((s, i) => (
          <Link
            key={s.title}
            href={s.href}
            className="card group p-4 transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  'grid h-8 w-8 place-items-center rounded-lg',
                  s.done ? 'bg-hit/10 text-hit' : 'bg-brand-50 text-brand-500',
                )}
              >
                {s.done ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
              </span>
              <span className="text-[10px] font-semibold text-ink-300">0{i + 1}</span>
            </div>
            <h3 className="mt-3 text-[13.5px] font-semibold">{s.title}</h3>
            <p className="mt-0.5 truncate text-[11.5px] text-ink-400">{s.desc}</p>
            <div className="mt-3 inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-600">
              {s.cta}
              <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <Card>
          <SectionTitle
            title="最近面试"
            desc={finished.length ? '每一场都可回放、可归因' : '完成面试后会出现在这里'}
            right={
              <Link href="/interview" className="text-[12px] font-medium text-brand-600">
                全部 →
              </Link>
            }
          />
          {finished.length ? (
            <div className="space-y-2">
              {finished.slice(0, 5).map((s) => {
                const scored = s.turns.filter((t) => t.role === 'candidate' && t.score);
                const avg = scored.length
                  ? Math.round(scored.reduce((x, t) => x + t.score!.total, 0) / scored.length)
                  : 0;
                return (
                  <Link
                    key={s.id}
                    href={`/interview/${s.id}/report`}
                    className="flex items-center gap-3 rounded-xl border border-ink-100 px-3 py-2.5 transition hover:border-ink-200 hover:bg-ink-50/60"
                  >
                    <span
                      className={cn(
                        'grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[12px] font-semibold',
                        avg >= 70 ? 'bg-hit/10 text-hit' : avg >= 55 ? 'bg-brand-50 text-brand-600' : 'bg-partial/10 text-partial',
                      )}
                    >
                      {avg}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{getJobTitle(s.jobId)}</p>
                      <p className="text-[11px] text-ink-400">
                        {formatDate(s.createdAt)} · {scored.length} 轮
                      </p>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-ink-300" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl bg-ink-50 px-4 py-8 text-center">
              <p className="text-[12.5px] text-ink-500">还没有完成的面试记录</p>
              <Link href="/interview" className="btn-soft mt-3 px-3 py-1.5 text-xs">
                开始第一场
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle title="能力图谱" desc="跨会话累计" />
          <div className="flex justify-center">
            <RadarChart data={radarData} size={218} />
          </div>
          <div className="mt-3 space-y-2.5">
            {DIMS.map((k) => (
              <Meter key={k} label={dimsLabel(k)} value={weakness[k]?.score ?? 60} />
            ))}
          </div>
          {!Object.keys(weakness).length && (
            <p className="mt-3 text-center text-[11px] text-ink-400">
              完成面试后生成真实能力数据
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
