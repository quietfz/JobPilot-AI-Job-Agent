import Link from 'next/link';
import {
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  FileSearch,
  FileText,
  Gauge,
  Layers,
  MessageSquareCode,
  Mic,
  Quote,
  Radar,
  Route,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { LandingNav } from '@/components/landing-nav';
import { Reveal } from '@/components/reveal';

const PAINS = [
  {
    title: '改完简历，还是没回音',
    desc: '工具只给"话术建议"，却不知道你投的岗位到底要什么。改完依旧不知道为什么没过。',
    badge: '诊断不可信',
  },
  {
    title: '背了 100 题，一追问就崩',
    desc: '静态题库与你的简历无关，答完没有追问。真实面试的第一轮深挖，就足以暴露问题。',
    badge: '练习不真实',
  },
  {
    title: '面完只记得"好像答得不好"',
    desc: '没有记录、没有归因，同一个错误在下一场面试里重复出现。',
    badge: '复盘靠回忆',
  },
];

const CAPS = [
  {
    icon: ScanSearch,
    title: '可解释匹配',
    desc: '不给你一个"匹配度 78%"，而是逐条告诉你命中、半命中、缺口在哪，并附原文引用。',
  },
  {
    icon: BrainCircuit,
    title: '追问树 Agent',
    desc: '问题来自你的回答：缺数据就追问指标，只报名词就追问实现与选型，最多两层纵深。',
  },
  {
    icon: Radar,
    title: '动态能力雷达',
    desc: '边面边看五项能力形状变化，把抽象的"表现"变成可见反馈，并跨会话沉淀。',
  },
  {
    icon: Quote,
    title: '引用强制',
    desc: '每条结论都挂着简历原文或 JD 原文，检索不到就明说"暂无资料"，不编造。',
  },
  {
    icon: Mic,
    title: '语音作答',
    desc: '浏览器端实时转写，接近真实面试的语音压力；不支持的浏览器自动降级为文字。',
  },
  {
    icon: ShieldCheck,
    title: '隐私优先',
    desc: '简历只存本地，送模型前自动脱敏手机号、邮箱与证件号，Key 不落服务端。',
  },
];

const COMPARE = [
  { dim: '输入', old: '单份简历 / 固定题库', now: '简历 + 目标 JD + 历史表现' },
  { dim: '匹配', old: '一个黑盒匹配度百分比', now: '命中 / 半命中 / 缺口，逐条附引用' },
  { dim: '追问', old: '固定脚本，答完即止', now: '顺着回答深挖，最多两层追问' },
  { dim: '复盘', old: '只给一个总分', now: '时间轴 + 逐句失分证据 + 扣分理由' },
  { dim: '闭环', old: '面试结束就断了', now: '复盘 → 学习任务 → 下一场验证' },
];

const FLOW = [
  { title: '简历解析', desc: '结构化画像' },
  { title: '岗位对齐', desc: '三态可解释' },
  { title: '模拟面试', desc: '追问树深挖' },
  { title: '时间轴复盘', desc: '逐轮归因' },
  { title: '学习补齐', desc: '任务化验证' },
];

const STATS = [
  { value: '68', label: '校招岗位', desc: '前端 / 后端 / 算法 / 产品等' },
  { value: '5', label: '评分维度', desc: '20 / 25 / 15 / 25 / 15 满分' },
  { value: '20', label: '面经题库', desc: '按岗位与能力点编排' },
  { value: '0', label: '注册门槛', desc: '本地优先，打开即用' },
];

const DIMS = [
  { label: '岗位相关性', value: 82 },
  { label: '技术深度', value: 68 },
  { label: '关键词覆盖', value: 74 },
  { label: '量化证据', value: 46 },
  { label: '结构清晰度', value: 86 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />

      <section className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
        <div className="grid-bg absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-[120px]" />
        <div className="absolute -right-28 top-44 h-[300px] w-[300px] rounded-full bg-hit/10 blur-[100px]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-16">
          <div className="animate-fade-up">
            <span className="chip border-brand-200 bg-brand-50 text-brand-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              AI Agent · RAG · 多模态 · AI 安全
            </span>
            <h1 className="mt-5 text-[40px] font-semibold leading-[1.14] tracking-tight text-ink-900 sm:text-[52px]">
              把每一次面试失分，
              <br />
              变成下一步的<span className="gradient-text">行动</span>。
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-500">
              职途 JobPilot 是一个有记忆、会追问、能陪跑的 AI 求职 Agent。
              它读懂你的简历，理解岗位的真实要求，像真面试官一样顺着你的回答往下挖，
              并把每一处扣分变成可执行的学习任务。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/workspace" className="btn-primary px-5 py-3">
                免费开始（无需登录）
                <ArrowRight size={16} />
              </Link>
              <Link href="/interview" className="btn-ghost px-5 py-3">
                直接试一场面试
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-2 text-[12px] text-ink-400">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> 本地保存简历</span>
              <span className="inline-flex items-center gap-1.5"><Quote size={13} /> 结论可溯源</span>
              <span className="inline-flex items-center gap-1.5"><Target size={13} /> 三态匹配</span>
            </div>
          </div>

          <div className="animate-fade-up [animation-delay:120ms]">
            <div className="card relative overflow-hidden p-4 shadow-lift">
              <div className="flex items-center justify-between gap-2 border-b border-ink-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-gap/50" />
                  <span className="h-2 w-2 rounded-full bg-partial/50" />
                  <span className="h-2 w-2 rounded-full bg-hit/50" />
                </div>
                <span className="truncate text-[11px] text-ink-400">简历诊断 · 前端开发（校招）</span>
                <span className="chip border-hit/20 bg-hit/10 px-2 py-0 text-[10px] text-hit">已完成</span>
              </div>

              <div className="flex items-center gap-4 py-4">
                <div className="relative h-[92px] w-[92px] shrink-0">
                  <svg viewBox="0 0 92 92" className="h-full w-full -rotate-90">
                    <circle cx="46" cy="46" r="38" fill="none" stroke="#EDF0F7" strokeWidth="7" />
                    <circle
                      cx="46"
                      cy="46"
                      r="38"
                      fill="none"
                      stroke="#2F4BFF"
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * 0.22}
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-[21px] font-semibold tabular-nums leading-none">78</div>
                      <div className="mt-1 text-[9px] text-ink-400">综合得分</div>
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {DIMS.map((d) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-[10px]">
                        <span className="text-ink-500">{d.label}</span>
                        <span className="font-medium tabular-nums text-ink-700">{d.value}</span>
                      </div>
                      <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className={`h-1 rounded-full ${d.value >= 80 ? 'bg-hit' : d.value >= 60 ? 'bg-brand-500' : 'bg-partial'}`}
                          style={{ width: `${d.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-ink-100 bg-ink-50/70 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-500">
                  <Gauge size={12} />
                  优先修改 · 量化与证据
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-600">
                  项目描述只有"负责首页开发"，没有可衡量的结果。建议补成"首屏 3.5s → 1.2s"。
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2 py-0.5 text-[10px] text-brand-700">
                    <FileText size={10} /> 简历原文
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-[10px] text-ink-500 ring-1 ring-ink-200">
                    <Layers size={10} /> JD 要求
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {[
                  ['命中', '6', 'text-hit bg-hit/10'],
                  ['半命中', '2', 'text-partial bg-partial/10'],
                  ['缺口', '1', 'text-gap bg-gap/10'],
                ].map(([label, count, cls]) => (
                  <div key={label} className={`rounded-lg px-2 py-1.5 ${cls}`}>
                    <div className="text-[10px] opacity-80">{label}</div>
                    <div className="text-[15px] font-semibold tabular-nums">{count}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-ink-400">
              示例数据 · 真实结果来自你的简历与目标岗位
            </p>
          </div>
        </div>

        <a
          href="#why"
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] text-ink-400 transition hover:text-ink-600 sm:flex"
        >
          <span>向下了解</span>
          <ChevronDown size={16} className="animate-bounce" />
        </a>
      </section>

      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-2">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 70} className="h-full">
              <div className="stat-card h-full">
                <div className="text-[22px] font-semibold tracking-tight tabular-nums">
                  {s.value}
                  <span className="ml-1 text-[11px] font-normal text-ink-400">{s.label}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-ink-400">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="why" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="mb-10 max-w-2xl">
            <span className="eyebrow">问题定义</span>
            <h2 className="mt-3 text-[28px] font-semibold tracking-tight">
              求职最缺的不是建议，而是一个记得你的对手
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink-500">
              求职是长达数月的多轮过程，但现有工具是割裂的：改简历一个网站、刷题一个 App、复盘靠脑子。
              上一场的弱点，下一场没人记得。
            </p>
          </div>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {PAINS.map((p, i) => (
            <Reveal key={p.title} delay={i * 70} className="h-full">
              <div className="card card-hover flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-ink-300">0{i + 1}</span>
                  <span className="chip text-[10px]">{p.badge}</span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold">{p.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="compare" className="border-y border-ink-200/70 bg-ink-50/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <div className="mb-8 max-w-2xl">
              <span className="eyebrow">与现有产品的差异</span>
              <h2 className="mt-3 text-[28px] font-semibold tracking-tight">
                不是又一个简历润色工具，而是完整的求职状态机
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-ink-500">
                同样叫"AI 求职"，差别在于是否记得你、是否能解释、是否能持续追踪。
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
          <div className="overflow-x-auto rounded-xl2 border border-ink-200/80 bg-white shadow-card">
            <div className="min-w-[620px]">
              <div className="grid grid-cols-[110px_1fr_1.15fr] border-b border-ink-200/80 bg-ink-50/80 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                <span>维度</span>
                <span>常见工具</span>
                <span className="text-brand-600">职途 JobPilot</span>
              </div>
              {COMPARE.map((r, i) => (
                <div
                  key={r.dim}
                  className={`grid grid-cols-[110px_1fr_1.15fr] items-start gap-3 px-5 py-3.5 text-[12.5px] ${i % 2 ? 'bg-ink-50/40' : ''}`}
                >
                  <span className="font-medium text-ink-700">{r.dim}</span>
                  <span className="text-ink-400">{r.old}</span>
                  <span className="flex items-start gap-1.5 text-ink-700">
                    <Check size={14} className="mt-0.5 shrink-0 text-hit" />
                    {r.now}
                  </span>
                </div>
              ))}
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      <section id="capability" className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <span className="eyebrow">核心能力</span>
            <h2 className="mt-3 text-[28px] font-semibold tracking-tight">
              六项 AI 能力，构成一个闭环
            </h2>
          </div>
          <Link href="/workspace" className="btn-ghost px-4 py-2 text-[13px]">
            看看实际效果
            <ArrowRight size={14} />
          </Link>
        </div>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAPS.map((c, i) => (
            <Reveal key={c.title} delay={i * 70} className="h-full">
              <div className="card card-hover group flex h-full flex-col p-5">
                <div className="icon-tile mb-3 h-9 w-9 transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">
                  <c.icon size={17} />
                </div>
                <h3 className="text-[14px] font-semibold">{c.title}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="flow" className="border-t border-ink-200/70 bg-ink-50/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Reveal>
            <div className="mb-10 text-center">
              <span className="eyebrow">闭环流程</span>
              <h2 className="mt-3 text-[28px] font-semibold tracking-tight">一份弱点数据，贯穿整个求职周期</h2>
              <p className="mx-auto mt-3 max-w-xl text-[13.5px] leading-relaxed text-ink-500">
                上一场的失分点，决定下一场考察什么。每完成一轮，能力雷达与学习任务都会更新。
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {FLOW.map((f, i) => (
              <div key={f.title} className="flex items-center gap-2.5">
                <div className="card px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-50 text-[10px] font-semibold text-brand-600">
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-medium">{f.title}</span>
                  </div>
                  <p className="mt-0.5 pl-7 text-[11px] text-ink-400">{f.desc}</p>
                </div>
                {i < FLOW.length - 1 && <ArrowRight size={15} className="text-ink-300" />}
              </div>
            ))}
          </div>
          </Reveal>

          <Reveal delay={120}>
          <div className="relative mt-12 overflow-hidden rounded-2xl bg-ink-900 px-6 py-11 text-center sm:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(47,75,255,0.4),transparent_62%)]" />
            <div className="grid-bg absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
            <div className="relative">
              <FileSearch className="mx-auto mb-4 text-brand-300" size={26} />
              <h3 className="text-[22px] font-semibold text-white">先导入一份简历，三分钟看到诊断</h3>
              <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-white/60">
                无需注册，无需 API Key。数据只存在你的浏览器里，刷新不丢失。
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link href="/resume" className="btn-primary px-5 py-3">
                  导入简历开始
                  <ArrowRight size={16} />
                </Link>
                <Link href="/interview" className="btn px-5 py-3 text-white/80 hover:text-white">
                  <MessageSquareCode size={15} />
                  体验模拟面试
                </Link>
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-ink-200/70 bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-[12px] text-ink-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-brand-500 text-white">
              <Sparkles size={12} />
            </span>
            <span>职途 JobPilot · 全国高校 AI Web 开发挑战赛参赛作品</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/workspace" className="inline-flex items-center gap-1 hover:text-ink-700">
              <Route size={12} /> 工作台
            </Link>
            <span>AI 建议仅供参考，请结合真实情况判断</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
