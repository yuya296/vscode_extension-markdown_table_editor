import { useCallback } from "react";
import { toMarkdownTable } from "../utils/table";

type ColumnDef = { field: string; headerName: string; editable: boolean };
type RowData = Record<string, any>;

interface UseTableEditorHandlersProps {
  columnDefs: ColumnDef[];
  rowData: RowData[];
  setMarkdown: (md: string) => void;
  setIsModified: (v: boolean) => void;
}

export function useTableEditorHandlers({
  columnDefs,
  rowData,
  setMarkdown,
  setIsModified,
}: UseTableEditorHandlersProps) {
  // 行追加
  const handleAddRow = useCallback(() => {
    // 新しい行データを生成し、markdownを更新
    const newData = [...rowData, {}];
    setMarkdown(
      toMarkdownTable(
        columnDefs,
        newData
      )
    );
    setIsModified(true);
  }, [rowData, columnDefs, setMarkdown, setIsModified]);

  // 列追加
  const handleAddColumn = useCallback(() => {
    const newColIdx = columnDefs.length + 1;
    const newColName = `col${newColIdx}`;
    const newColHeader = `Column${newColIdx}`;
    const newColumns = [
      ...columnDefs,
      { name: newColName, header: newColHeader, editable: true }
    ];
    const newData =
      rowData.length > 0
        ? rowData.map(row => ({ ...row, [newColName]: "" }))
        : [{ [newColName]: "" }];
    setMarkdown(
      toMarkdownTable(
        newColumns,
        newData
      )
    );
    setIsModified(true);
  }, [columnDefs, rowData, setMarkdown, setIsModified]);

  return {
    handleAddRow,
    handleAddColumn,
  };
}