import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: {
    default: '职途 JobPilot · 有记忆、会追问、能陪跑的 AI 求职 Agent',
    template: '%s · 职途 JobPilot',
  },
  description:
    '读懂简历、理解岗位、像真面试官一样追问，并把每一次面试的失分点变成下一步学习任务。',
  applicationName: '职途 JobPilot',
  keywords: ['AI 求职', '简历诊断', '模拟面试', '岗位匹配', 'AI Agent', 'RAG'],
  authors: [{ name: '职途 JobPilot' }],
  openGraph: {
    title: '职途 JobPilot · AI 求职陪跑 Agent',
    description: '简历诊断 → 岗位对齐 → 模拟面试 → 时间轴复盘 → 学习补齐，一条可验证的求职闭环。',
    type: 'website',
    locale: 'zh_CN',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#F5F6FA',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
