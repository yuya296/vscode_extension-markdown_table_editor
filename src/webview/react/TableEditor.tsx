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
import { ModuleRegistry, ClientSideRowModelModule, _EditCoreModule as EditCoreModule, ValidationModule, TextEditorModule, LargeTextEditorModule, RowSelectionModule, RowApiModule, CellStyleModule, RowAutoHeightModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";

// AG Grid モジュール登録
ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  EditCoreModule,
  ValidationModule,
  TextEditorModule,
  LargeTextEditorModule,
  RowSelectionModule,
  RowApiModule,
  CellStyleModule,
  RowAutoHeightModule,
]);
import TableEditorButtons from "./TableEditorButtons";
import { parseMarkdownTable, toMarkdownTable } from "./utils/table";
import { useTableEditorHandlers } from "./hooks/useTableEditorHandlers";

const DEFAULT_COLUMN_DEF = {
  editable: true,
  resizable: true,
  sortable: true,
  minWidth: 100,
  autoHeight: true,
  cellClass: "wrap-text-cell",
  wrapText: true,
};

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
          ...DEFAULT_COLUMN_DEF,
          field: col.name,
          headerName: col.header,
          cellEditor: "agLargeTextCellEditor",
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
    setMarkdown(initialMarkdown);
    setIsModified(false);
  }, []);

  const { handleAddRow, handleAddColumn } = useTableEditorHandlers({
    columnDefs,
    rowData,
    setRowData,
    setMarkdown,
    setIsModified,
  });

    // wrapText/autoHeightのon/off切替（単一列）
    const handleToggleWrap = (field: string) => {
      setColumnDefs((prevDefs: any[]) =>
        prevDefs.map(def => {
          if (def.field === field) {
            const isWrapped = def.cellClass === "wrap-text-cell";
            return {
              ...def,
              cellClass: isWrapped ? undefined : "wrap-text-cell",
              autoHeight: !isWrapped,
              wrapText: !isWrapped,
              minWidth: def.minWidth,
              maxWidth: def.maxWidth,
            };
          }
          return def;
        })
      );
    };
  
    // wrapText/autoHeightのon/off切替（全列一括）
    const handleToggleWrapAll = () => {
      setColumnDefs((prevDefs: any[]) => {
        const allWrapped = prevDefs.every(def => def.cellClass === "wrap-text-cell");
        return prevDefs.map(def => {
          // 既存のhandleToggleWrapロジックを流用
          const isWrapped = def.cellClass === "wrap-text-cell";
          const nextWrapped = allWrapped ? false : true;
          return {
            ...def,
            cellClass: nextWrapped ? "wrap-text-cell" : undefined,
            autoHeight: nextWrapped,
            wrapText: nextWrapped,
            minWidth: def.minWidth,
            maxWidth: def.maxWidth,
          };
        });
      });
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
          wrapAllChecked={columnDefs.length > 0 && columnDefs.every(def => def.cellClass === "wrap-text-cell")}
          onToggleWrapAll={handleToggleWrapAll}
        />
        <div className="ag-theme-alpine" style={{ width: "100%", minHeight: 300 }}>
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            rowData={rowData}
            modules={[ClientSideRowModelModule, EditCoreModule, ValidationModule, TextEditorModule, RowSelectionModule, RowApiModule]}
            defaultColDef={DEFAULT_COLUMN_DEF}

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