/**
 * Markdownテーブルのパース・生成ユーティリティ
 */

/**
 * Markdown文字列をパースしてカラム情報とデータ配列を返す
 */
export function parseMarkdownTable(md: string): { columns: any[]; data: any[] } {
  const lines = md
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l.startsWith('|') && l.endsWith('|'));
  if (lines.length < 2) return { columns: [], data: [] };
  const header = lines[0].slice(1, -1).split('|').map(h => h.trim());
  const columns = header.map((h, i) => ({
    name: h !== "" ? h : `__EMPTY__${i + 1}`,
    header: h
  }));
  const data = lines.slice(2).map(row => {
    const cells = row.slice(1, -1).split('|').map(c => c.trim());
    const obj: Record<string, string> = {};
    columns.forEach((col, i) => {
      obj[col.name] = (cells[i] ?? '').replace(/<br\s*\/?>/gi, '\n');
    });
    return obj;
  });
  return { columns, data };
}

/**
 * カラム情報とデータ配列からMarkdownテーブル文字列を生成
 */
export function toMarkdownTable(columns: any[], data: any[]): string {
  if (!columns.length) return "";
  const header = "|" + columns.map((col: any) => col.header).join("|") + "|";
  const sep = "|" + columns.map(() => "---").join("|") + "|";
  const rows = data.map(row =>
    "|" + columns.map((col: any) => (row[col.name] ?? "").replace(/\n/g, "<br>")).join("|") + "|"
  );
  return [header, sep, ...rows].join("\n") + "\n";
}