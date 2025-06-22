import { useCallback } from "react";
import { toMarkdownTable, Column, RowData } from "../utils/table";

interface UseTableEditorHandlersProps {
  columnDefs: Column[];
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
    setMarkdown(toMarkdownTable(columnDefs, newData));
    setIsModified(true);
  }, [rowData, columnDefs, setMarkdown, setIsModified]);

  // 列追加
  const handleAddColumn = useCallback(() => {
    const newColIdx = columnDefs.length + 1;
    const newColName = `col${newColIdx}`;
    const newColHeader = `Column${newColIdx}`;
    const newColumns: Column[] = [
      ...columnDefs,
      { name: newColName, header: newColHeader }
    ];
    const newData =
      rowData.length > 0
        ? rowData.map(row => ({ ...row, [newColName]: "" }))
        : [{ [newColName]: "" }];
    setMarkdown(toMarkdownTable(newColumns, newData));
    setIsModified(true);
  }, [columnDefs, rowData, setMarkdown, setIsModified]);

  return {
    handleAddRow,
    handleAddColumn,
  };
}