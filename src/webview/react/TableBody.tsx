import React from "react";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import { toMarkdownTable, Column, RowData } from "./utils/table";

interface TableBodyProps {
  jspInstance: React.RefObject<any>;
  tableData: string[][];
  colDefs: any[];
  columns: Column[];
  data: RowData[];
  setIsModified: (v: boolean) => void;
  onChange?: () => void;
  pushToHistory?: (columns: Column[], data: RowData[]) => void;
  setMarkdown?: (markdown: string) => void;
}

const TableBody: React.FC<TableBodyProps> = ({
  jspInstance,
  tableData,
  colDefs,
  columns,
  data,
  setIsModified,
  onChange,
  pushToHistory,
  setMarkdown,
}) => {
  return (
    <Spreadsheet ref={jspInstance}>
      <Worksheet
        data={tableData}
        columns={colDefs as any}
        minDimensions={[columns.length || 1, data.length || 1]}
        editable={true}
        wordWrap={true}
        allowInsertRow={true}
        allowInsertColumn={true}
        allowDeleteRow={true}
        allowDeleteColumn={true}
        toolbar={false}
        onload={(instance: any) => {
          // jspreadsheetのUndoを有効化（デフォルト）
          if (instance && instance.options) {
            instance.options.allowUndo = true;
          }
        }}
        onbeforechange={(
          _element: any,
          _cell: HTMLTableCellElement,
          _colIndex: string | number,
          _rowIndex: string | number,
          newValue: any
        ) => {
          // セル編集前に現在の状態を履歴に追加
          if (pushToHistory) {
            pushToHistory(columns, data);
          }
          return newValue;
        }}
        onchange={(_instance: any) => {
          setIsModified(true);

          // セル編集後にMarkdownを更新
          if (setMarkdown && jspInstance.current && jspInstance.current[0]) {
            const currentData = jspInstance.current[0].getData();
            // 2次元配列をRowData[]に変換
            const newData: RowData[] = currentData.map((row: string[]) => {
              const rowObj: RowData = {};
              columns.forEach((col, index) => {
                rowObj[col.name] = row[index] || "";
              });
              return rowObj;
            });
            const newMarkdown = toMarkdownTable(columns, newData);
            setMarkdown(newMarkdown);
          }

          if (window.vscode && typeof window.vscode.postMessage === "function") {
            window.vscode.postMessage({ type: "modified" });
          }
          onChange && onChange();
        }}
      />
    </Spreadsheet>
  );
};

export default TableBody;
