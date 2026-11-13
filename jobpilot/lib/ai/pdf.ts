/**
 * PDF 文本提取（基于 pdfjs-dist，按坐标还原行/列顺序）
 * - 逐页提取文本项，按 (y, x) 排序还原行结构
 * - 自动去除跨页重复的页眉/页脚
 * - 扫描件（无文本层）返回空字符串并标记
 * - pdfjs 失败时回退 pdf-parse
 */
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

const nodeRequire = createRequire(import.meta.url);

export interface PdfExtractResult {
  text: string;
  pages: number;
  isScanned: boolean;
  chars: number;
}

/** 从单页文本内容中按坐标还原行 */
function pageItemsToLines(
  items: Array<{ str: string; x: number; y: number }>,
): string[] {
  const rows: Array<{ y: number; items: Array<{ str: string; x: number }> }> = [];
  const Y_THRESHOLD = 3; // 同一行的 y 容差

  for (const item of items) {
    if (!item.str || !item.str.trim()) continue;
    let row = rows.find((r) => Math.abs(r.y - item.y) <= Y_THRESHOLD);
    if (!row) {
      row = { y: item.y, items: [] };
      rows.push(row);
    }
    row.items.push({ str: item.str, x: item.x });
  }

  rows.sort((a, b) => b.y - a.y); // y 降序 → 从上到下
  return rows.map((row) => {
    row.items.sort((a, b) => a.x - b.x);
    return row.items.map((i) => i.str).join('');
  });
}

/** 去除跨页重复的页眉/页脚（出现在 ≥2 页的行） */
function removeRepeatedHeadersFooters(pagesLines: string[][]): string[][] {
  const lineCounts = new Map<string, number>();
  for (const lines of pagesLines) {
    const candidates = [...lines.slice(0, 3), ...lines.slice(-3)];
    for (const l of candidates) {
      const key = l.trim();
      if (key.length >= 2) lineCounts.set(key, (lineCounts.get(key) ?? 0) + 1);
    }
  }
  const repeated = new Set<string>();
  for (const [line, count] of lineCounts) {
    if (count >= 2) repeated.add(line);
  }

  return pagesLines.map((lines) =>
    lines.filter((l) => {
      const key = l.trim();
      if (!key) return true;
      return !repeated.has(key);
    }),
  );
}

/** 清洗提取文本 */
function cleanText(text: string): string {
  return text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => {
      if (/^\d{1,3}$/.test(line)) return false; // 纯页码
      return line.length > 0;
    })
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');
}

export async function extractPdfText(buffer: Buffer): Promise<PdfExtractResult> {
  try {
    const pdfjsMod: any = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfjsLib = pdfjsMod.default ?? pdfjsMod;
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
      nodeRequire.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs'),
    ).href;

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
      isEvalSupported: false,
    });
    const doc = await loadingTask.promise;
    const numPages = doc.numPages;
    const pagesLines: string[][] = [];
    let totalChars = 0;

    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const items = (content.items as any[]).map((it) => ({
        str: it.str as string,
        x: it.transform[4] as number,
        y: it.transform[5] as number,
      }));
      const lines = pageItemsToLines(items);
      pagesLines.push(lines);
      totalChars += lines.join('').length;
    }
    await doc.destroy();

    const cleanedPages = removeRepeatedHeadersFooters(pagesLines);
    const raw = cleanedPages.map((p) => p.join('\n')).join('\n');
    const text = cleanText(raw);
    const isScanned = text.trim().length < 20;

    return { text, pages: numPages, isScanned, chars: text.length };
  } catch {
    // pdfjs 失败 → 回退 pdf-parse
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(buffer);
      const text = cleanText(parsed.text ?? '');
      return {
        text,
        pages: parsed.numpages ?? 1,
        isScanned: text.trim().length < 20,
        chars: text.length,
      };
    } catch {
      return { text: '', pages: 0, isScanned: true, chars: 0 };
    }
  }
}
