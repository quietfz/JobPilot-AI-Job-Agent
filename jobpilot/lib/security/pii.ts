/**
 * PII 脱敏：所有送入模型、写入日志的内容都必须先经过这里。
 * 原文只在浏览器本地保存（IndexedDB / localStorage）。
 */
export function maskPII(text: string): string {
  return text
    .replace(/(?<!\d)(1[3-9]\d)(\d{4})(\d{4})(?!\d)/g, (_m, a, _b, c) => `${a}****${c}`)
    .replace(
      /([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g,
      (_m, head, domain) => `${head}***@${domain}`,
    )
    .replace(/(?<!\d)\d{17}[\dXx](?!\d)/g, '******************')
    .replace(/(?<!\d)\d{16}(?!\d)/g, '****************');
}

export function countMasked(text: string): number {
  const m = text.match(/\*{3,}/g);
  return m ? m.length : 0;
}
