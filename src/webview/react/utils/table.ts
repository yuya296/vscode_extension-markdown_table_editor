/**
 * Markdownテーブルのパース・生成ユーティリティ
 */

export type Column = { name: string; header: string };
export type RowData = Record<string, string>;

/**
 * Markdown文字列をパースしてカラム情報とデータ配列を返す
 */
export function parseMarkdownTable(md: string): { columns: Column[]; data: RowData[] } {
  const lines = md
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l.startsWith('|') && l.endsWith('|'));
  if (lines.length < 2) return { columns: [], data: [] };
  const header = lines[0].slice(1, -1).split('|').map(h => h.trim());
  const columns: Column[] = header.map((h, i) => ({
    name: h !== "" ? h : `__EMPTY__${i + 1}`,
    header: h
  }));
  const data: RowData[] = lines.slice(2).map(row => {
    const cells = row.slice(1, -1).split('|').map(c => c.trim());
    const obj: RowData = {};
    columns.forEach((col, i) => {
      obj[col.name] = (cells[i] ?? '').replace(/<br\s*\/?>(?=\s|$)/gi, '\n');
    });
    return obj;
  });
  return { columns, data };
}

/**
 * カラム情報とデータ配列からMarkdownテーブル文字列を生成
 */
export function toMarkdownTable(columns: Column[], data: RowData[]): string {
  if (!columns.length) return "";
  const header = "|" + columns.map(col => col.header).join("|") + "|";
  const sep = "|" + columns.map(() => "---").join("|") + "|";
  const rows = data.map(row =>
    "|" + columns.map(col => (row[col.name] ?? "").replace(/\n/g, "<br>")).join("|") + "|"
  );
  return [header, sep, ...rows].join("\n") + "\n";
}