// src/webview/react/TableEditor.tsx
import React, { useRef } from "react";
import Grid from "@toast-ui/react-grid";
import "tui-grid/dist/tui-grid.min.css";

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

const columns = [
  { name: "col1", header: "Header1", editor: "text" },
  { name: "col2", header: "Header2", editor: "text" },
];

const data = [
  { col1: "Cell1", col2: "Cell2" },
  { col1: "Cell3", col2: "Cell4" },
];

export const TableEditor: React.FC = () => {
  const gridRef = useRef<GridInstance | null>(null);

  return (
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
  );
};