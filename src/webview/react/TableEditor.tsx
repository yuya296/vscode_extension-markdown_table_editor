// src/webview/react/TableEditor.tsx
import React, { useState } from "react";


export const TableEditor: React.FC = () => {
  const [tableData, setTableData] = useState([
    ["Header1", "Header2"],
    ["Cell1", "Cell2"],
  ]);

  return (
    <div className="tableEditor">
      <table className="tableEditorTable">
        <tbody>
          {tableData.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {row.map((cell, colIdx) => (
                <td key={colIdx} contentEditable suppressContentEditableWarning>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
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