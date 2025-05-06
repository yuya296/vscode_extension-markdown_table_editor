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
  }
}

import React, { useRef, useState, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, ClientSideRowModelModule, _EditCoreModule as EditCoreModule, ValidationModule, TextEditorModule, RowSelectionModule, RowApiModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import TableEditorButtons from "./TableEditorButtons";
// Markdownテーブルをcolumns/data形式に変換する関数
function parseMarkdownTable(md: string): { columns: any[]; data: any[] } {
  const lines = md
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && l.startsWith('|') && l.endsWith('|'));
  if (lines.length < 2) return { columns: [], data: [] };
  const header = lines[0].slice(1, -1).split('|').map(h => h.trim());
  const columns = header.map((h, i) => ({
    name: `col${i + 1}`,
    header: h
  }));
  const data = lines.slice(2).map(row => {
    const cells = row.slice(1, -1).split('|').map(c => c.trim());
    const obj: Record<string, string> = {};
    columns.forEach((col, i) => {
      obj[col.name] = cells[i] ?? '';
    });
    return obj;
  });
  return { columns, data };
}

// ToastUIスタイルのカスタムボタンコンポーネント


/**
 * データ→Markdown変換
 */
function toMarkdownTable(columns: any[], data: any[]): string {
  if (!columns.length) return "";
  const header = "|" + columns.map((col: any) => col.header).join("|") + "|";
  const sep = "|" + columns.map(() => "---").join("|") + "|";
  const rows = data.map(row =>
    "|" + columns.map((col: any) => (row[col.name] ?? "")).join("|") + "|"
  );
  return [header, sep, ...rows].join("\n") + "\n";
}

export const TableEditor: React.FC = () => {
  const gridRef = useRef<any>(null);
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);

  // 初期Markdownデータをstateにセット
  const initialMarkdown = window.__INIT_MARKDOWN__ || "";
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [isModified, setIsModified] = useState(false);

  // markdownからcolumns/dataを生成
  const { columns, data } = React.useMemo(() => parseMarkdownTable(markdown), [markdown]);

  // 初回マウント時のみrowData/columnDefsをセット
  useEffect(() => {
    if (!rowData.length && !columnDefs.length) {
      setRowData(data);
      setColumnDefs(
        columns.map(col => ({
          field: col.name,
          headerName: col.header,
        }))
      );
    }
  }, []);

  // 編集検知: GridインスタンスのafterChangeイベントで検知
  useEffect(() => {
    const gridInst = gridRef.current?.getInstance?.();
    if (!gridInst) return;
    const handler = () => {
      if (!isModified) {
        setIsModified(true);
        if (window.vscode && typeof window.vscode.postMessage === "function") {
          window.vscode.postMessage({ type: "modified" });
        }
      }
    };
    gridInst.on('afterChange', handler);
    return () => {
      gridInst.off('afterChange', handler);
    };
  }, [isModified]);

  // 保存処理
  const handleSave = () => {
    if (!gridRef.current || !gridRef.current.api) return;
    const currentData: any[] = [];
    gridRef.current.api.forEachNode((node: any) => {
      if (node.data) currentData.push(node.data);
    });
    const md = toMarkdownTable(columns, currentData);
    if (window.vscode && typeof window.vscode.postMessage === "function") {
      window.vscode.postMessage({ type: "save", markdown: md });
      window.vscode.postMessage({ type: "saved" });
    }
    setIsModified(false);
  };

  // Save & Closeボタン処理
  const handleSaveAndClose = () => {
    if (!gridRef.current || !gridRef.current.api) return;
    const currentData: any[] = [];
    gridRef.current.api.forEachNode((node: any) => {
      if (node.data) currentData.push(node.data);
    });
    const md = toMarkdownTable(columns, currentData);
    if (window.vscode && typeof window.vscode.postMessage === "function") {
      window.vscode.postMessage({ type: "saveAndClose", markdown: md });
    }
    setIsModified(false);
  };

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
  });
  useEffect(() => {
    if (gridRef.current?.api) {
      console.log("Displayed rows:", gridRef.current.api.getDisplayedRowCount());
      console.log("Is editing cell?", gridRef.current.api.getEditingCells());
    }
  }, [gridRef.current]);

  useEffect(() => {
    setMarkdown(initialMarkdown);
    setIsModified(false);
  }, []);

  // 行追加
  const handleAddRow = () => {
    setRowData(prev => {
      const newData = [...prev, {}];
      setIsModified(true);
      return newData;
    });
  };

  // 列追加
  const handleAddColumn = () => {
    const newColIdx = columnDefs.length + 1;
    const newColName = `col${newColIdx}`;
    const newColHeader = `Column${newColIdx}`;
    const newColumns = [
      ...columnDefs,
      { field: newColName, headerName: newColHeader, editable: true }
    ];
    const newData = rowData.map(row => ({ ...row, [newColName]: "" }));
    // Markdownにも反映
    setMarkdown(toMarkdownTable(
      newColumns.map(col => ({ name: col.field, header: col.headerName })),
      newData
    ));
    setIsModified(true);
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
        />
        <div className="ag-theme-alpine" style={{ width: "100%", minHeight: 300 }}>
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={rowData}
            modules={[ClientSideRowModelModule, EditCoreModule, ValidationModule, TextEditorModule, RowSelectionModule, RowApiModule]}
            defaultColDef={{
              editable: true,
              resizable: true,
              sortable: true,
              flex: 1
            }}

            onCellValueChanged={e => {
              const updatedData: any[] = [];
              e.api.forEachNode((node) => {
                if (node.data) updatedData.push(node.data);
              });
              setRowData(updatedData);
              if (!isModified) {
                setIsModified(true);
                if (window.vscode && typeof window.vscode.postMessage === "function") {
                  window.vscode.postMessage({ type: "modified" });
                }
              }
            }}
            domLayout="autoHeight"
            rowSelection="multiple"
          />
        </div>
      </div>
    </div>
  );
};