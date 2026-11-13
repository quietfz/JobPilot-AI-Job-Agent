'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Briefcase,
  ChevronDown,
  FileText,
  MapPin,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { JOB_CATEGORIES, getJob } from '@/lib/data/jobs';
import type { MatchItem, MatchResult } from '@/lib/types';
import { Card, Citation, EmptyState, ScoreRing, SectionTitle, StateBadge } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function JobsPage() {
  const router = useRouter();
  const { resumeText, profile, setTargetJob } = useApp();
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('全部');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || !resumeText) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    fetch('/api/jobs/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: resumeText, profile }),
    })
      .then(async (res) => {
        const data = (await res.json()) as { results?: MatchResult[]; error?: string };
        if (!res.ok || !data.results) throw new Error(data.error ?? '匹配失败');
        if (!cancelled) setResults(data.results);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : '匹配失败');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, resumeText]);

  const visible = useMemo(() => {
    if (!results) return [];
    const list = category === '全部' ? results : results.filter((r) => getJob(r.jobId)?.category === category);
    return [...list].sort((a, b) => b.score - a.score);
  }, [results, category]);

  const stats = useMemo(() => {
    if (!results?.length) return null;
    const avg = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
    const strong = results.filter((r) => r.score >= 65).length;
    return { avg, strong };
  }, [results]);

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl">
        <EmptyState
          icon={<FileText size={20} />}
          title="先导入一份简历"
          desc="岗位匹配需要基于你的结构化能力画像。导入后可一键对比全部 68 个校招岗位，并看到逐条命中与缺口。"
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

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">岗位中心</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            不给一个模糊的匹配度，而是逐条告诉你：命中什么、半命中什么、缺什么。
          </p>
        </div>
        {stats && (
          <div className="flex gap-2 text-[12px]">
            <span className="chip">岗位库 {results?.length ?? 0} 个</span>
            <span className="chip border-brand-200 bg-brand-50 text-brand-600">平均匹配 {stats.avg}</span>
            <span className="chip border-hit/20 bg-hit/10 text-hit">高匹配 {stats.strong} 个</span>
          </div>
        )}
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {JOB_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-[12.5px] transition',
              category === c
                ? 'border-brand-500 bg-brand-500 text-white'
                : 'border-ink-200 bg-white text-ink-500 hover:border-ink-300',
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-gap/20 bg-gap/5 px-4 py-3 text-[13px] text-gap">
          {error}
        </div>
      )}

      {loading && !results ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="shimmer h-4 w-2/3 rounded" />
              <div className="shimmer mt-3 h-3 w-1/2 rounded" />
              <div className="shimmer mt-5 h-2 w-full rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {visible.map((match) => {
            const job = getJob(match.jobId)!;
            const open = expanded === match.jobId;
            return (
              <Card
                key={match.jobId}
                className={cn('transition hover:shadow-lift', open && 'md:col-span-2')}
              >
                <div className="flex items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-semibold">{job.title}</h3>
                      <span className="chip text-[10px]">{job.category}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-400">
                      <span className="inline-flex items-center gap-1">
                        <Briefcase size={11} />
                        {job.companyType}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} />
                        {job.location}
                      </span>
                      <span>{job.salary}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <StateBadge state="hit" count={match.hits.length} />
                      <StateBadge state="partial" count={match.partials.length} />
                      <StateBadge state="gap" count={match.gaps.length} />
                    </div>
                  </div>
                  <ScoreRing value={match.score} size={70} />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                  <button
                    className="inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-600"
                    onClick={() => setExpanded(open ? null : match.jobId)}
                  >
                    {open ? '收起逐条对照' : '查看逐条对照'}
                    <ChevronDown size={14} className={cn('transition', open && 'rotate-180')} />
                  </button>
                  <button
                    className="btn-soft px-3 py-1.5 text-xs"
                    onClick={() => {
                      setTargetJob(job.id);
                      router.push('/interview');
                    }}
                  >
                    以此岗位面试
                    <ArrowRight size={13} />
                  </button>
                </div>

                {open && (
                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <RequirementGroup title="命中" items={match.hits} />
                    <RequirementGroup title="半命中" items={match.partials} />
                    <RequirementGroup title="缺口" items={match.gaps} />
                    <div className="rounded-xl bg-ink-50 p-4">
                      <SectionTitle title="岗位职责" />
                      <ul className="space-y-2 text-[12px] leading-relaxed text-ink-600">
                        {job.responsibilities.map((r) => (
                          <li key={r} className="flex gap-2">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-300" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {!loading && results && visible.length === 0 && (
        <Card className="text-center text-[13px] text-ink-500">该分类下暂无岗位。</Card>
      )}
    </div>
  );
}

function RequirementGroup({ title, items }: { title: string; items: MatchItem[] }) {
  const state = title === '命中' ? 'hit' : title === '半命中' ? 'partial' : 'gap';
  return (
    <div className="rounded-xl border border-ink-100 p-4">
      <div className="mb-2 flex items-center gap-2">
        <StateBadge state={state} />
        <span className="text-[11px] text-ink-400">{items.length} 条</span>
      </div>
      {items.length === 0 ? (
        <p className="text-[12px] text-ink-400">暂无</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.requirementId}>
              <p className="text-[12.5px] leading-relaxed text-ink-700">{item.text}</p>
              <p className="mt-1 text-[11px] text-ink-400">{item.reason}</p>
              <div className="mt-1 flex flex-col gap-1">
                {item.resumeQuote && <Citation text={item.resumeQuote} tone="resume" />}
                <Citation text={item.jobQuote} tone="job" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
