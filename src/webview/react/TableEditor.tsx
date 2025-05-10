// textareaカスタムエディタ
const customTextareaEditor = {
  createEditor: function (
    cell: HTMLTableCellElement,
    value: string,
    x: number,
    y: number,
    instance: any
  ) {
    const textarea = document.createElement("textarea");
    textarea.value = value || "";
    textarea.style.width = "100%";
    textarea.style.height = "100%";
    textarea.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        instance.closeEditor(cell, true);
      }
    });
    return { element: textarea, value: textarea.value };
  },
  getValue: function (editorObj: any) {
    if (!editorObj) return "";
    if (editorObj.element) return editorObj.element.value;
    if (editorObj.value !== undefined) return editorObj.value;
    if (editorObj instanceof HTMLTextAreaElement) return editorObj.value;
    return "";
  },
  setValue: function (editorObj: any, value: string) {
    if (!editorObj) return;
    if (editorObj.element) editorObj.element.value = value;
    else if (editorObj instanceof HTMLTextAreaElement) editorObj.value = value;
  },
  focus: function (editorObj: any) {
    if (!editorObj) return;
    if (editorObj.element) editorObj.element.focus();
    else if (editorObj instanceof HTMLTextAreaElement) editorObj.focus();
  },
  closeEditor: function () {},
  openEditor: function (
    cell: HTMLTableCellElement,
    value: string,
    x: number,
    y: number,
    instance: any
  ) {
    return this.createEditor(cell, value, x, y, instance);
  },
};
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
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import TableEditorButtons from "./TableEditorButtons";
import { parseMarkdownTable, toMarkdownTable } from "./utils/table";
import { useTableEditorHandlers } from "./hooks/useTableEditorHandlers";

export const TableEditor: React.FC = () => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jspInstance = useRef<any>(null);

  // textareaカスタムエディタをグローバル登録
  (jspreadsheet as any).editors = (jspreadsheet as any).editors || {};
  (jspreadsheet as any).editors.textarea = customTextareaEditor;

  const initialMarkdown = window.__INIT_MARKDOWN__ || "";
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isModified, setIsModified] = useState(false);

  // markdownからcolumns/dataを生成
  const { columns, data } = React.useMemo(() => parseMarkdownTable(markdown), [markdown]);

  // jspreadsheetの初期化・破棄
  useEffect(() => {
    if (!sheetRef.current) return;

    // 既存のインスタンスがあれば破棄
    if (jspInstance.current) {
      jspInstance.current.destroy();
      jspInstance.current = null;
    }

    // カラム定義
    const colDefs = columns.map(col => ({
      title: col.name,
      width: 120,
      align: "left" as "left",
      wrap: true,
      wordWrap: true,
      type: "text" as const,
    }));

    // jspreadsheet初期化
    jspInstance.current = jspreadsheet(sheetRef.current, {
      data,
      columns: colDefs as any,
      minDimensions: [columns.length || 1, data.length || 1],
      editable: true,
      wordWrap: true,
      allowInsertRow: true,
      allowInsertColumn: true,
      allowDeleteRow: true,
      allowDeleteColumn: true,
      onbeforechange: (
        element: any,
        cell: HTMLTableCellElement,
        colIndex: string | number,
        rowIndex: string | number,
        newValue: any
      ) => {
        return newValue;
      },
      onchange: () => {
        setIsModified(true);
        if (window.vscode && typeof window.vscode.postMessage === "function") {
          window.vscode.postMessage({ type: "modified" });
        }
      },
    });

    setIsModified(false);

    return () => {
      if (jspInstance.current) {
        jspInstance.current.destroy();
        jspInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markdown]);

  // 保存処理
  const handleSave = useCallback(() => {
    if (!jspInstance.current) return;
    const currentData = jspInstance.current.getData();
    const md = toMarkdownTable(columns, currentData);
    if (window.vscode && typeof window.vscode.postMessage === "function") {
      window.vscode.postMessage({ type: "save", markdown: md });
      window.vscode.postMessage({ type: "saved" });
    }
    setIsModified(false);
  }, [columns]);

  // Save & Closeボタン処理
  const handleSaveAndClose = useCallback(() => {
    if (!jspInstance.current) return;
    const currentData = jspInstance.current.getData();
    const md = toMarkdownTable(columns, currentData);
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
    setRowData: () => {},
    setMarkdown,
    setIsModified,
  });

  // wrapText/autoHeightのon/off切替（jspreadsheetはwrap: true/falseで制御）
  const handleToggleWrapAll = () => {
    if (!jspInstance.current) return;
    const colDefs = jspInstance.current.options.columns;
    const allWrapped = colDefs.every((col: any) => col.wrap);
    colDefs.forEach((col: any) => {
      col.wrap = !allWrapped;
    });
    jspInstance.current.refresh();
  };

  return (
    <div>
      <div className="tableEditor">
        <TableEditorButtons
          onAddRow={handleAddRow}
          onAddColumn={handleAddColumn}
          onSave={handleSave}
          onSaveAndClose={handleSaveAndClose}
          isModified={isModified}
          wrapAllChecked={columns.length > 0 && columns.every(col => col.wrap)}
          onToggleWrapAll={handleToggleWrapAll}
        />
        <div ref={sheetRef} style={{ width: "100%", minHeight: 300 }} />
      </div>
    </div>
  );
};