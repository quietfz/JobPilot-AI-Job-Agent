'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[JobPilot] 页面错误:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-partial/10 text-partial">
        <AlertTriangle size={22} />
      </span>
      <h2 className="mt-4 text-[17px] font-semibold">页面出了点问题</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-500">
        本地数据不会丢失。可以先刷新重试；若反复出现，请到「设置」清除本机数据后再试。
      </p>
      <div className="mt-5 flex gap-2">
        <button className="btn-primary px-4 py-2 text-[13px]" onClick={reset}>
          <RotateCcw size={14} />
          重试
        </button>
        <Link href="/workspace" className="btn-ghost px-4 py-2 text-[13px]">
          回到工作台
        </Link>
      </div>
    </div>
  );
}
