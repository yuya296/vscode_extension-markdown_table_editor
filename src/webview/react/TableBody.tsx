import React from "react";
import { Spreadsheet, Worksheet } from "@jspreadsheet-ce/react";

interface TableBodyProps {
  jspInstance: React.RefObject<any>;
  tableData: string[][];
  colDefs: any[];
  columns: any[];
  data: any[];
  setIsModified: (v: boolean) => void;
  onChange?: () => void;
}

const TableBody: React.FC<TableBodyProps> = ({
  jspInstance,
  tableData,
  colDefs,
  columns,
  data,
  setIsModified,
  onChange,
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
        onbeforechange={(
          element: any,
          cell: HTMLTableCellElement,
          colIndex: string | number,
          rowIndex: string | number,
          newValue: any
        ) => newValue}
        onchange={() => {
          setIsModified(true);
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
