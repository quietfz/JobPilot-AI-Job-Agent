'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { getClientApiKey, useApp } from '@/lib/store';
import { JOBS } from '@/lib/data/jobs';
import { SAMPLE_RESUME } from '@/lib/data/questions';
import type { DiagnosisReport, ResumeProfile } from '@/lib/types';
import { Card, Meter, ScoreRing, SectionTitle, SeverityDot } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function ResumePage() {
  const { resumeText, profile, targetJobId, diagnosis, setResume, setDiagnosis, setTargetJob } =
    useApp();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const jobId = targetJobId ?? 'fe-01';

  async function parse(payload: { text?: string; file?: File }) {
    setBusy(true);
    setError('');
    try {
      let res: Response;
      const apiKey = getClientApiKey();
      if (payload.file) {
        const fd = new FormData();
        fd.append('file', payload.file);
        if (apiKey) fd.append('apiKey', apiKey);
        res = await fetch('/api/resume/parse', { method: 'POST', body: fd });
      } else {
        res = await fetch('/api/resume/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: payload.text, apiKey }),
        });
      }
      const data = (await res.json()) as {
        profile?: ResumeProfile;
        text?: string;
        error?: string;
      };
      if (!res.ok || !data.profile) throw new Error(data.error ?? '解析失败');
      setResume(data.text ?? payload.text ?? payload.file?.name ?? '', data.profile);
      setDiagnosis(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '解析失败，请重试');
    } finally {
      setBusy(false);
    }
  }

  async function runDiagnosis() {
    if (!profile) return;
    setBusy(true);
    setError('');
    try {
      const apiKey = getClientApiKey();
      const res = await fetch('/api/resume/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: resumeText, jobId, apiKey }),
      });
      const data = (await res.json()) as { report?: DiagnosisReport; error?: string };
      if (!res.ok || !data.report) throw new Error(data.error ?? '诊断失败');
      setDiagnosis(data.report);
      setTargetJob(jobId);
    } catch (e) {
      setError(e instanceof Error ? e.message : '诊断失败，请重试');
    } finally {
      setBusy(false);
    }
  }

  const job = JOBS.find((j) => j.id === jobId)!;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">简历中心</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            上传或粘贴简历，生成结构化画像，再按目标岗位做可解释诊断。
          </p>
        </div>
        <span className="chip border-brand-200 bg-brand-50 text-brand-600">
          <ShieldCheck size={12} />
          送入模型前自动脱敏
        </span>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-gap/20 bg-gap/5 px-4 py-3 text-[13px] text-gap">
          {error}
        </div>
      )}

      {!profile ? (
        <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="p-0">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) parse({ file });
              }}
              className={cn(
                'flex flex-col items-center justify-center rounded-t-xl2 border-b border-dashed border-ink-200 px-6 py-12 text-center transition',
                dragging ? 'bg-brand-50' : 'bg-white',
              )}
            >
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-500">
                {busy ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
              </div>
              <p className="text-[14px] font-semibold">拖入简历文件，或点击选择</p>
              <p className="mt-1 text-[12px] text-ink-400">支持 PDF / TXT / MD，PDF 为文本型简历</p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.txt,.md"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) parse({ file: f });
                }}
              />
              <button
                className="btn-primary mt-5 px-4 py-2 text-[13px]"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
              >
                {busy ? '解析中…' : '选择文件'}
              </button>
              <button
                className="btn-ghost mt-2 px-4 py-2 text-[13px]"
                onClick={() => {
                  setText(SAMPLE_RESUME);
                  parse({ text: SAMPLE_RESUME });
                }}
                disabled={busy}
              >
                <Sparkles size={14} />
                载入示例简历
              </button>
            </div>

            <div className="p-5">
              <label className="label">或直接粘贴简历文本</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="粘贴简历全文，建议保留「教育经历 / 项目经历 / 专业技能」等小标题…"
                className="input min-h-[180px] resize-y font-mono text-[12.5px] leading-relaxed"
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-ink-400">{text.length} 字</span>
                <button
                  className="btn-primary px-4 py-2 text-[13px]"
                  onClick={() => parse({ text })}
                  disabled={busy || !text.trim()}
                >
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                  解析简历
                </button>
              </div>
            </div>
          </Card>

          <Card>
            <SectionTitle title="解析后会得到什么" desc="所有结果都可溯源到原文" />
            <ul className="space-y-3 text-[13px] text-ink-600">
              {[
                '结构化画像：教育、项目、实习、技能、证书',
                '五维诊断：相关性、量化度、技术深度、结构、关键词',
                '逐条问题：每条同时挂简历原文与 JD 原文',
                '可直接进入岗位匹配与模拟面试',
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-hit" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-ink-50 p-3 text-[11.5px] leading-relaxed text-ink-500">
              隐私说明：手机号、邮箱、证件号在发送给模型前会被掩码处理；原文只保存在浏览器本地。
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-5">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-semibold">{profile.name}</h2>
                    <span className="chip text-[10px]">已解析</span>
                  </div>
                  <p className="mt-1 text-[13px] text-ink-500">
                    求职意向：{profile.targetRole} · {profile.skills.length} 项技能 ·{' '}
                    {profile.projects.length} 个项目
                  </p>
                </div>
                <button
                  className="btn-ghost px-3 py-1.5 text-xs"
                  onClick={() =>
                    useApp.setState({
                      profile: null,
                      resumeText: '',
                      resumeId: null,
                      diagnosis: null,
                    })
                  }
                >
                  <RefreshCw size={13} />
                  重新导入
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {profile.skills.slice(0, 16).map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                {profile.projects.map((p) => (
                  <div key={p.name + p.period} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[14px] font-semibold">{p.name}</h3>
                      <span className="shrink-0 text-[11px] text-ink-400">{p.period}</span>
                    </div>
                    {p.role && <p className="mt-0.5 text-[11.5px] text-brand-500">{p.role}</p>}
                    <ul className="mt-2 space-y-1.5">
                      {p.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-600">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-300" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {profile.experiences.map((e) => (
                  <div key={e.company + e.period} className="rounded-xl border border-ink-100 p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-[14px] font-semibold">
                        {e.company}
                        {e.role && <span className="ml-2 text-[12px] font-normal text-ink-500">{e.role}</span>}
                      </h3>
                      <span className="shrink-0 text-[11px] text-ink-400">{e.period}</span>
                    </div>
                    <ul className="mt-2 space-y-1.5">
                      {e.bullets.map((b, i) => (
                        <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-ink-600">
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink-300" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            {diagnosis && (
              <Card>
                <div className="flex items-center justify-between">
                  <SectionTitle title="诊断报告" desc={`目标岗位：${diagnosis.jobTitle}`} />
                  <span className="chip text-[10px]">确定性诊断 · 可复现</span>
                </div>
                <div className="mb-5 flex items-center gap-6">
                  <ScoreRing value={diagnosis.score} label="综合得分" />
                  <p className="text-[13px] leading-relaxed text-ink-600">{diagnosis.summary}</p>
                </div>
                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                  {diagnosis.dimensions.map((d) => (
                    <Meter key={d.key} label={d.label} value={d.score} raw={d.raw} max={d.max} />
                  ))}
                </div>
                <div className="space-y-3">
                  {diagnosis.issues.map((issue) => (
                    <div key={issue.id} className="rounded-xl border border-ink-100 p-4">
                      <div className="flex gap-2.5">
                        <SeverityDot severity={issue.severity} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-[13.5px] font-semibold">{issue.title}</h4>
                            <span className="chip text-[10px]">{issue.dimension}</span>
                          </div>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{issue.detail}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-md bg-brand-50 px-2 py-1 text-[11px] text-brand-700">
                              简历：{issue.resumeQuote}
                            </span>
                            {issue.jobQuote && (
                              <span className="rounded-md bg-ink-50 px-2 py-1 text-[11px] text-ink-500">
                                JD：{issue.jobQuote}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-[12px] text-ink-700">
                            <span className="font-semibold text-brand-600">建议：</span>
                            {issue.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/jobs" className="btn-primary mt-5 w-full py-2.5">
                  去岗位中心看可解释匹配
                  <ArrowRight size={15} />
                </Link>
              </Card>
            )}
          </div>

          <div className="space-y-5">
            <Card>
              <SectionTitle title="目标岗位" desc="诊断与匹配都以它为基准" />
              <select
                value={jobId}
                onChange={(e) => {
                  setTargetJob(e.target.value);
                  setDiagnosis(null);
                }}
                className="input"
              >
                {JOBS.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} · {j.category}
                  </option>
                ))}
              </select>

              <div className="mt-3 rounded-xl bg-ink-50 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-500">
                  <Briefcase size={12} />
                  {job.companyType} · {job.location} · {job.salary}
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-500">
                  {job.responsibilities[0]}
                </p>
              </div>

              <button
                className="btn-primary mt-4 w-full py-2.5"
                onClick={runDiagnosis}
                disabled={busy}
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                {diagnosis ? '重新诊断' : '生成诊断报告'}
              </button>
              {!diagnosis && (
                <p className="mt-2 text-center text-[11px] text-ink-400">
                  约 1 秒完成，结果可复现
                </p>
              )}
            </Card>

            <Card>
              <SectionTitle title="岗位要求速览" />
              <ul className="space-y-2">
                {job.requirements.map((r) => (
                  <li key={r.id} className="flex gap-2 text-[12px] leading-relaxed text-ink-600">
                    <span
                      className={cn(
                        'mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full',
                        r.type === 'must' ? 'bg-brand-500' : 'bg-ink-300',
                      )}
                    />
                    {r.text}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
