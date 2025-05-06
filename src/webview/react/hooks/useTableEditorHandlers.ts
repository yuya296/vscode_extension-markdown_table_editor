import { useCallback } from "react";
import { toMarkdownTable } from "../utils/table";

type ColumnDef = { field: string; headerName: string; editable: boolean };
type RowData = Record<string, any>;

interface UseTableEditorHandlersProps {
  columnDefs: ColumnDef[];
  rowData: RowData[];
  setRowData: React.Dispatch<React.SetStateAction<RowData[]>>;
  setMarkdown: (md: string) => void;
  setIsModified: (v: boolean) => void;
}

export function useTableEditorHandlers({
  columnDefs,
  rowData,
  setRowData,
  setMarkdown,
  setIsModified,
}: UseTableEditorHandlersProps) {
  // 行追加
  const handleAddRow = useCallback(() => {
    setRowData(prev => {
      const newData = [...prev, {}];
      setIsModified(true);
      return newData;
    });
  }, [setRowData, setIsModified]);

  // 列追加
  const handleAddColumn = useCallback(() => {
    const newColIdx = columnDefs.length + 1;
    const newColName = `col${newColIdx}`;
    const newColHeader = `Column${newColIdx}`;
    const newColumns = [
      ...columnDefs,
      { field: newColName, headerName: newColHeader, editable: true }
    ];
    const newData = rowData.map(row => ({ ...row, [newColName]: "" }));
    setMarkdown(
      toMarkdownTable(
        newColumns.map(col => ({ name: col.field, header: col.headerName })),
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