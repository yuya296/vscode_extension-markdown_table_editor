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
import { useTableEditorHandlers } from "./hooks/useTableEditorHandlers";
import { useTableData } from "./hooks/useTableData";
import { useTableSave } from "./hooks/useTableSave";
import { useSimpleUndoRedo } from "./hooks/useSimpleUndoRedo";
import styles from "./TableEditor.module.scss";

export const TableEditor: React.FC = () => {
  const jspInstance = useRef<any>(null);

  const initialMarkdown = window.__INIT_MARKDOWN__ || "";
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);
  const [isModified, setIsModified] = useState(false);


  // markdownからcolumns/dataを生成
  const { columns, data } = useTableData(markdown);

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

  // 保存機能
  const { save: handleSave, saveAndClose: handleSaveAndClose } = useTableSave({
    columns,
    data,
    setIsModified,
    jspInstance,
  });

  // Undo/Redo状態管理
  const { canUndo, canRedo, onUndo, onRedo } = useSimpleUndoRedo();
  
  // 履歴状態の更新用（互換性のため保持）
  const [historyUpdateTrigger, setHistoryUpdateTrigger] = useState(0);
  const handleHistoryChange = () => setHistoryUpdateTrigger(prev => prev + 1);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      
      if (isCmd && e.key === "s") {
        e.preventDefault();
        e.stopPropagation();
        handleSave();
      } else if (isCmd && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        if (jspInstance?.current?.[0]) {
          jspInstance.current[0].undo();
          onUndo();
          handleHistoryChange();
        }
      } else if (isCmd && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        e.stopPropagation();
        if (jspInstance?.current?.[0]) {
          jspInstance.current[0].redo();
          onRedo();
          handleHistoryChange();
        }
      }
    };
    
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [handleSave, jspInstance, onUndo, onRedo, handleHistoryChange]);

  // テーブル操作ハンドラー
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
          jspInstance={jspInstance}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
        />
        <TableBody
          jspInstance={jspInstance}
          tableData={tableData}
          colDefs={colDefs}
          columns={columns}
          data={data}
          setIsModified={setIsModified}
          setMarkdown={setMarkdown}
          onHistoryChange={handleHistoryChange}
        />
      </div>
    </div>
  );
};