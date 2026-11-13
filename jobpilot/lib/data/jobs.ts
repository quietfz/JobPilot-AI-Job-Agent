import type { Job } from '@/lib/types';

/**
 * 岗位库（校招）
 * 说明：数据为公开校招 JD 的整理与改写样本，用于离线演示与 RAG 检索，不抓取实时岗位。
 */

const r = (id: string, text: string, type: 'must' | 'plus', skill: string) => ({
  id,
  text,
  type,
  skill,
});

export const JOBS: Job[] = [
  {
    id: 'fe-01',
    title: '前端开发工程师（校招）',
    category: '前端',
    companyType: '互联网大厂',
    location: '杭州',
    level: '2026 届本科及以上',
    salary: '18-28K·14薪',
    skills: ['React', 'TypeScript', 'JavaScript', 'Webpack', 'CSS', '性能优化', '工程化', '浏览器'],
    responsibilities: [
      '负责核心业务前端页面开发与体验优化',
      '参与前端工程化建设，沉淀通用组件与工具',
      '与产品、设计、后端协作完成需求落地',
    ],
    requirements: [
      r('fe-01-1', '熟练掌握 JavaScript / TypeScript，理解原型链、闭包、事件循环等核心机制', 'must', 'TypeScript'),
      r('fe-01-2', '熟练使用 React 及其生态（Hooks、状态管理、路由），理解虚拟 DOM 与渲染机制', 'must', 'React'),
      r('fe-01-3', '熟悉 CSS 布局与响应式适配，能还原设计稿并处理多端兼容', 'must', 'CSS'),
      r('fe-01-4', '熟悉 Webpack / Vite 构建工具，了解代码分割、懒加载、Tree Shaking 等工程化手段', 'must', 'Webpack'),
      r('fe-01-5', '有前端性能优化经验，能定位并改善首屏加载、渲染卡顿问题', 'must', '性能优化'),
      r('fe-01-6', '了解浏览器渲染原理、HTTP 缓存与跨域方案', 'plus', '浏览器'),
      r('fe-01-7', '有开源项目、技术博客或组件库建设经验者优先', 'plus', '工程化'),
    ],
  },
];

export const JOB_CATEGORIES = ['全部', '前端', '后端', '算法', '数据', '产品', '测试', '客户端'];

export function getJob(id: string): Job | undefined {
  return JOBS.find((j) => j.id === id);
}

export function getJobTitle(id: string): string {
  return getJob(id)?.title ?? '未知岗位';
}
