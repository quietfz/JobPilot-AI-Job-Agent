import type { Job, MatchItem, MatchResult, ResumeProfile } from '@/lib/types';
import { tokenize } from '@/lib/rag/retrieve';
import { clamp } from '@/lib/utils';

function scores(resumeTokens: Set<string>, reqText: string) {
  const tokens = tokenize(reqText);
  if (!tokens.length) return 0;
  let hit = 0;
  for (const t of tokens) if (resumeTokens.has(t)) hit += 1;
  return hit / tokens.length;
}

function bestQuote(profile: ResumeProfile, reqText: string): string {
  const reqTokens = new Set(tokenize(reqText));
  const candidates = [
    ...profile.projects.flatMap((p) => [p.name, ...p.bullets]),
    ...profile.experiences.flatMap((e) => [e.company, ...e.bullets]),
    ...profile.skills,
  ];
  let best = '';
  let bestScore = 0;
  for (const c of candidates) {
    let s = 0;
    for (const t of tokenize(c)) if (reqTokens.has(t)) s += 1;
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
  }
  return bestScore > 0 ? best.slice(0, 80) : '';
}

/**
 * 双向能力对齐：确定性分档 + 引用。
 * 直接命中岗位核心技能 → 命中；无直接技能但文本高度相关 → 半命中；其余为缺口。
 */
export function matchJob(
  profile: ResumeProfile,
  rawText: string,
  job: Job,
): MatchResult {
  const resumeTokens = new Set(tokenize(rawText + ' ' + profile.skills.join(' ')));
  const items: MatchItem[] = job.requirements.map((req) => {
    const overlap = scores(resumeTokens, req.text);
    const skillHit =
      profile.skills.includes(req.skill) ||
      rawText.toLowerCase().includes(req.skill.toLowerCase());
    const value = skillHit ? 74 + overlap * 20 : 20 + overlap * 45;
    const score = clamp(value);

    let state: MatchItem['state'] = 'gap';
    if (score >= 70) state = 'hit';
    else if (score >= 40) state = 'partial';

    const quote = bestQuote(profile, req.text);
    const reason =
      state === 'hit'
        ? '简历中有直接对应的技能与经历证据'
        : state === 'partial'
          ? '有相关背景，但缺少深度或量化证据'
          : '简历中未找到对应描述';

    return {
      requirementId: req.id,
      text: req.text,
      jobQuote: req.text,
      resumeQuote: quote,
      score,
      state,
      reason,
    };
  });

  const weight = (i: MatchItem) => (i.state === 'hit' ? 1 : i.state === 'partial' ? 0.5 : 0);
  const total = items.reduce((s, i) => s + weight(i), 0);
  const score = clamp((total / Math.max(1, items.length)) * 100);

  return {
    jobId: job.id,
    score,
    hits: items.filter((i) => i.state === 'hit'),
    partials: items.filter((i) => i.state === 'partial'),
    gaps: items.filter((i) => i.state === 'gap'),
  };
}
