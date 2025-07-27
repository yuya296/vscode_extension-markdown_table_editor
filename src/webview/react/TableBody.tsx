import React from "react";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";
import { toMarkdownTable, Column, RowData } from "./utils/table";

interface TableBodyProps {
  // jspreadsheet
  jspInstance: React.RefObject<any>;
  tableData: string[][];
  colDefs: any[];
  
  // Table data
  columns: Column[];
  data: RowData[];
  
  // State setters
  setMarkdown?: (markdown: string) => void;
  
  // Event callbacks
  onChange?: () => void;
  onHistoryChange?: () => void;
}

const TableBody: React.FC<TableBodyProps> = ({
  jspInstance,
  tableData,
  colDefs,
  columns,
  data,
  onChange,
  setMarkdown,
  onHistoryChange,
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
        allowUndo={true}
        onload={(instance: any) => {
          // jspreadsheetのhistory機能を有効化
          if (instance && instance.options) {
            instance.options.allowUndo = true;
          }
          
          onHistoryChange && onHistoryChange();
        }}
        onchange={(_instance: any) => {
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

          onHistoryChange && onHistoryChange();

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
