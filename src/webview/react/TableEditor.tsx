// src/webview/react/TableEditor.tsx
import React, { useRef } from "react";
import Grid from "@toast-ui/react-grid";
import "tui-grid/dist/tui-grid.min.css";

const columns = [
  { name: "col1", header: "Header1", editor: "text" },
  { name: "col2", header: "Header2", editor: "text" },
];

const data = [
  { col1: "Cell1", col2: "Cell2" },
  { col1: "Cell3", col2: "Cell4" },
];

export const TableEditor: React.FC = () => {
  const gridRef = useRef<any>(null);

  return (
    <div className="tableEditor">
      <Grid
        ref={gridRef}
        columns={columns}
        data={data}
        rowHeaders={["rowNum"]}
        bodyHeight={200}
        heightResizable={true}
      />
      <div className="tableEditorButtons">
        <button>行追加</button>
        <button>列追加</button>
        <button>行削除</button>
        <button>列削除</button>
        <button>元に戻す</button>
        <button>やり直し</button>
        <button>保存</button>
      </div>
    </div>
  );
};