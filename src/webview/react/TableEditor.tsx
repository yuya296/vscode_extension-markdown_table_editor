// VSCode Webview API型宣言
declare function acquireVsCodeApi(): any;
// VSCode Webview APIをwindow.vscodeにセット
if (typeof window !== "undefined" && !window.vscode && typeof acquireVsCodeApi === "function") {
  window.vscode = acquireVsCodeApi();
}
declare global {
  interface Window {
    vscode: {
      postMessage: (msg: any) => void;
    };
    __INIT_MARKDOWN__?: string;
  }
}

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Spreadsheet, Worksheet, jspreadsheet } from "@jspreadsheet-ce/react";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import TableEditorButtons from "./TableEditorButtons";
import { parseMarkdownTable, toMarkdownTable, Column, RowData } from "./utils/table";
import { useTableEditorHandlers } from "./hooks/useTableEditorHandlers";
import styles from "./TableEditor.module.scss";

export const TableEditor: React.FC = () => {
  const jspInstance = useRef<any>(null);

  const initialMarkdown = window.__INIT_MARKDOWN__ || "";
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);
  const [isModified, setIsModified] = useState(false);

  // markdownからcolumns/dataを生成
  const { columns, data } = React.useMemo(() => {
    const result = parseMarkdownTable(markdown);
    console.log("parseMarkdownTable result:", { columns: result.columns, data: result.data, markdown });

    // markdownが空または無効な場合はデフォルトテーブルを生成
    if (result.columns.length === 0) {
      console.log("Creating default table");
      return {
        columns: [
          { name: "Column1", header: "Column1" },
          { name: "Column2", header: "Column2" },
          { name: "Column3", header: "Column3" }
        ],
        data: [
          { "Column1": "", "Column2": "", "Column3": "" },
          { "Column1": "", "Column2": "", "Column3": "" },
          { "Column1": "", "Column2": "", "Column3": "" }
        ]
      };
    }

    return result;
  }, [markdown]);

  // カラム定義
  const colDefs = columns.map(col => ({
    title: col.name,
    width: 120,
    align: "left" as const,
    wrap: true,
    wordWrap: true,
    type: "text" as const,
  }));

  console.log("colDefs:", colDefs);
  console.log("data:", data);
  console.log("initialMarkdown:", initialMarkdown);

  // dataを2次元配列に変換（jspreadsheetが期待する形式）
  const tableData = data.map(row =>
    columns.map(col => row[col.name] || "")
  );

  console.log("tableData:", tableData);

  // Markdown初期化
  useEffect(() => {
    setMarkdown(initialMarkdown);
    setIsModified(false);
  }, [initialMarkdown]);

  // 保存処理
  const handleSave = useCallback(() => {
    if (!jspInstance.current || !jspInstance.current[0]) return;
    const currentData = jspInstance.current[0].getData();
    const safeData = Array.isArray(currentData) ? currentData : [];
    const dataObjects: RowData[] = safeData.map((row: any[]) => {
      const obj: RowData = {};
      columns.forEach((col, i) => {
        obj[col.name] = row[i] ?? "";
      });
      return obj;
    });
    const md = toMarkdownTable(columns, dataObjects);
    if (window.vscode && typeof window.vscode.postMessage === "function") {
      window.vscode.postMessage({ type: "save", markdown: md });
      window.vscode.postMessage({ type: "saved" });
    }
    setIsModified(false);
  }, [columns]);

  // Save & Closeボタン処理
  const handleSaveAndClose = useCallback(() => {
    if (!jspInstance.current || !jspInstance.current[0]) return;
    const currentData = jspInstance.current[0].getData();
    const safeData = Array.isArray(currentData) ? currentData : [];
    const dataObjects: RowData[] = safeData.map((row: any[]) => {
      const obj: RowData = {};
      columns.forEach((col, i) => {
        obj[col.name] = row[i] ?? "";
      });
      return obj;
    });
    const md = toMarkdownTable(columns, dataObjects);
    if (window.vscode && typeof window.vscode.postMessage === "function") {
      window.vscode.postMessage({ type: "saveAndClose", markdown: md });
    }
    setIsModified(false);
  }, [columns]);

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
  }, [handleSave]);

  // Markdown初期化
  useEffect(() => {
    setMarkdown(initialMarkdown);
    setIsModified(false);
  }, [initialMarkdown]);

  // 行・列追加ハンドラ
  const { handleAddRow, handleAddColumn } = useTableEditorHandlers({
    columnDefs: columns,
    rowData: data,
    setMarkdown,
    setIsModified,
  });

  // wrapText/autoHeightのon/off切替
  const handleToggleWrapAll = () => {
    if (!jspInstance.current || !jspInstance.current[0]) return;
    const colDefs = jspInstance.current[0].options.columns;
    const allWrapped = colDefs.every((col: any) => col.wrap);
    colDefs.forEach((col: any) => {
      col.wrap = !allWrapped;
    });
    jspInstance.current[0].refresh();
  };

  // 全列wrap状態かどうかを判定
  const wrapAllChecked = (() => {
    if (!jspInstance.current || !jspInstance.current[0]) return false;
    const colDefs = jspInstance.current[0].options.columns;
    return colDefs.length > 0 && colDefs.every((col: any) => col.wrap);
  })();

  // 選択列削除ハンドラ
  const handleDeleteSelectedColumn = useCallback(() => {
    if (!jspInstance.current || !jspInstance.current[0]) return;
    const selection = jspInstance.current[0].getSelected?.();
    if (!selection || selection.length === 0) {
      alert("削除する列が選択されていません。");
      return;
    }
    // [[[startRow, startCol], [endRow, endCol]]] の構造
    const [startCell, endCell] = selection[0];
    const startCol = startCell[1];
    const endCol = endCell[1];
    if (
      typeof startCol !== "number" ||
      typeof endCol !== "number" ||
      startCol > endCol
    ) {
      alert("正しい列範囲が選択されていません。");
      return;
    }
    // columns/dataを取得
    const { columns, data } = parseMarkdownTable(markdown);
    // 削除対象のカラムインデックス配列
    const delColIdxs: number[] = [];
    for (let col = startCol; col <= endCol; col++) {
      delColIdxs.push(col);
    }
    // 新しいcolumns
    const newColumns = columns.filter((_, idx) => !delColIdxs.includes(idx));
    // 新しいdata
    const newData = data.map(row => {
      const newRow = { ...row };
      delColIdxs.forEach(idx => {
        if (columns[idx]) delete newRow[columns[idx].name];
      });
      return newRow;
    });
    // Markdown再生成
    const newMarkdown = toMarkdownTable(newColumns, newData);
    setMarkdown(newMarkdown);
    setIsModified(true);
  }, [setMarkdown, setIsModified, markdown]);

  return (
    <div>
      <div className={styles.tableEditor}>
        <TableEditorButtons
          onAddRow={handleAddRow}
          onAddColumn={handleAddColumn}
          onDeleteSelectedColumn={handleDeleteSelectedColumn}
          onSave={handleSave}
          onSaveAndClose={handleSaveAndClose}
          isModified={isModified}
          wrapAllChecked={wrapAllChecked}
          onToggleWrapAll={handleToggleWrapAll}
        />
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
            }}
          />
        </Spreadsheet>
      </div>
    </div>
  );
};