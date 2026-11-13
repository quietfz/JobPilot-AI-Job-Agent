import type {
  DiagnosisIssue,
  DiagnosisReport,
  Job,
  ResumeProfile,
} from '@/lib/types';
import { matchSkills } from '@/lib/data/skills';
import { clamp, uid } from '@/lib/utils';

/** ---------------- 简历解析（本地启发式，无 Key 可用） ---------------- */

const SECTION_KEYS: Record<string, string[]> = {
  education: ['教育经历', '教育背景', '学历'],
  skills: ['专业技能', '技能', '技术栈'],
  projects: ['项目经历', '项目经验', '项目'],
  experience: ['实习经历', '工作经历', '实习', '工作经验'],
  certificates: ['荣誉证书', '证书', '获奖'],
  summary: ['自我评价', '个人总结', '简介'],
};

const DATE_RANGE =
  /(\d{4}[.\-/年]\s?\d{1,2}月?\s*(?:[-–—~至到]\s*(?:\d{4}[.\-/年]\s?\d{1,2}月?|至今|现在))?)/;
const DATE_START = /\d{4}[.\-/年]\s?\d{1,2}月?/;

function headingOf(line: string): string | null {
  const t = line.trim().replace(/^[#\s]+/, '');
  for (const [key, words] of Object.entries(SECTION_KEYS)) {
    if (words.some((w) => t === w || t.startsWith(w))) return key;
  }
  const lower = t.toLowerCase();
  if (/education|school/.test(lower)) return 'education';
  if (/skill|tech/.test(lower)) return 'skills';
  if (/project/.test(lower)) return 'projects';
  if (/experience|work|intern/.test(lower)) return 'experience';
  if (/award|certificate|honor/.test(lower)) return 'certificates';
  if (/summary|self|profile/.test(lower)) return 'summary';
  return null;
}

export function parseResumeText(raw: string): ResumeProfile {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const sections: Record<string, string[]> = {};
  let current = '';
  for (const line of lines) {
    const h = headingOf(line);
    if (h) {
      current = h;
      sections[current] = sections[current] ?? [];
      continue;
    }
    if (current) sections[current].push(line);
  }

  // 兜底：若未识别到任何标准分节，按日期行在全文中切分项目/实习条目
  if (Object.keys(sections).filter((k) => sections[k].length).length < 2) {
    const dateLines: { idx: number; line: string }[] = [];
    lines.forEach((line, idx) => {
      if (DATE_START.test(line) && line.length < 80) dateLines.push({ idx, line });
    });
    const entries: string[][] = [];
    dateLines.forEach((d, i) => {
      const end = dateLines[i + 1]?.idx ?? lines.length;
      entries.push(lines.slice(d.idx, end));
    });
    // 粗略区分实习（含公司/实习字样）与项目
    const projects: string[] = [];
    const experiences: string[] = [];
    for (const e of entries) {
      if (/实习|公司|研究院|科技|有限|集团|互联网/.test(e.join(' '))) experiences.push(...e, '');
      else projects.push(...e, '');
    }
    if (!sections.projects?.length) sections.projects = projects;
    if (!sections.experience?.length) sections.experience = experiences;
    if (!sections.skills?.length) {
      // 全文扫一次技能相关行
      sections.skills = lines.filter((l) =>
        /熟练|熟悉|掌握|语言|框架|前端|后端|开发|工具|数据库|算法|系统/.test(l),
      );
    }
  }

  const name =
    lines[0] && lines[0].length <= 12 && !/[：:｜|]/.test(lines[0]) ? lines[0] : '同学';
  const intentLine = lines.find((l) => l.includes('求职意向') || l.includes('意向岗位'));
  const targetRole = intentLine
    ? intentLine.replace(/求职意向|意向岗位|目标岗位/g, '').replace(/^[：:｜|\s]+/, '').split(/[｜|]/)[0].trim()
    : '';

  const education = (sections.education ?? [])
    .filter((l) => !headingOf(l))
    .slice(0, 4)
    .map((l) => {
      const parts = l.split(/\s{2,}|\t|｜|\|/).filter(Boolean);
      const dateMatch = l.match(DATE_RANGE)?.[1] ?? '';
      const rest = parts.filter((p) => p !== dateMatch);
      return {
        school: rest[0] ?? l.slice(0, 20),
        major: rest[1] ?? '',
        degree: rest[2] ?? (/本科|硕士|博士/.exec(l)?.[0] ?? ''),
        period: dateMatch,
      };
    });

  const skills: string[] = [];
  const SKIP_LABELS = new Set([
    '语言', '框架', '工程', '工具', '其他', '数据库', '中间件', '基础', '技能', '技术栈',
    '前端', '后端', '开发', '熟悉', '熟练', '掌握', '了解',
  ]);
  for (const l of sections.skills ?? []) {
    const chunks = l.split(/[：:、，,；;/]/).map((x) => x.trim()).filter(Boolean);
    for (const c of chunks) {
      if (c.length > 24 || SKIP_LABELS.has(c)) continue;
      const matched = matchSkills(c);
      if (matched.length) skills.push(...matched);
      else if (c.length <= 12) skills.push(c);
    }
  }
  const allText = raw + '\n' + skills.join(' ');
  for (const s of matchSkills(allText)) if (!skills.includes(s)) skills.push(s);

  const parseEntries = (list: string[]) => {
    const out: { head: string; date: string; bullets: string[]; extra: string[] }[] = [];
    let cur: { head: string; date: string; bullets: string[]; extra: string[] } | null = null;
    for (const line of list) {
      const dm = line.match(DATE_RANGE);
      const isBullet = /^[-•·*]/.test(line);
      if (dm) {
        if (cur) out.push(cur);
        cur = {
          head: line.replace(dm[1], '').replace(/^[-•·*\s]+/, '').trim(),
          date: dm[1].replace(/\s+/g, ''),
          bullets: [],
          extra: [],
        };
      } else if (isBullet) {
        (cur ??= { head: '', date: '', bullets: [], extra: [] }).bullets.push(
          line.replace(/^[-•·*]\s*/, ''),
        );
      } else if (cur) {
        if (!cur.head) cur.head = line;
        else cur.extra.push(line);
      }
    }
    if (cur) out.push(cur);
    return out;
  };

  const projectEntries = parseEntries(sections.projects ?? []);
  const expEntries = parseEntries(sections.experience ?? []);

  const splitHead = (head: string) => {
    const parts = head.split(/[（(｜|]/).map((p) => p.replace(/[）)]/g, '').trim()).filter(Boolean);
    return { title: parts[0] ?? head, role: parts[1] ?? '' };
  };

  const projects = projectEntries.slice(0, 5).map((e) => {
    const { title, role } = splitHead(e.head);
    return { name: title || '项目', role, period: e.date, bullets: e.bullets.length ? e.bullets : e.extra };
  });

  const experiences = expEntries.slice(0, 5).map((e) => {
    const { title, role } = splitHead(e.head);
    return {
      company: title || '公司',
      role,
      period: e.date,
      bullets: e.bullets.length ? e.bullets : e.extra,
    };
  });

  const certificates = (sections.certificates ?? []).slice(0, 6).map((l) => l.replace(/^[-•·*]\s*/, ''));

  return {
    name,
    targetRole: targetRole || '目标岗位',
    education,
    experiences,
    projects,
    skills: Array.from(new Set(skills)).slice(0, 30),
    certificates,
    summary: (sections.summary ?? []).join(' ').slice(0, 200),
  };
}

/** ---------------- 简历诊断（依据《全岗位通用简历评分标准》） ---------------- */

// 维度定义：满分值与权重（满分值之和 = 100）
const DIM_META = [
  { key: 'relevance', label: '岗位相关性', max: 20 },
  { key: 'depth', label: '技术/业务深度', max: 25 },
  { key: 'keywords', label: '关键词覆盖', max: 15 },
  { key: 'evidence', label: '量化与证据', max: 25 },
  { key: 'structure', label: '结构清晰度', max: 15 },
] as const;

// 深度体现关键词（来自标准模块二，按岗位类别聚合）
const DEPTH_TERMS = [
  '性能优化', '虚拟列表', '防抖', '节流', '懒加载', '分包', 'Tree Shaking', '首屏',
  '渲染', '事件循环', '原型链', '响应式', '跨域', '缓存', 'CDN',
  '索引', '慢查询', 'QPS', '高并发', '分布式锁', '消息队列', '削峰', 'JWT',
  '微服务', '容器', 'K8s', 'JVM',
  '模型调优', '数据清洗', '召回率', '准确率', 'Loss', '部署', '微调', '向量',
  'ETL', '漏斗', 'A/B', '归因', '指标体系', '用户画像',
  '启动速度', '包体积', 'Crash', '内存泄漏', 'OOM', '卡顿',
  '自动化测试', '压测', 'CI/CD', '流水线',
  'Prompt', '大模型', 'RAG', 'AARRR', '裂变', 'MVP',
  '重构', '架构', '权衡', '原理', '机制', '解决了', '解决', '降低', '提升',
];

function countHits(text: string, terms: string[]): number {
  const lower = text.toLowerCase();
  return terms.filter((t) => lower.includes(t.toLowerCase())).length;
}

export function diagnoseResume(
  raw: string,
  profile: ResumeProfile,
  job: Job,
): DiagnosisReport {
  const lower = (raw + ' ' + profile.skills.join(' ')).toLowerCase();
  const jobSkills = job.skills;
  const matched = jobSkills.filter(
    (s) => profile.skills.includes(s) || lower.includes(s.toLowerCase()),
  );
  const matchRatio = matched.length / Math.max(1, jobSkills.length);

  const bullets = [
    ...profile.projects.flatMap((p) => p.bullets),
    ...profile.experiences.flatMap((e) => e.bullets),
  ];
  const expText = bullets.join(' ');

  /** 1. 岗位相关性（20 分） */
  // 相关经历 = 项目/实习条目中出现命中技能的条目数
  const relevantExp =
    profile.projects.filter((p) => matched.some((s) => (p.name + p.bullets.join(' ')).toLowerCase().includes(s.toLowerCase()))).length +
    profile.experiences.filter((e) => matched.some((s) => (e.company + e.bullets.join(' ')).toLowerCase().includes(s.toLowerCase()))).length;
  const relevanceRaw = clamp(
    matchRatio * 12 + (relevantExp >= 2 ? 6 : relevantExp === 1 ? 3 : 0) + (matched.length ? 2 : 0),
    0,
    20,
  );

  /** 2. 技术/业务深度（25 分） */
  const depthHits = countHits(expText, DEPTH_TERMS);
  const hasCausal = /(因为|所以|因此|通过|采用|为了|权衡|解决|重构|优化)/.test(expText);
  const depthRaw = clamp(
    6 + depthHits * 2.2 + (hasCausal ? 7 : 0) + (profile.projects.length > 1 ? 4 : 0),
    0,
    25,
  );

  /** 3. 关键词覆盖（15 分） */
  // must 类技能命中权重更高
  const mustSkills = job.requirements.filter((r) => r.type === 'must').map((r) => r.skill);
  const mustHit = mustSkills.filter((s) => matched.includes(s)).length;
  const keywordsRaw = clamp(
    matchRatio * 9 + (mustHit / Math.max(1, mustSkills.length)) * 6,
    0,
    15,
  );

  /** 4. 量化与证据（25 分） */
  const quantified = bullets.filter((b) => /\d/.test(b)).length;
  const hasComparison = /(从.{0,6}(到|降至|降到|提升到|降至)|降低.{0,4}%|提升.{0,4}%|减少.{0,4}%|增长.{0,4}%)/.test(expText);
  const hasLink = /(github|gitee|demo|演示|链接)/i.test(raw);
  const evidenceRaw = clamp(
    (bullets.length ? (quantified / bullets.length) * 16 : 0) +
      (hasComparison ? 6 : 0) +
      (hasLink ? 3 : 0),
    0,
    25,
  );

  /** 5. 结构清晰度（15 分） */
  const structureRaw = clamp(
    3 +
      (profile.education.length ? 3 : 0) +
      (profile.skills.length ? 2 : 0) +
      (profile.projects.length ? 4 : 0) +
      (profile.experiences.length ? 2 : 0) +
      (profile.certificates.length ? 1 : 0),
    0,
    15,
  );

  const rawScores: Record<string, number> = {
    relevance: relevanceRaw,
    depth: depthRaw,
    keywords: keywordsRaw,
    evidence: evidenceRaw,
    structure: structureRaw,
  };

  const dimensions = DIM_META.map((d) => ({
    key: d.key,
    label: d.label,
    raw: Math.round(rawScores[d.key] * 10) / 10,
    max: d.max,
    score: Math.round((rawScores[d.key] / d.max) * 100),
  }));

  // 总分 = 各维度原始得分之和（满分 100）
  const score = Math.round(
    relevanceRaw + depthRaw + keywordsRaw + evidenceRaw + structureRaw,
  );

  const issues: DiagnosisIssue[] = [];
  const mustReq = job.requirements.filter((r) => r.type === 'must');
  const missing = jobSkills.filter((s) => !matched.includes(s));

  // 1) 岗位相关性不足
  if (relevanceRaw < 10) {
    issues.push({
      id: uid(),
      severity: 'high',
      dimension: '岗位相关性',
      title: relevantExp === 0 ? '缺少与目标岗位相关的项目/实习经历' : '相关经历不足，方向偏位',
      detail:
        relevantExp === 0
          ? '你的项目/实习与「' + job.title + '」的技术栈和业务场景重合度低，HR 初筛容易直接淘汰。'
          : '只有 1 段相关经历，建议再补充 1 段高度垂直的项目（技术栈与 JD 重合）。',
      resumeQuote: matched.length ? `已命中技能：${matched.slice(0, 5).join('、')}` : '未命中岗位技能',
      jobQuote: mustReq[0]?.text ?? '',
      suggestion: `挑 1-2 个使用 ${jobSkills.slice(0, 3).join('、')} 的真实项目写进简历，技术栈与业务场景尽量对齐 JD。`,
    });
  }

  // 2) 技术深度不足
  if (depthRaw < 10) {
    issues.push({
      id: uid(),
      severity: depthRaw < 6 ? 'high' : 'medium',
      dimension: '技术/业务深度',
      title: '项目描述停留在"做了什么"，缺少"怎么做"与"为什么"',
      detail: '只有工具/框架罗列，没有底层原理、复杂问题解决或性能/架构思考，难以体现高薪潜力。',
      resumeQuote: bullets.find((b) => b.length > 6)?.slice(0, 60) ?? '项目描述偏短',
      jobQuote: mustReq.find((r) => /原理|机制|优化|架构/.test(r.text))?.text ?? mustReq[0]?.text ?? '',
      suggestion: '把"使用了虚拟列表"改为"通过计算可视区域高度与滚动偏移，结合防抖，解决万级数据渲染卡顿"这类句式。',
    });
  }

  // 3) 关键词覆盖不足
  if (keywordsRaw < 9) {
    issues.push({
      id: uid(),
      severity: keywordsRaw < 5 ? 'high' : 'medium',
      dimension: '关键词覆盖',
      title: '目标岗位硬核关键词覆盖不足',
      detail: `命中 ${matched.length}/${jobSkills.length}（must 命中 ${mustHit}/${mustSkills.length}），可能过不了 ATS 机器筛选。`,
      resumeQuote: matched.length ? `已命中：${matched.slice(0, 6).join('、')}` : '未命中岗位关键词',
      jobQuote: job.requirements[0]?.text ?? '',
      suggestion: `优先把 ${missing.slice(0, 3).join('、')} 中你真正掌握的，写进项目描述的行动或结果里。`,
    });
  }

  // 4) 量化与证据不足
  if (evidenceRaw < 10) {
    const vague = bullets.find((b) => !/\d/.test(b) && /优化|提升|改善|负责|参与|实现/.test(b));
    issues.push({
      id: uid(),
      severity: evidenceRaw < 6 ? 'high' : 'medium',
      dimension: '量化与证据',
      title: hasComparison ? '有数据但缺前后对比' : '经历描述无可衡量的结果',
      detail: hasComparison
        ? '有数字但没有"从 X 到 Y"的对比，招聘方看不出你的实际贡献。'
        : '全篇主观形容词或流水账，成果无法归因，面试中极易被追问。',
      resumeQuote: vague?.slice(0, 60) ?? '项目描述中缺少数字',
      jobQuote: mustReq.find((r) => /性能|优化|结果/.test(r.text))?.text ?? mustReq[0]?.text ?? '',
      suggestion: '用 STAR 句式补结果："通过 Webpack 分包与懒加载（行动），首屏从 3.5s 降至 1.2s，跳出率降低 15%（结果）"。',
    });
  }

  // 5) 结构清晰度不足
  if (structureRaw < 8) {
    issues.push({
      id: uid(),
      severity: 'low',
      dimension: '结构清晰度',
      title: '简历模块不完整或排版待优化',
      detail: '建议固定模块顺序：基本信息 → 教育 → 技能 → 项目 → 实习 → 奖项，控制在单页 PDF。',
      resumeQuote: `已识别模块：${[
        profile.education.length && '教育',
        profile.skills.length && '技能',
        profile.projects.length && '项目',
        profile.experiences.length && '实习',
        profile.certificates.length && '奖项',
      ].filter(Boolean).join('、') || '无'}`,
      jobQuote: '',
      suggestion: '补全缺失模块；技术栈用加粗高亮；避免用进度条展示熟练度（HR 大忌）。',
    });
  }

  const summary =
    score >= 80
      ? '整体匹配度较高（优秀区间）。建议继续打磨量化结果与项目深度，面试中主动展示底层思考。'
      : score >= 60
        ? '基础匹配尚可（及格区间）。按下方清单优先补齐关键词与量化证据，再做模拟面试验证。'
        : '与目标岗位差距较大（不合格区间）。先补齐核心技能与项目描述，重构后再投递。';

  return {
    score,
    dimensions,
    issues: issues.slice(0, 6),
    summary,
    jobId: job.id,
    jobTitle: job.title,
  };
}
