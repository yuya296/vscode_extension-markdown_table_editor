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
import "jspreadsheet-ce/dist/jspreadsheet.css";
import TableEditorButtons from "./TableEditorButtons";
import TableBody from "./TableBody";
import { toMarkdownTable, RowData } from "./utils/table";
import { useTableEditorHandlers } from "./hooks/useTableEditorHandlers";
import { useTableData } from "./hooks/useTableData";
import { useTableSave } from "./hooks/useTableSave";
import { useUndoRedo } from "./hooks/useUndoRedo";
import styles from "./TableEditor.module.scss";

export const TableEditor: React.FC = () => {
  const jspInstance = useRef<any>(null);

  const initialMarkdown = window.__INIT_MARKDOWN__ || "";
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);
  const [isModified, setIsModified] = useState(false);

  // markdownからcolumns/dataを生成
  const { columns, data } = useTableData(markdown);

  // 初期データを計算
  const initialData = useTableData(initialMarkdown);
  
  // Undo/Redo機能（配列データとして管理）
  const { undo, redo, push: pushToHistory, reset: resetHistory, canUndo, canRedo } = useUndoRedo(initialData.columns, initialData.data);
  

  // カラム定義
  const colDefs = columns.map(col => ({
    title: col.name,
    width: 120,
    align: "left" as const,
    wrap: true,
    wordWrap: true,
    type: "text" as const,
  }));

  // dataを2次元配列に変換（jspreadsheetが期待する形式）
  const tableData = data.map(row =>
    columns.map(col => row[col.name] || "")
  );

  // Markdown初期化
  useEffect(() => {
    setMarkdown(initialMarkdown);
    setIsModified(false);
  }, [initialMarkdown]);

  // 初期状態のみ履歴をリセット
  useEffect(() => {
    resetHistory(initialData.columns, initialData.data);
  }, [initialData.columns, initialData.data, resetHistory]);

  const { save, saveAndClose } = useTableSave({
    columns,
    data,
    setIsModified,
    jspInstance,
  });

  // 保存処理
  const handleSave = save;
  // Save & Closeボタン処理
  const handleSaveAndClose = saveAndClose;

  // Undo/Redoハンドラ
  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    const previousState = undo();
    const previousMarkdown = toMarkdownTable(previousState.columns, previousState.data);
    setMarkdown(previousMarkdown);
    setIsModified(true);
  }, [undo, canUndo]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    const nextState = redo();
    const nextMarkdown = toMarkdownTable(nextState.columns, nextState.data);
    setMarkdown(nextMarkdown);
    setIsModified(true);
  }, [redo, canRedo]);

  // キーボードショートカット対応
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        // jspreadsheetのundoを呼び出し
        if (jspInstance?.current && jspInstance.current[0]) {
          jspInstance.current[0].undo();
        }
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        e.stopPropagation();
        // jspreadsheetのredoを呼び出し
        if (jspInstance?.current && jspInstance.current[0]) {
          jspInstance.current[0].redo();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [handleSave, jspInstance]);

  // 行・列追加ハンドラ
  const {
    handleAddRow,
    handleAddColumn,
    handleDeleteSelectedColumn,
    handleToggleWrapAll,
    wrapAllChecked,
  } = useTableEditorHandlers({
    columnDefs: columns,
    rowData: data,
    setMarkdown,
    setIsModified,
    markdown,
    jspInstance,
    pushToHistory: pushToHistory,
  });

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
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={canUndo}
          canRedo={canRedo}
          jspInstance={jspInstance}
        />
        <TableBody
          jspInstance={jspInstance}
          tableData={tableData}
          colDefs={colDefs}
          columns={columns}
          data={data}
          setIsModified={setIsModified}
          pushToHistory={pushToHistory}
          setMarkdown={setMarkdown}
        />
      </div>
    </div>
  );
};