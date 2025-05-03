// デバッグ用: 初期Markdownデータを確認

// src/webview/react/TableEditor.tsx
import React, { useRef, useState, useEffect } from "react";
import Grid from "@toast-ui/react-grid";
import "tui-grid/dist/tui-grid.min.css";
// Markdownテーブルをcolumns/data形式に変換する関数
function parseMarkdownTable(md: string): { columns: any[]; data: any[] } {
  const lines = md
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l.startsWith('|') && l.endsWith('|'));
  if (lines.length < 2) return { columns: [], data: [] };
  const header = lines[0].slice(1, -1).split('|').map(h => h.trim());
  const columns = header.map((h, i) => ({
    name: `col${i + 1}`,
    header: h,
    editor: 'text',
  }));
  const data = lines.slice(2).map(row => {
    const cells = row.slice(1, -1).split('|').map(c => c.trim());
    const obj: Record<string, string> = {};
    columns.forEach((col, i) => {
      obj[col.name] = cells[i] ?? '';
    });
    return obj;
  });
  return { columns, data };
}

// ToastUIスタイルのカスタムボタンコンポーネント
const ToastButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    {...props}
    style={{
      backgroundColor: "#00aaff",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      margin: "4px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0099cc")}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#00aaff")}
  >
    {children}
  </button>
);


export const TableEditor: React.FC = () => {
  const gridRef = useRef<any>(null);

  // 初期Markdownデータをstateにセット
  const initialMarkdown = window.__INIT_MARKDOWN__ || "";
  const [markdown, setMarkdown] = useState(initialMarkdown);

  // markdownからcolumns/dataを生成
  const { columns, data } = React.useMemo(() => parseMarkdownTable(markdown), [markdown]);

  useEffect(() => {
    setMarkdown(initialMarkdown);
  }, []);

  return (
    <div>
      <div className="tableEditor">
        <Grid
          ref={gridRef}
          columns={columns}
          data={data}
          bodyHeight="auto"
          heightResizable={true}
        />
        <div className="tableEditorButtons">
          <ToastButton>行追加</ToastButton>
          <ToastButton>列追加</ToastButton>
          <ToastButton>行削除</ToastButton>
          <ToastButton>列削除</ToastButton>
          <ToastButton>元に戻す</ToastButton>
          <ToastButton>やり直し</ToastButton>
          <ToastButton>保存</ToastButton>
        </div>
      </div>
    </div>
  );
};