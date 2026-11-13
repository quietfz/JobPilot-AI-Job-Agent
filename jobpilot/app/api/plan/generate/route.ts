import { NextResponse } from 'next/server';
import { dimensionLabel } from '@/lib/ai/interview';
import { retrieveResources } from '@/lib/rag/retrieve';
import type { LearningTask } from '@/lib/types';
import { uid } from '@/lib/utils';

export const runtime = 'nodejs';

const TEMPLATE: Record<string, { title: string; detail: string }> = {
  relevance: {
    title: '把目标 JD 逐条映射到自己的经历',
    detail: '为每条岗位要求找到一条对应证据：命中就写清出处，缺口就排进学习计划。练习用 90 秒讲清「为什么我最匹配」。',
  },
  evidence: {
    title: '给每段经历补上可衡量结果',
    detail: '所有"优化了""提升了"的表述，都必须补一个前后对比数字；没有数据就先补测量方法。',
  },
  depth: {
    title: '把三个技术点讲透到实现层',
    detail: '选三个你写进简历的技术点，分别准备「原理 → 选型理由 → 落地细节 → 踩坑」四层回答。',
  },
  structure: {
    title: '用「结论先行 + 三点论据」重写回答',
    detail: '每天挑 3 道高频题，用固定结构录音作答，回听时只检查：有没有结论、有没有分点。',
  },
  reflection: {
    title: '建立复盘四问习惯',
    detail: '每个项目写一次复盘：目标是什么、结果差在哪、根因是什么、下次具体改什么。根因必须向内归因。',
  },
};

export async function POST(req: Request) {
  const body = (await req.json()) as {
    weakness?: Record<string, number>;
    limit?: number;
  };
  const weakness = body.weakness ?? {};
  const limit = body.limit ?? 3;

  const ranked = Object.entries(weakness)
    .filter(([, v]) => v < 70)
    .sort((a, b) => a[1] - b[1])
    .slice(0, limit);

  const dims = ranked.length
    ? ranked.map(([k]) => k)
    : ['evidence', 'depth', 'structure'];

  const tasks: LearningTask[] = dims.map((dim) => {
    const t = TEMPLATE[dim] ?? TEMPLATE.evidence;
    const resources = retrieveResources(`${dimensionLabel(dim)} ${t.title}`, dim, 2).map((r) => ({
      title: r.item.title,
      source: r.item.source,
    }));
    const score = weakness[dim];
    return {
      id: uid(),
      dimension: dimensionLabel(dim),
      title: t.title,
      detail: t.detail,
      resources,
      done: false,
      createdAt: Date.now(),
      ...(typeof score === 'number' ? { score } : {}),
    } as LearningTask;
  });

  return NextResponse.json({ tasks });
}
