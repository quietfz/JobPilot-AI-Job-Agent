'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  KeyRound,
  Loader2,
  ShieldCheck,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Card, SectionTitle } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';

function maskKey(k: string) {
  if (k.length <= 8) return '****';
  return `${k.slice(0, 4)}…${k.slice(-4)}`;
}

export default function SettingsPage() {
  const { profile, sessions, tasks, weakness, resetAll, aiKeyMode, customApiKey, setAiSettings } =
    useApp();
  const [confirming, setConfirming] = useState(false);

  // 模型接入状态
  const [builtin, setBuiltin] = useState<boolean | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((d) => setBuiltin(Boolean(d?.builtin)))
      .catch(() => setBuiltin(false));
  }, []);

  const effectiveLive = aiKeyMode === 'custom' ? Boolean(customApiKey) : Boolean(builtin);

  async function saveCustomKey() {
    const key = keyInput.trim();
    if (!key) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (data.ok) {
        setAiSettings('custom', key);
        setKeyInput('');
        setTestResult({ ok: true, text: '验证通过，已切换为你的 Key' });
      } else {
        setTestResult({ ok: false, text: data.error ?? '验证失败' });
      }
    } catch {
      setTestResult({ ok: false, text: '网络异常，请稍后重试' });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight">设置与隐私</h1>
        <p className="mt-1 text-[13px] text-ink-500">数据存在哪里、AI 怎么调用、如何清除。</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <SectionTitle title="本地数据" desc="仅保存在当前浏览器" />
          <ul className="space-y-2.5 text-[13px]">
            {[
              ['简历画像', profile ? `${profile.name} · ${profile.skills.length} 项技能` : '未导入'],
              ['面试记录', `${sessions.length} 场`],
              ['能力维度', `${Object.keys(weakness).length} 项`],
              ['学习任务', `${tasks.length} 项`],
            ].map(([k, v]) => (
              <li key={k} className="flex items-center justify-between border-b border-ink-100 pb-2 last:border-0">
                <span className="text-ink-500">{k}</span>
                <span className="font-medium">{v}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-partial/5 p-3 text-[11.5px] leading-relaxed text-ink-600">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-partial">
              <AlertTriangle size={13} />
              清除后不可恢复
            </div>
            清除浏览器数据或点击下方按钮，都会永久删除简历、面试记录与学习任务。
          </div>
          {confirming ? (
            <div className="mt-3 flex gap-2">
              <button
                className="btn flex-1 bg-gap py-2 text-white hover:bg-gap/90"
                onClick={() => {
                  resetAll();
                  setConfirming(false);
                }}
              >
                确认清除全部数据
              </button>
              <button className="btn-ghost flex-1 py-2" onClick={() => setConfirming(false)}>
                取消
              </button>
            </div>
          ) : (
            <button className="btn-ghost mt-3 w-full py-2 text-gap" onClick={() => setConfirming(true)}>
              <Trash2 size={14} />
              清除本机全部数据
            </button>
          )}
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionTitle title="隐私保护" />
            <ul className="space-y-3 text-[12.5px] leading-relaxed text-ink-600">
              <li className="flex gap-2">
                <ShieldCheck size={15} className="mt-0.5 shrink-0 text-hit" />
                简历原文只存本地，不上传服务器；送入模型前自动掩码手机号、邮箱与证件号。
              </li>
              <li className="flex gap-2">
                <Database size={15} className="mt-0.5 shrink-0 text-hit" />
                面试记录与能力图谱用于跨会话记忆，不对外共享。
              </li>
              <li className="flex gap-2">
                <KeyRound size={15} className="mt-0.5 shrink-0 text-hit" />
                内置 Key 仅存在于服务端环境变量；自定义 Key 只保存在本机浏览器，随请求直传模型服务，服务器不落盘。
              </li>
            </ul>
          </Card>

          <Card>
            <SectionTitle title="模型接入" desc="DeepSeek · OpenAI 兼容协议" />

            {/* 模式选择 */}
            <div className="space-y-2">
              <button
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left transition',
                  aiKeyMode === 'builtin'
                    ? 'border-brand-300 bg-brand-50/60'
                    : 'border-ink-200 bg-white hover:bg-ink-50',
                )}
                onClick={() => setAiSettings('builtin')}
              >
                <div>
                  <p className="text-[13px] font-semibold">内置模型</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-400">
                    使用部署方提供的 Key，开箱即用
                  </p>
                </div>
                <span
                  className={cn(
                    'chip text-[10px]',
                    builtin === null
                      ? 'text-ink-400'
                      : builtin
                        ? 'border-hit/20 bg-hit/10 text-hit'
                        : 'border-partial/20 bg-partial/10 text-partial',
                  )}
                >
                  {builtin === null ? '检测中…' : builtin ? '已配置' : '未配置'}
                </span>
              </button>

              <button
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left transition',
                  aiKeyMode === 'custom'
                    ? 'border-brand-300 bg-brand-50/60'
                    : 'border-ink-200 bg-white hover:bg-ink-50',
                )}
                onClick={() => setAiSettings('custom')}
              >
                <div>
                  <p className="text-[13px] font-semibold">自定义 API Key</p>
                  <p className="mt-0.5 text-[11.5px] text-ink-400">
                    使用你自己的 DeepSeek Key，仅保存在本机浏览器
                  </p>
                </div>
                <span
                  className={cn(
                    'chip text-[10px]',
                    customApiKey
                      ? 'border-hit/20 bg-hit/10 text-hit'
                      : 'border-ink-200 bg-ink-50 text-ink-400',
                  )}
                >
                  {customApiKey ? maskKey(customApiKey) : '未填写'}
                </span>
              </button>
            </div>

            {/* 自定义 Key 输入 */}
            {aiKeyMode === 'custom' && (
              <div className="mt-3 rounded-xl bg-ink-50 p-3">
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={keyInput}
                    onChange={(e) => {
                      setKeyInput(e.target.value);
                      setTestResult(null);
                    }}
                    placeholder={customApiKey ? `当前已保存 ${maskKey(customApiKey)}` : 'sk-...'}
                    className="input flex-1 text-[12.5px]"
                  />
                  <button
                    className="btn-primary shrink-0 px-3.5 py-2 text-[12.5px]"
                    disabled={!keyInput.trim() || testing}
                    onClick={saveCustomKey}
                  >
                    {testing ? <Loader2 size={14} className="animate-spin" /> : '验证并保存'}
                  </button>
                </div>
                {testResult && (
                  <p
                    className={cn(
                      'mt-2 flex items-center gap-1.5 text-[11.5px]',
                      testResult.ok ? 'text-hit' : 'text-gap',
                    )}
                  >
                    {testResult.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {testResult.text}
                  </p>
                )}
                {customApiKey && (
                  <button
                    className="mt-2 text-[11px] text-ink-400 underline underline-offset-2 hover:text-gap"
                    onClick={() => setAiSettings('custom', '')}
                  >
                    移除已保存的 Key
                  </button>
                )}
              </div>
            )}

            {/* 生效状态 */}
            <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3">
              <span
                className={cn(
                  'chip',
                  effectiveLive
                    ? 'border-hit/20 bg-hit/10 text-hit'
                    : 'border-brand-200 bg-brand-50 text-brand-600',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    effectiveLive ? 'bg-hit' : 'bg-brand-500',
                  )}
                />
                {effectiveLive ? 'Live · 真实大模型' : 'Demo · 本地引擎'}
              </span>
              <span className="text-[11px] text-ink-400">
                {effectiveLive
                  ? '解析与出题由 DeepSeek 增强，评分仍走固定 rubric'
                  : '无可用 Key，所有功能由本地规则引擎完整驱动'}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-ink-400">
              <div className="rounded-lg bg-ink-50 p-2">
                <div className="font-semibold text-ink-600">确定性评分</div>
                相同回答 → 相同分数
              </div>
              <div className="rounded-lg bg-ink-50 p-2">
                <div className="font-semibold text-ink-600">引用强制</div>
                无引用即标注推测
              </div>
            </div>
          </Card>

          <p className="px-1 text-[11px] text-ink-400">
            最后更新：{formatDate(Date.now())} · 职途 JobPilot v0.1
          </p>
        </div>
      </div>
    </div>
  );
}
