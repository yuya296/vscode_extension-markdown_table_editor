/**
 * Markdownテーブルのパース・生成ユーティリティ
 */

export type Column = { name: string; header: string };
export type RowData = Record<string, string>;

/**
 * Markdown文字列をパースしてカラム情報とデータ配列を返す
 */
export function parseMarkdownTable(md: string): { columns: Column[]; data: RowData[] } {
  const arr = parseMarkdownTable2D(md);
  if (arr.length < 1) return { columns: [], data: [] };
  const header = arr[0];
  const columns: Column[] = header.map((h, i) => ({
    name: h !== '' ? h : `__EMPTY__${i + 1}`,
    header: h
  }));
  const data: RowData[] = arr.slice(1).map(row => {
    const obj: RowData = {};
    columns.forEach((col, i) => {
      obj[col.name] = row[i] ?? '';
    });
    return obj;
  });
  return { columns, data };
}

/**
 * カラム情報とデータ配列からMarkdownテーブル文字列を生成
 */
export function toMarkdownTable(columns: Column[], data: RowData[]): string {
  if (!columns.length) return '';
  const arr: string[][] = [
    columns.map(col => col.header),
    ...data.map(row => columns.map(col => row[col.name] ?? ''))
  ];
  return generateMarkdownTable2D(arr);
}

/**
 * 2次元配列のMarkdownテーブルをパース（テスト用のシンプルAPI）
 * @returns 2次元配列（ヘッダ行含む）
 */
export function parseMarkdownTable2D(md: string): string[][] {
  const lines = md
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l.startsWith('|') && l.endsWith('|'));
  if (lines.length < 2) return [];
  return lines
    .filter((_, i) => i === 0 || i > 1) // ヘッダとデータ行のみ
    .map(row => row.slice(1, -1).split('|').map(c => c.trim()));
}

/**
 * 2次元配列からMarkdownテーブル文字列を生成（テスト用のシンプルAPI）
 */
export function generateMarkdownTable2D(data: string[][]): string {
  if (!data.length) return '';
  const header = '| ' + data[0].join(' | ') + ' |';
  const sep = '|' + data[0].map(() => '---').join('|') + '|';
  const rows = data.slice(1).map(row => '| ' + row.join(' | ') + ' |');
  return [header, sep, ...rows].join('\n');
}