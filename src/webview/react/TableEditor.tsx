// VSCode Webview API型宣言
declare function acquireVsCodeApi(): any;
// VSCode Webview APIをwindow.vscodeにセット
if (typeof window !== "undefined" && !window.vscode && typeof acquireVsCodeApi === "function") {
  window.vscode = acquireVsCodeApi();
}
// VSCode API用のwindow.vscode型宣言
declare global {
  interface Window {
    vscode: {
      postMessage: (msg: any) => void;
    };
  }
}
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


/**
 * データ→Markdown変換
 */
function toMarkdownTable(columns: any[], data: any[]): string {
  if (!columns.length) return "";
  const header = "|" + columns.map((col: any) => col.header).join("|") + "|";
  const sep = "|" + columns.map(() => "---").join("|") + "|";
  const rows = data.map(row =>
    "|" + columns.map((col: any) => (row[col.name] ?? "")).join("|") + "|"
  );
  return [header, sep, ...rows].join("\n");
}

export const TableEditor: React.FC = () => {
  const gridRef = useRef<any>(null);

  // 初期Markdownデータをstateにセット
  const initialMarkdown = window.__INIT_MARKDOWN__ || "";
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isModified, setIsModified] = useState(false);

  // markdownからcolumns/dataを生成
  const { columns, data } = React.useMemo(() => parseMarkdownTable(markdown), [markdown]);

  // 編集検知: GridインスタンスのafterChangeイベントで検知
  useEffect(() => {
    const gridInst = gridRef.current?.getInstance?.();
    if (!gridInst) return;
    const handler = () => {
      if (!isModified) {
        setIsModified(true);
        if (window.vscode && typeof window.vscode.postMessage === "function") {
          window.vscode.postMessage({ type: "modified" });
        }
      }
    };
    gridInst.on('afterChange', handler);
    return () => {
      gridInst.off('afterChange', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModified, columns.length, data.length]);

  // 保存処理
  const handleSave = () => {
    if (!gridRef.current) return;
    const gridInst = gridRef.current.getInstance();
    const currentData = gridInst.getData();
    const md = toMarkdownTable(columns, currentData);
    if (window.vscode && typeof window.vscode.postMessage === "function") {
      window.vscode.postMessage({ type: "save", markdown: md });
      window.vscode.postMessage({ type: "saved" });
    }
    setIsModified(false);
  };

  // Cmd+S/Ctrl+S ショートカット対応
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    setMarkdown(initialMarkdown);
    setIsModified(false);
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
          <ToastButton onClick={handleSave}>保存</ToastButton>
        </div>
      </div>
    </div>
  );
};