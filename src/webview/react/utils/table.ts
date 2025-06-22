/**
 * Markdownテーブルのパース・生成ユーティリティ
 */

export type Column = { name: string; header: string };
export type RowData = Record<string, string>;

/**
 * Markdown文字列をパースしてカラム情報とデータ配列を返す
 */
export function parseMarkdownTable(md: string): { columns: Column[]; data: RowData[] } {
  // Markdownテーブル→2次元配列
  const tableRows: string[][] = parseMarkdownTable2D(md);
  if (tableRows.length < 1) return { columns: [], data: [] };

  // 1行目: ヘッダー
  const headerCells = tableRows[0];
  const columns: Column[] = headerCells.map((header, colIdx) => ({
    name: header !== '' ? header : `__EMPTY__${colIdx + 1}`,
    header: header
  }));

  // 2行目以降: データ
  const data: RowData[] = tableRows.slice(1).map((rowCells, rowIdx) => {
    const rowObj: RowData = {};
    columns.forEach((col, colIdx) => {
      rowObj[col.name] = rowCells[colIdx] ?? '';
    });
    return rowObj;
  });
  return { columns, data };
}

/**
 * カラム情報とデータ配列からMarkdownテーブル文字列を生成
 */
export function toMarkdownTable(columns: Column[], data: RowData[]): string {
  if (!columns.length) return '';
  // ヘッダー行
  const headerRow: string[] = columns.map(col => col.header);
  // データ行
  const dataRows: string[][] = data.map(rowObj => columns.map(col => rowObj[col.name] ?? ''));
  // 2次元配列化
  const tableArr: string[][] = [headerRow, ...dataRows];
  return generateMarkdownTable2D(tableArr);
}

/**
 * 2次元配列のMarkdownテーブルをパース（テスト用のシンプルAPI）
 * @returns 2次元配列（ヘッダ行含む）
 */
export function parseMarkdownTable2D(md: string): string[][] {
  const lines: string[] = md
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('|') && line.endsWith('|'));
  if (lines.length < 2) return [];
  // 1行目: ヘッダー, 2行目: 区切り線, 3行目以降: データ
  const tableRows: string[][] = lines
    .filter((_, i) => i === 0 || i > 1)
    .map(row => row.slice(1, -1).split('|').map(cell => cell.trim()));
  return tableRows;
}

/**
 * 2次元配列からMarkdownテーブル文字列を生成（テスト用のシンプルAPI）
 */
export function generateMarkdownTable2D(data: string[][]): string {
  if (!data.length) return '';
  const headerRow = '| ' + data[0].join(' | ') + ' |';
  const separatorRow = '|' + data[0].map(() => '---').join('|') + '|';
  const dataRows = data.slice(1).map(row => '| ' + row.join(' | ') + ' |');
  return [headerRow, separatorRow, ...dataRows].join('\n');
}

export default parseMarkdownTable;