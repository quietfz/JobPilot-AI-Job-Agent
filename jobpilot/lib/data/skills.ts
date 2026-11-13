/** 技能词典：用于简历技能抽取与岗位关键词覆盖计算 */
export const SKILL_DICT: { name: string; aliases: string[] }[] = [
  { name: 'JavaScript', aliases: ['javascript', 'js', 'es6'] },
  { name: 'TypeScript', aliases: ['typescript', 'ts'] },
  { name: 'React', aliases: ['react', 'react.js', 'react18'] },
  { name: 'Vue', aliases: ['vue', 'vue3', 'vue.js'] },
  { name: 'Next.js', aliases: ['next.js', 'nextjs', 'next'] },
  { name: 'Nuxt', aliases: ['nuxt'] },
  { name: 'Node.js', aliases: ['node.js', 'nodejs', 'node'] },
  { name: 'Webpack', aliases: ['webpack'] },
  { name: 'Vite', aliases: ['vite'] },
  { name: 'CSS', aliases: ['css', 'sass', 'scss', 'less'] },
  { name: 'Tailwind', aliases: ['tailwind'] },
  { name: 'HTML', aliases: ['html', 'html5'] },
  { name: '小程序', aliases: ['小程序', '微信小程序', 'miniprogram'] },
  { name: 'Taro', aliases: ['taro', 'uni-app', 'uniapp'] },
  { name: 'Element Plus', aliases: ['element plus', 'element-plus', 'element ui', 'ant design', 'antd'] },
  { name: '性能优化', aliases: ['性能优化', '首屏', 'lcp', 'fcp', '加载速度', '懒加载', '代码分割'] },
  { name: '工程化', aliases: ['工程化', '组件库', '构建', 'cdn', 'ci/cd', 'eslint'] },
  { name: '浏览器', aliases: ['浏览器', '渲染原理', 'http', '缓存', '跨域', '事件循环'] },
  { name: '可视化', aliases: ['echarts', 'd3', '可视化', '图表'] },
  { name: '埋点', aliases: ['埋点', '数据上报', 'a/b', 'ab测试', '实验平台'] },
  { name: 'SSR', aliases: ['ssr', '服务端渲染', '同构'] },
  { name: 'Java', aliases: ['java', 'jvm'] },
  { name: 'Spring Boot', aliases: ['spring boot', 'springboot', 'spring cloud'] },
  { name: 'Go', aliases: ['golang', 'go语言'] },
  { name: 'Python', aliases: ['python'] },
  { name: 'C++', aliases: ['c++', 'cpp'] },
  { name: 'MySQL', aliases: ['mysql', '数据库', 'sql'] },
  { name: 'Redis', aliases: ['redis', '缓存'] },
  { name: '消息队列', aliases: ['kafka', 'rocketmq', 'rabbitmq', '消息队列'] },
  { name: '微服务', aliases: ['微服务', 'grpc', '服务发现', '限流', '熔断'] },
  { name: '分布式', aliases: ['分布式', '高并发', '高可用'] },
  { name: 'Docker', aliases: ['docker', '容器'] },
  { name: 'K8s', aliases: ['k8s', 'kubernetes', '云原生'] },
  { name: 'Linux', aliases: ['linux', 'shell'] },
  { name: 'RESTful', aliases: ['restful', 'rest api', '接口设计'] },
  { name: '架构', aliases: ['架构', 'ddd', '设计模式', '组件化'] },
  { name: '机器学习', aliases: ['机器学习', 'lr', 'gbdt', 'xgboost'] },
  { name: '深度学习', aliases: ['深度学习', '神经网络', 'transformer'] },
  { name: 'PyTorch', aliases: ['pytorch', 'tensorflow'] },
  { name: 'NLP', aliases: ['nlp', '自然语言处理', '大模型'] },
  { name: 'LLM', aliases: ['llm', '大模型', 'gpt', 'prompt'] },
  { name: 'RAG', aliases: ['rag', '检索增强', '向量检索', 'embedding'] },
  { name: '推荐系统', aliases: ['推荐系统', '召回', '粗排', '精排'] },
  { name: '计算机视觉', aliases: ['计算机视觉', 'cv', '目标检测', '图像分割'] },
  { name: '模型压缩', aliases: ['模型压缩', '量化', '剪枝', '端侧推理'] },
  { name: 'SQL', aliases: ['sql', '窗口函数'] },
  { name: '数据仓库', aliases: ['数据仓库', '数仓', 'ods', 'dwd', 'dws', 'flink'] },
  { name: 'Hive', aliases: ['hive'] },
  { name: 'Spark', aliases: ['spark'] },
  { name: '数据治理', aliases: ['数据治理', '数据质量'] },
  { name: '建模', aliases: ['建模', '维度建模', 'er模型'] },
  { name: '数据分析', aliases: ['数据分析', '归因', '漏斗', 'pandas'] },
  { name: '指标体系', aliases: ['指标体系', '指标', '看板'] },
  { name: 'A/B测试', aliases: ['a/b', 'ab测试', '实验', '显著性'] },
  { name: '需求分析', aliases: ['需求分析', '需求', 'prd'] },
  { name: '原型设计', aliases: ['原型', 'figma', 'axure', 'sketch'] },
  { name: '用户研究', aliases: ['用户研究', '用户访谈', '可用性测试'] },
  { name: '增长', aliases: ['增长', '转化率', '留存'] },
  { name: '测试用例', aliases: ['测试用例', '测试设计', '边界'] },
  { name: '自动化测试', aliases: ['自动化测试', 'pytest', 'selenium', 'ci'] },
  { name: '接口测试', aliases: ['接口测试', 'postman', 'jmeter'] },
  { name: 'Swift', aliases: ['swift'] },
  { name: 'Objective-C', aliases: ['objective-c', 'oc'] },
  { name: 'iOS', aliases: ['ios', 'runloop', 'instrument'] },
  { name: 'Kotlin', aliases: ['kotlin'] },
  { name: 'Android', aliases: ['android'] },
  { name: 'Jetpack', aliases: ['jetpack', 'mvvm', 'viewmodel'] },
  { name: '跨端', aliases: ['flutter', 'react native', 'rn'] },
];

/** 技术深度探测词（回答中出现的专业概念） */
export const TECH_TERMS = [
  'react', 'vue', 'typescript', 'javascript', 'webpack', 'vite', 'next.js', 'node', 'css', 'http',
  '缓存', '索引', '算法', '架构', '性能', '组件', '状态管理', 'ssr', '懒加载', '代码分割',
  '事件循环', '原型链', '闭包', '虚拟dom', 'diff', 'redis', 'mysql', 'docker', 'k8s', '微服务',
  '消息队列', '分布式', 'pytorch', 'transformer', '向量', '检索', '重排', 'embedding', 'rag',
  'agent', 'prompt', 'a/b', '指标', '漏斗', '归因', '需求', '原型', '埋点', '树摇', 'tree shaking',
  '弱网', '首屏', 'lcp', 'cdn', '并发', '索引失效', 'explain', '幂等', '降级', '熔断',
];

export const SKILL_NAMES = SKILL_DICT.map((s) => s.name);

/** 纯英文别名必须整词匹配，避免 JavaScript 命中 Java、MySQL 命中 SQL */
function hasAlias(lower: string, alias: string): boolean {
  const a = alias.toLowerCase();
  if (/^[a-z0-9 .+#/_-]+$/.test(a)) {
    const escaped = a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`).test(lower);
  }
  return lower.includes(a);
}

export function matchSkills(text: string): string[] {
  const lower = text.toLowerCase();
  return SKILL_DICT.filter(
    (s) => hasAlias(lower, s.name) || s.aliases.some((a) => hasAlias(lower, a)),
  ).map((s) => s.name);
}
