import { NextResponse } from 'next/server';
import { diagnoseResume, parseResumeText } from '@/lib/ai/resume';
import {
  aiEnabled,
  aiMode,
  chatJSON,
  RESUME_DIAGNOSIS_SYSTEM_PROMPT,
} from '@/lib/ai/provider';
import { getJob } from '@/lib/data/jobs';
import { maskPII } from '@/lib/security/pii';
import { uid } from '@/lib/utils';
import type {
  DiagnosisIssue,
  DiagnosisReport,
  DimensionScore,
  Severity,
} from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_SEVERITY: Severity[] = ['high', 'medium', 'low'];

function normalizeReport(
  ai: (Partial<DiagnosisReport> & { dimensions?: Array<Partial<DimensionScore>> }) | null,
): DiagnosisReport | null {
  if (!ai || !Array.isArray(ai.dimensions) || ai.dimensions.length !== 5) return null;

  const dimensions: DimensionScore[] = ai.dimensions.map((d) => {
    const raw = Number(d.raw ?? 0);
    const max = Number(d.max ?? 0);
    return {
      key: String(d.key ?? ''),
      label: String(d.label ?? ''),
      raw: Math.round(raw * 10) / 10,
      max,
      score: max > 0 ? Math.round((raw / max) * 100) : 0,
    };
  });

  const score =
    typeof ai.score === 'number'
      ? Math.round(ai.score)
      : Math.round(dimensions.reduce((s, d) => s + d.raw, 0));

  const issues: DiagnosisIssue[] = Array.isArray(ai.issues)
    ? ai.issues
        .map((i) => ({
          id: uid(),
          severity: VALID_SEVERITY.includes(i.severity as Severity)
            ? (i.severity as Severity)
            : 'medium',
          dimension: String(i.dimension ?? ''),
          title: String(i.title ?? ''),
          detail: String(i.detail ?? ''),
          resumeQuote: String(i.resumeQuote ?? '').slice(0, 60),
          jobQuote: String(i.jobQuote ?? '').slice(0, 60),
          suggestion: String(i.suggestion ?? ''),
        }))
        .filter((i) => i.title)
        .slice(0, 6)
    : [];

  return {
    score,
    dimensions,
    issues,
    summary: String(ai.summary ?? ''),
    jobId: '',
    jobTitle: '',
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    rawText?: string;
    jobId?: string;
    apiKey?: string;
  };
  const apiKey = body.apiKey;
  const job = getJob(body.jobId ?? '');
  if (!job) return NextResponse.json({ error: '未找到该岗位' }, { status: 404 });
  if (!body.rawText?.trim()) {
    return NextResponse.json({ error: '缺少简历文本' }, { status: 400 });
  }

  const masked = maskPII(body.rawText);
  const profile = parseResumeText(masked);

  // 本地确定性诊断（兜底）
  const localReport = diagnoseResume(masked, profile, job);

  let report: DiagnosisReport = localReport;
  let mode: 'live' | 'demo' = aiMode(apiKey);

  if (aiEnabled(apiKey)) {
    const jobText = [
      `目标岗位：${job.title}`,
      `岗位技能要求：${job.skills.join('、')}`,
      `岗位职责：${job.responsibilities.join('；')}`,
      `岗位要求：${job.requirements.map((r) => r.text).join('；')}`,
    ].join('\n');

    const ai = await chatJSON<
      Partial<DiagnosisReport> & { dimensions?: Array<Partial<DimensionScore>> }
    >(
      RESUME_DIAGNOSIS_SYSTEM_PROMPT,
      `${jobText}\n\n【候选人简历原文】\n${masked.slice(0, 12000)}`,
      apiKey,
    );

    const normalized = normalizeReport(ai);
    if (normalized) {
      report = { ...normalized, jobId: job.id, jobTitle: job.title };
      mode = 'live';
    }
    // LLM 返回不合法时静默回落到本地诊断
  }

  return NextResponse.json({ report, profile, mode });
}
