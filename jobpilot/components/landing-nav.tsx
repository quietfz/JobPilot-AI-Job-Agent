'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Menu, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#why', label: '为什么做' },
  { href: '#compare', label: '差异' },
  { href: '#capability', label: '核心能力' },
  { href: '#flow', label: '闭环流程' },
];

export function LandingNav() {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setStuck(y > 8);
      let cur = '';
      LINKS.forEach((l) => {
        const el = document.querySelector(l.href);
        if (el instanceof HTMLElement && el.offsetTop <= y + 140) cur = l.href;
      });
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b bg-white/85 backdrop-blur-md transition-all duration-200',
        stuck
          ? 'border-ink-200/70 shadow-[0_8px_24px_-18px_rgba(14,18,34,0.45)]'
          : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 text-white shadow-[0_8px_18px_-8px_rgba(47,75,255,0.7)]">
            <Sparkles size={17} />
          </span>
          <span>
            <span className="block text-[15px] font-semibold tracking-tight">职途 JobPilot</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.16em] text-ink-400">
              AI Career Copilot
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] text-ink-500 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                'transition hover:text-ink-900',
                active === l.href && 'font-semibold text-brand-600',
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/workspace" className="btn-ghost hidden px-4 py-2 text-[13px] sm:inline-flex">
            进入工作台
          </Link>
          <Link href="/workspace" className="btn-primary px-4 py-2 text-[13px]">
            免费开始
            <ArrowRight size={14} />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="展开导航"
            className="grid h-9 w-9 place-items-center rounded-lg border border-ink-200 text-ink-500 md:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink-200/70 bg-white px-5 py-3 md:hidden">
          <nav className="flex flex-col gap-1 text-[13.5px] text-ink-600">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 transition hover:bg-ink-50"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <Link
            href="/workspace"
            className="btn-ghost mt-2 w-full px-4 py-2 text-[13px] sm:hidden"
          >
            进入工作台
            <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </header>
  );
}
