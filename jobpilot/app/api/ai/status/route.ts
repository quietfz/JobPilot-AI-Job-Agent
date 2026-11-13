import { NextResponse } from 'next/server';
import { builtinKeyConfigured } from '@/lib/ai/provider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BASE = process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com';
const MODEL = process.env.DEEPSEEK_MODEL ?? 'deepseek-chat';

/** GET：查询内置 Key 是否已配置（不暴露 Key 本身） */
export async function GET() {
  return NextResponse.json({ builtin: builtinKeyConfigured(), model: MODEL });
}

/** POST：验证用户自定义 Key 是否可用（调用 /models，不消耗对话额度） */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { apiKey?: string };
  const key = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
  if (!key || key.length > 200) {
    return NextResponse.json({ ok: false, error: 'Key 为空或格式不正确' }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${BASE}/models`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    });
    if (res.ok) return NextResponse.json({ ok: true, model: MODEL });
    return NextResponse.json({ ok: false, error: `Key 验证失败（HTTP ${res.status}）` });
  } catch {
    return NextResponse.json({ ok: false, error: '无法连接 DeepSeek，请检查网络后重试' });
  } finally {
    clearTimeout(timer);
  }
}
