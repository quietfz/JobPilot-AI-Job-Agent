import { QUESTIONS, type QuestionItem } from '@/lib/data/questions';
import { LEARNING_RESOURCES } from '@/lib/data/questions';
import type { LearningResource } from '@/lib/types';

/**
 * 轻量检索层（BM25 + 条件加权）
 * 无外部依赖、无 API Key 即可运行；接入 Embedding 后可在 retrieve() 内替换为混合检索。
 * 中文采用 bigram 切分，英文/数字按词切分。
 */

const STOP = new Set([
  '的', '了', '是', '我', '你', '他', '她', '它', '在', '和', '与', '及', '或', '等', '这', '那',
  '个', '们', '有', '没有', '会', '能', '要', '把', '被', '对', '从', '到', '为', '以', '而', '就',
  'the', 'a', 'an', 'of', 'to', 'and', 'or', 'is', 'are', 'was', 'be', 'in', 'on', 'for', 'with',
]);

export function tokenize(input: string): string[] {
  const lower = input.toLowerCase();
  const latin = lower.match(/[a-z0-9+#.]{2,}/g) ?? [];
  const cjkSeqs = lower.match(/[\u4e00-\u9fa5]+/g) ?? [];
  const grams: string[] = [];
  for (const seq of cjkSeqs) {
    if (seq.length === 1) {
      grams.push(seq);
      continue;
    }
    for (let i = 0; i < seq.length - 1; i += 1) {
      grams.push(seq.slice(i, i + 2));
    }
  }
  return [...latin, ...grams].filter((t) => !STOP.has(t));
}

interface Doc {
  id: string;
  tokens: string[];
  raw: string;
}

function buildDocs(items: { id: string; text: string }[]): {
  docs: Doc[];
  df: Map<string, number>;
  avgLen: number;
} {
  const docs = items.map((it) => ({ id: it.id, tokens: tokenize(it.text), raw: it.text }));
  const df = new Map<string, number>();
  for (const d of docs) {
    for (const t of new Set(d.tokens)) df.set(t, (df.get(t) ?? 0) + 1);
  }
  const avgLen = docs.reduce((s, d) => s + d.tokens.length, 0) / Math.max(1, docs.length);
  return { docs, df, avgLen };
}

function bm25(queryTokens: string[], doc: Doc, df: Map<string, number>, avgLen: number, total: number) {
  const k1 = 1.2;
  const b = 0.75;
  const tf = new Map<string, number>();
  for (const t of doc.tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  let score = 0;
  for (const q of queryTokens) {
    const f = tf.get(q);
    if (!f) continue;
    const n = df.get(q) ?? 0;
    const idf = Math.log(1 + (total - n + 0.5) / (n + 0.5));
    const denom = f + k1 * (1 - b + (b * doc.tokens.length) / Math.max(1, avgLen));
    score += (idf * (f * (k1 + 1))) / denom;
  }
  return score;
}

const QUESTION_DOCS = buildDocs(
  QUESTIONS.map((q) => ({
    id: q.id,
    text: `${q.topic} ${q.text} ${q.intent} ${q.tags.join(' ')} ${q.reference}`,
  })),
);

const RESOURCE_DOCS = buildDocs(
  LEARNING_RESOURCES.map((r) => ({
    id: r.id,
    text: `${r.title} ${r.tags.join(' ')} ${r.content}`,
  })),
);

export interface RetrieveOptions {
  category?: string;
  dimension?: string;
  excludeIds?: string[];
  topK?: number;
}

export interface RetrievedQuestion {
  item: QuestionItem;
  score: number;
}

export function retrieveQuestions(query: string, opts: RetrieveOptions = {}): RetrievedQuestion[] {
  const { category, dimension, excludeIds = [], topK = 3 } = opts;
  const qTokens = tokenize(query);
  const scored = QUESTION_DOCS.docs
    .map((doc) => {
      const item = QUESTIONS.find((q) => q.id === doc.id)!;
      let score = bm25(qTokens, doc, QUESTION_DOCS.df, QUESTION_DOCS.avgLen, QUESTIONS.length);
      if (category && item.categories.includes(category)) score += 1.6;
      if (dimension && item.dimension === dimension) score += 2.2;
      if (item.topic && query.includes(item.topic)) score += 1.4;
      return { item, score };
    })
    .filter((x) => !excludeIds.includes(x.item.id))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

export interface RetrievedResource {
  item: LearningResource;
  score: number;
}

export function retrieveResources(query: string, dimension?: string, topK = 2): RetrievedResource[] {
  const qTokens = tokenize(query);
  const scored = RESOURCE_DOCS.docs
    .map((doc) => {
      const item = LEARNING_RESOURCES.find((r) => r.id === doc.id)!;
      let score = bm25(qTokens, doc, RESOURCE_DOCS.df, RESOURCE_DOCS.avgLen, LEARNING_RESOURCES.length);
      if (dimension && item.dimension === dimension) score += 2.5;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);
  const filtered = scored.filter((x) => x.score > 0);
  return (filtered.length ? filtered : scored).slice(0, topK);
}
