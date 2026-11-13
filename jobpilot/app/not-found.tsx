import Link from 'next/link';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-500">
        <Compass size={22} />
      </span>
      <h2 className="mt-4 text-[17px] font-semibold">没有找到这个页面</h2>
      <p className="mt-1.5 text-[13px] text-ink-500">链接可能已过期，或地址输入有误。</p>
      <Link href="/workspace" className="btn-primary mt-5 px-4 py-2 text-[13px]">
        回到工作台
      </Link>
    </div>
  );
}
