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
  closeEditor: function () { },
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
import { parseMarkdownTable, toMarkdownTable, Column, RowData } from "./utils/table";
import { useTableEditorHandlers } from "./hooks/useTableEditorHandlers";
import styles from "./TableEditor.module.scss";

export const TableEditor: React.FC = () => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jspInstance = useRef<any>(null);

  // textareaカスタムエディタをグローバル登録
  (jspreadsheet as any).editors = (jspreadsheet as any).editors || {};
  (jspreadsheet as any).editors.textarea = customTextareaEditor;

  const initialMarkdown = window.__INIT_MARKDOWN__ || "";
  const [markdown, setMarkdown] = useState<string>(initialMarkdown);
  const [isModified, setIsModified] = useState(false);

  // markdownからcolumns/dataを生成
  const { columns, data } = React.useMemo(() => parseMarkdownTable(markdown), [markdown]);

  // jspreadsheetの初期化・破棄
  useEffect(() => {
    if (!sheetRef.current) return;
    if (jspInstance.current) {
      jspInstance.current.destroy();
      jspInstance.current = null;
    }
    // カラム定義
    const colDefs = columns.map(col => ({
      title: col.name,
      width: 120,
      align: "left" as const,
      wrap: true,
      wordWrap: true,
      type: "text" as const,
    }));
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
      ) => newValue,
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
    const columnsOption = jspInstance.current.options.columns || [];
    let domHeaders: string[] = [];
    if (sheetRef.current) {
      const ths = sheetRef.current.querySelectorAll('.jexcel thead th');
      domHeaders = Array.from(ths).map(th => (th as HTMLElement).innerText.trim());
    }
    const columnsForSave: Column[] = columnsOption.map((col: any, i: number) => ({
      name: (domHeaders[i] && domHeaders[i].length > 0) ? domHeaders[i] : `__EMPTY__${i + 1}`,
      header: domHeaders[i] || col.title || "",
    }));
    const currentData = jspInstance.current.getData();
    const safeData = Array.isArray(currentData) ? currentData : [];
    const dataObjects: RowData[] = safeData.map((row: any[]) => {
      const obj: RowData = {};
      columnsForSave.forEach((col, i) => {
        obj[col.name] = row[i] ?? "";
      });
      return obj;
    });
    const md = toMarkdownTable(columnsForSave, dataObjects);
    if (window.vscode && typeof window.vscode.postMessage === "function") {
      window.vscode.postMessage({ type: "save", markdown: md });
      window.vscode.postMessage({ type: "saved" });
    }
    setIsModified(false);
  }, []);

  // Save & Closeボタン処理
  const handleSaveAndClose = useCallback(() => {
    if (!jspInstance.current) return;
    const columnsOption = jspInstance.current.options.columns || [];
    let domHeaders: string[] = [];
    if (sheetRef.current) {
      const ths = sheetRef.current.querySelectorAll('.jexcel thead th');
      domHeaders = Array.from(ths).map(th => (th as HTMLElement).innerText.trim());
    }
    const columnsForSave: Column[] = columnsOption.map((col: any, i: number) => ({
      name: (domHeaders[i] && domHeaders[i].length > 0) ? domHeaders[i] : `__EMPTY__${i + 1}`,
      header: domHeaders[i] || col.title || "",
    }));
    const currentData = jspInstance.current.getData();
    const safeData = Array.isArray(currentData) ? currentData : [];
    const dataObjects: RowData[] = safeData.map((row: any[]) => {
      const obj: RowData = {};
      columnsForSave.forEach((col, i) => {
        obj[col.name] = row[i] ?? "";
      });
      return obj;
    });
    const md = toMarkdownTable(columnsForSave, dataObjects);
    if (window.vscode && typeof window.vscode.postMessage === "function") {
      window.vscode.postMessage({ type: "saveAndClose", markdown: md });
    }
    setIsModified(false);
  }, []);

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
    if (!jspInstance.current) return;
    const colDefs = jspInstance.current.options.columns;
    const allWrapped = colDefs.every((col: any) => col.wrap);
    colDefs.forEach((col: any) => {
      col.wrap = !allWrapped;
    });
    jspInstance.current.refresh();
  };

  // 全列wrap状態かどうかを判定
  const wrapAllChecked = (() => {
    if (!jspInstance.current) return false;
    const colDefs = jspInstance.current.options.columns;
    return colDefs.length > 0 && colDefs.every((col: any) => col.wrap);
  })();

  // 選択列削除ハンドラ
  const handleDeleteSelectedColumn = useCallback(() => {
    if (!jspInstance.current) return;
    const selection = jspInstance.current.getSelected?.();
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
    if (jspInstance.current) {
      jspInstance.current.destroy();
      jspInstance.current = null;
    }
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
        <div ref={sheetRef} style={{ width: "100%", minHeight: 300 }} />
      </div>
    </div>
  );
};