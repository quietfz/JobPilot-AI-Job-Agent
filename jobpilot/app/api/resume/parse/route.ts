import { NextResponse } from 'next/server';
import { parseResumeText } from '@/lib/ai/resume';
import { extractPdfText } from '@/lib/ai/pdf';
import { aiEnabled, chatJSON, RESUME_SYSTEM_PROMPT } from '@/lib/ai/provider';
import { maskPII } from '@/lib/security/pii';
import type { ResumeProfile } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function extractText(
  req: Request,
): Promise<{ text: string; apiKey?: string; error?: string; isScanned?: boolean; pages?: number }> {
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const apiKey = String(form.get('apiKey') ?? '') || undefined;
    const file = form.get('file');
    if (file && typeof file !== 'string') {
      const name = file.name.toLowerCase();
      const buffer = Buffer.from(await file.arrayBuffer());
      if (name.endsWith('.pdf')) {
        const { text, isScanned, pages } = await extractPdfText(buffer);
        if (isScanned) {
          return {
            text: '',
            apiKey,
            error: '该 PDF 是扫描件（图片），无法直接提取文字。请改用「粘贴文本」方式导入，或导出为可复制文字的 PDF。',
            isScanned,
            pages,
          };
        }
        return { text, apiKey, isScanned, pages };
      }
      return { text: buffer.toString('utf-8'), apiKey };
    }
    return { text: String(form.get('text') ?? ''), apiKey };
  }

  const body = (await req.json()) as { text?: string; apiKey?: string };
  return { text: body.text ?? '', apiKey: body.apiKey };
}

export async function POST(req: Request) {
  const { text, apiKey, error, isScanned, pages } = await extractText(req);
  if (error) return NextResponse.json({ error, isScanned }, { status: 422 });
  if (!text.trim()) {
    return NextResponse.json({ error: '简历内容为空，请上传文件或粘贴文本' }, { status: 400 });
  }

  const masked = maskPII(text);
  const local = parseResumeText(masked);

  let profile: ResumeProfile = local;
  let mode: 'live' | 'demo' = 'demo';

  if (aiEnabled(apiKey)) {
    const ai = await chatJSON<Partial<ResumeProfile>>(RESUME_SYSTEM_PROMPT, masked.slice(0, 12000), apiKey);
    if (ai && (ai.name || ai.projects?.length)) {
      profile = {
        ...local,
        ...ai,
        name: ai.name || local.name,
        skills: ai.skills?.length ? Array.from(new Set(ai.skills)) : local.skills,
        projects: ai.projects?.length ? ai.projects : local.projects,
        experiences: ai.experiences?.length ? ai.experiences : local.experiences,
      };
      mode = 'live';
    }
  }

  return NextResponse.json({ profile, mode, chars: text.length, text: masked, pages });
}
