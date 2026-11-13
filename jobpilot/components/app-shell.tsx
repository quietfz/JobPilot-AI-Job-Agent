'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  FileText,
  LayoutGrid,
  MessageSquareCode,
  Route,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';

const NAV = [
  { href: '/workspace', label: '工作台', icon: LayoutGrid },
  { href: '/resume', label: '简历中心', icon: FileText },
  { href: '/jobs', label: '岗位中心', icon: Briefcase },
  { href: '/interview', label: '模拟面试', icon: MessageSquareCode },
  { href: '/plan', label: '成长中心', icon: Route },
  { href: '/settings', label: '设置', icon: Settings },
];

const PAGE_META: Record<string, { title: string; desc: string }> = {
  '/workspace': { title: '工作台', desc: '从简历到面试，一条链路跑完' },
  '/resume': { title: '简历中心', desc: '五维打分与可执行改写建议' },
  '/jobs': { title: '岗位中心', desc: '命中 / 半命中 / 缺口，逐条可解释' },
  '/interview': { title: '模拟面试', desc: '追问式面试 Agent，评分确定可复现' },
  '/plan': { title: '成长中心', desc: '弱点图谱 → 学习任务 → 下一轮验证' },
  '/settings': { title: '设置', desc: '模型接入 / 数据管理 / 隐私说明' },
};

function Brand() {
  return (
    <Link href="/workspace" className="flex items-center gap-2.5" aria-label="职途 JobPilot 工作台">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-[0_8px_18px_-8px_rgba(47,75,255,0.7)]">
        <Sparkles size={17} />
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight">职途 JobPilot</span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-ink-400">
          AI Career Copilot
        </span>
      </span>
    </Link>
  );
}

function BootSkeleton() {
  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="hidden w-[240px] shrink-0 border-r border-ink-200/80 bg-white/70 lg:block" />
      <div className="flex-1 px-4 py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="shimmer h-6 w-48 rounded-md" />
          <div className="shimmer mt-3 h-3 w-72 rounded-md" />
          <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-4">
                <div className="shimmer h-8 w-8 rounded-lg" />
                <div className="shimmer mt-4 h-4 w-2/3 rounded" />
                <div className="shimmer mt-2 h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_380px]">
            <div className="card h-64 p-5">
              <div className="shimmer h-4 w-32 rounded" />
              <div className="shimmer mt-4 h-12 w-full rounded-lg" />
              <div className="shimmer mt-2 h-12 w-full rounded-lg" />
            </div>
            <div className="card h-64 p-5">
              <div className="shimmer h-4 w-24 rounded" />
              <div className="shimmer mt-4 h-40 w-full rounded-xl" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-ink-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand-500" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            正在载入本地数据…
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const sessions = useApp((s) => s.sessions);
  const profile = useApp((s) => s.profile);
  const aiKeyMode = useApp((s) => s.aiKeyMode);
  const customApiKey = useApp((s) => s.customApiKey);
  const [builtin, setBuiltin] = useState(false);

  useEffect(() => {
    const result = useApp.persist.rehydrate();
    Promise.resolve(result).finally(() => setReady(true));
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((d) => setBuiltin(Boolean(d?.builtin)))
      .catch(() => setBuiltin(false));
  }, []);

  if (pathname === '/') return <>{children}</>;
  if (!ready) return <BootSkeleton />;

  const running = sessions.find((s) => !s.finished);
  const metaKey = NAV.map((n) => n.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0];
  const meta = PAGE_META[metaKey] ?? PAGE_META['/workspace'];
  const live = aiKeyMode === 'custom' ? Boolean(customApiKey) : builtin;
  const modelLabel =
    aiKeyMode === 'custom' && customApiKey ? '自定义模型' : builtin ? '内置模型' : 'Demo 模式';
  const initial = profile?.name?.trim().slice(0, 1) ?? '职';

  return (
    <div className="flex min-h-screen bg-ink-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-ink-200/80 bg-white/85 px-3.5 py-5 backdrop-blur-xl lg:flex">
        <div className="px-2.5 pb-1">
          <Brand />
        </div>

        <nav className="mt-6 space-y-1" aria-label="主导航">
          {NAV.map((item) => {
            const active = metaKey === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm transition',
                  active
                    ? 'bg-brand-50 font-semibold text-brand-600'
                    : 'text-ink-500 hover:bg-ink-50 hover:text-ink-900',
                )}
              >
                {active && (
                  <span className="absolute -left-3.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-500" />
                )}
                <item.icon
                  size={16}
                  className={active ? 'text-brand-500' : 'text-ink-400 group-hover:text-ink-500'}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 pt-6">
          <div className="rounded-xl border border-ink-200/80 bg-ink-50/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                当前候选人
              </p>
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[10px] font-medium',
                  live ? 'text-hit' : 'text-brand-500',
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'bg-hit' : 'bg-brand-500')} />
                {modelLabel}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-[12px] font-semibold text-brand-600 shadow-[0_1px_2px_rgba(14,18,34,0.08)]">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold">{profile?.name ?? '尚未导入简历'}</p>
                <p className="truncate text-[11px] text-ink-400">
                  {profile?.targetRole ?? '前往简历中心开始'}
                </p>
              </div>
            </div>
          </div>
          <p className="flex items-start gap-1.5 px-1 text-[10.5px] leading-relaxed text-ink-400">
            <ShieldCheck size={12} className="mt-[1px] shrink-0" />
            本地优先：简历只存浏览器，AI 调用前自动脱敏。
          </p>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-[240px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-ink-200/80 bg-white/80 px-4 backdrop-blur-md lg:px-8">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 text-white lg:hidden">
              <Sparkles size={15} />
            </span>
            <div className="min-w-0 lg:hidden">
              <p className="truncate text-[13.5px] font-semibold">{meta.title}</p>
              <p className="truncate text-[10.5px] text-ink-400">{meta.desc}</p>
            </div>
            <div className="hidden items-center gap-2 text-xs text-ink-400 lg:flex">
              <BarChart3 size={14} />
              <span>AI 求职陪跑 · 记忆化能力图谱 · 可解释匹配</span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {running && (
              <Link
                href={`/interview/${running.id}`}
                className="btn-soft hidden px-3 py-1.5 text-xs sm:inline-flex"
              >
                继续面试
                <ArrowRight size={12} />
              </Link>
            )}
            <span
              className={cn(
                'chip',
                live ? 'border-hit/20 bg-hit/10 text-hit' : 'border-brand-200 bg-brand-50 text-brand-600',
              )}
            >
              <span className={cn('h-1.5 w-1.5 rounded-full', live ? 'bg-hit' : 'bg-brand-500')} />
              {modelLabel}
            </span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 lg:px-8 lg:py-8 lg:pb-8">{children}</main>

        <nav className="sticky bottom-0 z-20 grid grid-cols-6 border-t border-ink-200/80 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
          {NAV.map((item) => {
            const active = metaKey === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 text-[10px] transition',
                  active ? 'font-medium text-brand-600' : 'text-ink-400',
                )}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
