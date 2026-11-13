import type { LearningResource } from '@/lib/types';

export interface QuestionItem {
  id: string;
  dimension: string;
  topic: string;
  tags: string[];
  text: string;
  intent: string;
  reference: string;
  source: string;
  categories: string[];
}

/**
 * 面试题库 / 面经库
 * 分块方式：1 chunk = 1 题（含考察意图与参考答案），供 RAG 检索与题目选择。
 */
export const QUESTIONS: QuestionItem[] = [
  {
    id: 'q-01',
    dimension: 'evidence',
    topic: '项目量化',
    tags: ['项目', '量化', '结果', '指标'],
    text: '请挑一个你最有代表性的项目，说明你的职责、技术方案，以及最终带来了什么可衡量的结果。',
    intent: '验证候选人是否能把项目讲清楚，并用数据说明结果，而非只描述"做了什么"。',
    reference: '建议结构：背景与目标 → 我的职责 → 技术方案与取舍 → 量化结果（性能/效率/用户指标）→ 复盘。',
    source: '面经库 · 通用行为面',
    categories: ['前端', '后端', '算法', '数据', '产品', '测试', '客户端'],
  },
  {
    id: 'q-02',
    dimension: 'depth',
    topic: '技术选型',
    tags: ['选型', '架构', '权衡', '对比'],
    text: '你在这个项目中为什么选择 {tech}？如果换成另一种方案，你会怎么权衡？',
    intent: '考察技术选型是否有理由，而不是"别人用我也用"。',
    reference: '从业务场景、团队成本、性能、生态、可维护性五个角度做对比，并说明放弃的方案与原因。',
    source: '面经库 · 技术面通用',
    categories: ['前端', '后端', '客户端'],
  },
  {
    id: 'q-03',
    dimension: 'depth',
    topic: '性能优化',
    tags: ['性能', '首屏', 'LCP', '优化'],
    text: '你提到做过性能优化，能具体说明优化前后的指标变化，以及你是如何定位瓶颈吗？',
    intent: '验证性能优化是否真的做过，是否具备"测量—定位—验证"的完整闭环。',
    reference: '定位手段：Lighthouse / Performance 面板 / 火焰图；常用手段：代码分割、资源预加载、图片压缩、缓存策略；必须给出前后指标对比。',
    source: '面经库 · 前端性能专题',
    categories: ['前端', '客户端'],
  },
  {
    id: 'q-04',
    dimension: 'depth',
    topic: '基础原理',
    tags: ['JavaScript', '事件循环', '闭包', '原型'],
    text: '请解释一下 JavaScript 的事件循环机制，微任务和宏任务的执行顺序是怎样的？',
    intent: '考察语言基础是否扎实，是否只会用框架。',
    reference: '调用栈 → 宏任务队列 → 微任务队列；每次宏任务结束后清空微任务队列；Promise.then 属于微任务，setTimeout 属于宏任务。',
    source: '面经库 · JS 基础高频题',
    categories: ['前端'],
  },
  {
    id: 'q-05',
    dimension: 'depth',
    topic: '框架原理',
    tags: ['React', '虚拟DOM', 'Diff', '渲染'],
    text: 'React 的虚拟 DOM 和 Diff 算法解决了什么问题？在什么场景下它反而不占优势？',
    intent: '考察是否理解框架的设计动机，而非背 API。',
    reference: '解决跨平台与批量更新问题；Diff 采用同层比较 + key 优化；在极端频繁的小量更新或需要精细 DOM 操作时优势不明显。',
    source: '面经库 · React 专题',
    categories: ['前端'],
  },
  {
    id: 'q-06',
    dimension: 'depth',
    topic: '工程化',
    tags: ['Webpack', '构建', '代码分割', 'TreeShaking'],
    text: '你们项目的构建流程是怎样的？Webpack 的构建速度你做过哪些优化？',
    intent: '验证工程化能力，是否理解构建链路而非只会改配置。',
    reference: '可从 cache、多进程、DLL、externals、按需加载、Tree Shaking、产物分析等角度回答，并说明收益。',
    source: '面经库 · 前端工程化',
    categories: ['前端'],
  },
  {
    id: 'q-07',
    dimension: 'evidence',
    topic: '团队协作',
    tags: ['协作', '沟通', '冲突', '推进'],
    text: '讲一次你和后端或产品意见不一致的经历，你是怎么推动达成一致的？',
    intent: '考察沟通与推动能力，是否有真实冲突场景而非套话。',
    reference: '建议用 STAR：背景 → 分歧点 → 你做的信息收集与方案对比 → 最终结论 → 结果与反思。',
    source: '面经库 · 行为面',
    categories: ['前端', '后端', '算法', '数据', '产品', '测试', '客户端'],
  },
  {
    id: 'q-08',
    dimension: 'reflection',
    topic: '反思复盘',
    tags: ['复盘', '失败', '改进', '成长'],
    text: '说一个你做得不够好的项目或功能，如果重来一次你会怎么改？',
    intent: '考察反思深度，是否能把失败转化为方法论。',
    reference: '需明确指出问题（不是"时间不够"这类外部归因），给出具体改进动作与后续验证结果。',
    source: '面经库 · 行为面',
    categories: ['前端', '后端', '算法', '数据', '产品', '测试', '客户端'],
  },
  {
    id: 'q-09',
    dimension: 'depth',
    topic: '缓存策略',
    tags: ['HTTP', '缓存', '强缓存', '协商缓存'],
    text: '一个静态资源从请求到命中缓存，浏览器经历了什么？强缓存和协商缓存分别在什么场景使用？',
    intent: '考察网络基础与真实场景判断。',
    reference: '强缓存 Cache-Control / Expires；协商缓存 ETag / Last-Modified；带 hash 的静态资源用长强缓存，HTML 用协商缓存。',
    source: '面经库 · 浏览器与网络',
    categories: ['前端', '客户端'],
  },
  {
    id: 'q-10',
    dimension: 'depth',
    topic: '数据库',
    tags: ['MySQL', '索引', 'SQL优化', 'Explain'],
    text: '一条 SQL 变慢了，你会按什么顺序排查？索引失效的常见原因有哪些？',
    intent: '考察数据库问题定位能力，是否形成排查方法论。',
    reference: '慢查询日志 → Explain 执行计划 → 索引命中 → 数据量与回表 → 锁等待；失效原因：函数运算、隐式转换、最左前缀、范围查询后失效等。',
    source: '面经库 · 后端数据库',
    categories: ['后端', '数据'],
  },
  {
    id: 'q-11',
    dimension: 'depth',
    topic: '并发与稳定性',
    tags: ['Redis', '缓存', '一致性', '高并发'],
    text: '缓存和数据库的数据一致性你们是怎么保证的？遇到缓存击穿会怎么处理？',
    intent: '考察高并发场景下的工程判断。',
    reference: 'Cache Aside + 延迟双删 / 订阅 binlog 异步更新；击穿用互斥锁或逻辑过期；穿透用布隆过滤器。',
    source: '面经库 · 后端高并发',
    categories: ['后端'],
  },
  {
    id: 'q-12',
    dimension: 'depth',
    topic: 'RAG 架构',
    tags: ['RAG', '检索', '向量', '重排', '幻觉'],
    text: '你设计的 RAG 流程里，召回和重排分别怎么做？如何抑制模型幻觉？',
    intent: '考察是否真正做过 RAG，而非只调过 API。',
    reference: '混合检索（BM25 + 向量）+ RRF 融合 + 重排模型；生成侧强制引用、低相似度拒答、结构化约束。',
    source: '面经库 · 大模型应用',
    categories: ['算法', '数据', '产品'],
  },
  {
    id: 'q-13',
    dimension: 'evidence',
    topic: '模型评测',
    tags: ['评测', 'A/B', '指标', 'LLM'],
    text: '你如何评估一个大模型功能是否真的变好了？会设计哪些指标？',
    intent: '考察评测设计能力，是否只凭"感觉变好了"。',
    reference: '离线：人工标注集 + LLM-as-judge + 一致性校验；在线：任务完成率、采纳率、追问轮次、满意度；必须有对照组。',
    source: '面经库 · AI 产品评测',
    categories: ['算法', '数据', '产品'],
  },
  {
    id: 'q-14',
    dimension: 'relevance',
    topic: '需求分析',
    tags: ['需求', '用户', '优先级', 'PRD'],
    text: '你怎么判断一个需求值不值得做？请用一个你做过的需求举例说明。',
    intent: '考察需求判断力与优先级方法论。',
    reference: '用户价值 × 发生频率 × 实现成本；可用 RICE 或 KANO 排序；需要说明放弃了什么需求以及原因。',
    source: '面经库 · 产品经理',
    categories: ['产品'],
  },
  {
    id: 'q-15',
    dimension: 'depth',
    topic: '指标体系',
    tags: ['指标', '漏斗', '归因', 'A/B'],
    text: '如果某个功能的转化率突然下降了 20%，你会怎么排查？',
    intent: '考察结构化排查与归因能力。',
    reference: '先确认数据口径与埋点 → 拆分维度（渠道/机型/版本/人群）→ 漏斗定位环节 → 排除外部因素 → 结合实验验证。',
    source: '面经库 · 数据分析',
    categories: ['数据', '产品'],
  },
  {
    id: 'q-16',
    dimension: 'structure',
    topic: '系统设计',
    tags: ['设计', '扩展性', '容量', '方案'],
    text: '如果让你设计一个支持百万用户的短链接服务，你会怎么设计？',
    intent: '考察系统设计的结构化表达与容量估算。',
    reference: '容量估算 → 发号策略（自增/雪花/Base62）→ 存储与缓存 → 读写路径 → 高可用与限流 → 数据统计。',
    source: '面经库 · 系统设计',
    categories: ['后端', '算法'],
  },
  {
    id: 'q-17',
    dimension: 'depth',
    topic: '测试设计',
    tags: ['测试用例', '边界', '自动化'],
    text: '一个登录功能，你会怎么设计测试用例？如何判断哪些用例值得自动化？',
    intent: '考察测试思维的系统性与工程取舍。',
    reference: '功能/边界/异常/安全/兼容/性能六类；高频回归、稳定接口、数据可构造的用例优先自动化。',
    source: '面经库 · 测试开发',
    categories: ['测试'],
  },
  {
    id: 'q-18',
    dimension: 'depth',
    topic: '客户端性能',
    tags: ['启动优化', '内存', '卡顿', 'iOS'],
    text: 'App 启动慢，你会从哪些方面定位和优化？',
    intent: '考察客户端性能排查链路。',
    reference: '区分冷/热启动；用 Instruments / Systrace 采样；优化方向：二进制重排、懒加载、启动任务并发与延迟、资源裁剪。',
    source: '面经库 · 客户端',
    categories: ['客户端'],
  },
  {
    id: 'q-19',
    dimension: 'relevance',
    topic: '岗位理解',
    tags: ['岗位', '动机', '规划'],
    text: '你为什么想投这个岗位？你觉得自己的经历里哪一段和它最匹配？',
    intent: '考察求职动机与自我认知是否清晰。',
    reference: '需要把岗位 JD 的关键要求与自身经历一一对应，而不是泛泛表达"喜欢这个行业"。',
    source: '面经库 · HR 面',
    categories: ['前端', '后端', '算法', '数据', '产品', '测试', '客户端'],
  },
  {
    id: 'q-20',
    dimension: 'reflection',
    topic: '学习方法',
    tags: ['学习', '成长', '技术视野'],
    text: '最近半年你学过什么新技术？是怎么学的，有没有落地到项目里？',
    intent: '考察学习能力与技术落地能力。',
    reference: '需说明学习路径、验证方式（demo/项目）、以及落地效果，避免只列书单。',
    source: '面经库 · 综合面',
    categories: ['前端', '后端', '算法', '数据', '产品', '测试', '客户端'],
  },
];

export const LEARNING_RESOURCES: LearningResource[] = [
  {
    id: 'lr-01',
    title: '用数据讲项目：STAR 与量化表达',
    dimension: 'evidence',
    tags: ['项目', '量化', 'STAR', '表达'],
    source: '职途教研组',
    content:
      '把项目描述改写为「背景 → 目标 → 动作 → 结果」四段式。结果必须包含至少一个数字：性能指标（LCP/耗时）、业务指标（转化率/DAU）、工程指标（包体积/构建时长）。若没有数据，补充测量方法后再写。',
  },
  {
    id: 'lr-02',
    title: '前端性能优化闭环：测量 → 定位 → 验证',
    dimension: 'depth',
    tags: ['性能', 'LCP', 'Lighthouse', '优化'],
    source: '职途教研组',
    content:
      '第一步用 Lighthouse 与 Performance 面板采集基线；第二步定位瓶颈（网络/主线程/渲染）；第三步按优先级处理（资源压缩、代码分割、预加载、缓存）；第四步复测并记录前后对比。面试中必须给出数字。',
  },
  {
    id: 'lr-03',
    title: '技术选型的五维权衡法',
    dimension: 'depth',
    tags: ['选型', '架构', '权衡'],
    source: '职途教研组',
    content:
      '从业务场景匹配度、团队熟悉度、性能上限、生态成熟度、长期维护成本五个维度列表对比，明确写出「放弃方案 + 放弃原因」。面试官更在意你的取舍逻辑，而不是结论本身。',
  },
  {
    id: 'lr-04',
    title: 'RAG 工程实践：混合检索与引用约束',
    dimension: 'depth',
    tags: ['RAG', '检索', '重排', '幻觉'],
    source: '职途教研组',
    content:
      '召回阶段用 BM25 与向量双路并行，RRF 融合后重排取 Top3。生成阶段强制模型输出 chunkId 引用，相似度低于阈值时拒答并提示"库中暂无资料"。这样可以把幻觉变成可见的边界。',
  },
  {
    id: 'lr-05',
    title: '面试表达结构：结论先行 + 分点论证',
    dimension: 'structure',
    tags: ['表达', '结构', '沟通'],
    source: '职途教研组',
    content:
      '回答采用「结论 → 三点论据 → 补充边界」结构。每点控制在两句话内，先给判断再给原因。避免流水账式叙述，也避免只给结论不给证据。',
  },
  {
    id: 'lr-06',
    title: '复盘方法论：把失败变成可复用经验',
    dimension: 'reflection',
    tags: ['复盘', '反思', '成长'],
    source: '职途教研组',
    content:
      '复盘四问：当时的目标是什么？实际结果差在哪？根因是认知、方法还是执行？下次的具体动作是什么？根因必须向内归因，改进动作必须可验证。',
  },
  {
    id: 'lr-07',
    title: '浏览器渲染与事件循环速查',
    dimension: 'depth',
    tags: ['JavaScript', '事件循环', '浏览器', '渲染'],
    source: '职途教研组',
    content:
      '宏任务：script、setTimeout、setInterval、I/O；微任务：Promise.then、queueMicrotask、MutationObserver。每轮宏任务结束后清空微任务队列，再进入渲染。渲染流程：样式计算 → 布局 → 绘制 → 合成。',
  },
  {
    id: 'lr-08',
    title: 'SQL 慢查询排查清单',
    dimension: 'depth',
    tags: ['MySQL', '索引', 'Explain', 'SQL'],
    source: '职途教研组',
    content:
      '排查顺序：慢查询日志 → Explain 看 type/key/rows/Extra → 是否回表 → 数据量是否过大 → 是否存在锁等待。索引失效常见原因：列上做函数运算、隐式类型转换、不满足最左前缀、范围查询后续列失效。',
  },
  {
    id: 'lr-09',
    title: 'AI 功能评测设计模板',
    dimension: 'evidence',
    tags: ['评测', 'A/B', 'LLM', '指标'],
    source: '职途教研组',
    content:
      '离线侧构建 100 条人工标注集，定义 3 个核心维度与评分 rubric，用 LLM-as-judge 打分并抽检一致性；在线侧设置对照组，观察任务完成率、采纳率、平均追问轮次与满意度。',
  },
  {
    id: 'lr-10',
    title: '需求优先级：RICE 与 KANO',
    dimension: 'relevance',
    tags: ['需求', '优先级', 'RICE', '产品'],
    source: '职途教研组',
    content:
      'RICE = Reach × Impact × Confidence / Effort，适合排期；KANO 用于区分基础型、期望型、兴奋型需求。回答时要说明被放弃的需求及原因，体现取舍能力。',
  },
  {
    id: 'lr-11',
    title: '系统设计答题框架',
    dimension: 'structure',
    tags: ['系统设计', '容量', '高可用'],
    source: '职途教研组',
    content:
      '固定五步：需求澄清与容量估算 → 核心数据模型 → 读写路径 → 扩展与高可用 → 监控与降级。先画主干再补细节，避免一上来陷入组件选型。',
  },
  {
    id: 'lr-12',
    title: '求职岗位匹配：把 JD 翻译成能力项',
    dimension: 'relevance',
    tags: ['岗位', '匹配', 'JD', '简历'],
    source: '职途教研组',
    content:
      '把 JD 每条要求拆成「技能 + 深度 + 场景」三要素，再在自己的经历中找对应证据。命中就给证据，半命中就补深度，缺口就排进学习计划。',
  },
];

/** 示例简历（用于一键体验） */
export const SAMPLE_RESUME = `林知远
求职意向：前端开发工程师（校招）｜2026 届本科
电话：13800001111｜邮箱：linzhiyuan@example.com｜现居杭州

教育经历
2022.09 - 2026.06  浙江理工大学  计算机科学与技术  本科
GPA 3.7/4.0，专业排名前 10%

专业技能
语言：JavaScript、TypeScript、HTML、CSS
框架：React 18、Next.js 14、Vue 3、Tailwind CSS
工程：Webpack、Vite、Git、ESLint
其他：Node.js、微信小程序、HTTP 缓存、浏览器渲染原理

项目经历
2025.03 - 2025.09  校园二手交易平台（前端负责人）
- 使用 React + TypeScript 开发商品列表、搜索与聊天模块
- 负责首屏性能优化，通过路由懒加载与图片压缩改善加载体验
- 设计通用表单组件，复用于 6 个业务页面

2024.09 - 2025.01  在线课程学习系统（个人项目）
- 基于 Next.js 实现 SSR 渲染与课程详情页
- 接入 Web Speech API 实现语音字幕
- 使用 Tailwind CSS 搭建响应式界面

实习经历
2025.07 - 2025.09  杭州某科技有限公司  前端开发实习生
- 参与中后台管理系统开发，使用 Vue 3 + Element Plus
- 修复多端样式兼容问题 20 余个
- 参与组件库文档整理与维护

荣誉证书
蓝桥杯 Web 应用开发 省二等奖
CET-6
`;
