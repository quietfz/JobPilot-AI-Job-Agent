'use client';

import { cn } from '@/lib/utils';
import type { MatchState } from '@/lib/types';

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn('card p-5', className)}>{children}</div>;
}

export function SectionTitle({
  title,
  desc,
  right,
}: {
  title: string;
  desc?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[17px] font-semibold tracking-tight">{title}</h2>
        {desc && <p className="mt-1 text-[13px] text-ink-500">{desc}</p>}
      </div>
      {right}
    </div>
  );
}

export function ScoreRing({
  value,
  size = 108,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  const color = value >= 75 ? '#0E9F6E' : value >= 55 ? '#2F4BFF' : '#C2760A';
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EDF0F7" strokeWidth={8} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-2xl font-semibold tabular-nums tracking-tight">{Math.round(value)}</div>
        {label && <div className="mt-0.5 text-[10px] font-medium text-ink-400">{label}</div>}
      </div>
    </div>
  );
}

export function Meter({
  label,
  value,
  hint,
  raw,
  max,
}: {
  label: string;
  value: number;
  hint?: string;
  raw?: number;
  max?: number;
}) {
  const color = value >= 75 ? 'bg-hit' : value >= 55 ? 'bg-brand-500' : 'bg-partial';
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-700">{label}</span>
        <span className="text-xs font-semibold tabular-nums text-ink-500">
          {raw != null && max != null ? `${Math.round(raw)}/${max}` : Math.round(value)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-ink-100">
        <div
          className={cn('h-full rounded-full transition-[width] duration-700 ease-out', color)}
          style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
        />
      </div>
      {hint && <p className="mt-1 text-[11px] text-ink-400">{hint}</p>}
    </div>
  );
}

const STATE_META: Record<MatchState, { label: string; cls: string }> = {
  hit: { label: '命中', cls: 'border-hit/25 bg-hit/10 text-hit' },
  partial: { label: '半命中', cls: 'border-partial/25 bg-partial/10 text-partial' },
  gap: { label: '缺口', cls: 'border-gap/25 bg-gap/10 text-gap' },
};

export function StateBadge({ state, count }: { state: MatchState; count?: number }) {
  const m = STATE_META[state];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        m.cls,
      )}
    >
      {m.label}
      {typeof count === 'number' && <span className="tabular-nums">{count}</span>}
    </span>
  );
}

export function Citation({ text, tone = 'resume' }: { text: string; tone?: 'resume' | 'job' }) {
  if (!text) return null;
  return (
    <span
      className={cn(
        'mt-1.5 inline-flex max-w-full items-start gap-1 rounded-md px-2 py-1 text-[11px] leading-relaxed',
        tone === 'resume' ? 'bg-brand-50 text-brand-700' : 'bg-ink-50 text-ink-500',
      )}
    >
      <span className="mt-[1px] shrink-0 font-semibold">{tone === 'resume' ? '简历' : 'JD'}</span>
      <span className="line-clamp-2">{text}</span>
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        {icon}
      </div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-ink-500">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SeverityDot({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  const color =
    severity === 'high' ? 'bg-gap' : severity === 'medium' ? 'bg-partial' : 'bg-ink-300';
  return <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', color)} />;
}
