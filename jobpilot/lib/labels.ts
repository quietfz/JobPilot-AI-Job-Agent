export const DIM_MAP: Record<string, string> = {
  relevance: '内容相关性',
  evidence: '量化与证据',
  depth: '技术深度',
  structure: '结构表达',
  reflection: '反思复盘',
  keywords: '关键词覆盖',
};

export function dimsLabel(key: string) {
  return DIM_MAP[key] ?? key;
}
