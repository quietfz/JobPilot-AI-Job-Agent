import { NextResponse } from 'next/server';
import { matchJob } from '@/lib/ai/match';
import { parseResumeText } from '@/lib/ai/resume';
import { JOBS } from '@/lib/data/jobs';
import { maskPII } from '@/lib/security/pii';
import type { ResumeProfile } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = (await req.json()) as {
    rawText?: string;
    profile?: ResumeProfile | null;
    jobIds?: string[];
  };
  if (!body.rawText?.trim()) {
    return NextResponse.json({ error: '缺少简历文本' }, { status: 400 });
  }

  const masked = maskPII(body.rawText);
  const profile = body.profile ?? parseResumeText(masked);
  const jobs = body.jobIds?.length
    ? JOBS.filter((j) => body.jobIds!.includes(j.id))
    : JOBS;

  const results = jobs.map((job) => matchJob(profile, masked, job));
  return NextResponse.json({ results });
}
