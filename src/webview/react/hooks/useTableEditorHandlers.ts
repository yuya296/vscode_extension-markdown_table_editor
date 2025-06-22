import { useCallback } from "react";
import parseMarkdownTable, { toMarkdownTable, Column, RowData } from "../utils/table";

interface UseTableEditorHandlersProps {
  columnDefs: Column[];
  rowData: RowData[];
  setMarkdown: (md: string) => void;
  setIsModified: (v: boolean) => void;
  markdown: string;
  jspInstance?: React.RefObject<any>;
}

export function useTableEditorHandlers({
  columnDefs,
  rowData,
  setMarkdown,
  setIsModified,
  markdown,
  jspInstance,
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

  // wrapText/autoHeightのon/off切替
  const handleToggleWrapAll = useCallback(() => {
    if (!jspInstance?.current || !jspInstance.current[0]) return;
    const colDefs = jspInstance.current[0].options.columns;
    const allWrapped = colDefs.every((col: any) => col.wrap);
    colDefs.forEach((col: any) => {
      col.wrap = !allWrapped;
    });
    jspInstance.current[0].refresh();
  }, [jspInstance]);

  // wrap状態判定
  const wrapAllChecked = (() => {
    if (!jspInstance?.current || !jspInstance.current[0]) return false;
    const colDefs = jspInstance.current[0].options.columns;
    return colDefs.length > 0 && colDefs.every((col: any) => col.wrap);
  })();

  // 選択列削除ハンドラ
  const handleDeleteSelectedColumn = useCallback(() => {
    if (!jspInstance?.current || !jspInstance.current[0]) return;
    const selection = jspInstance.current[0].getSelected?.();
    if (!selection || selection.length === 0) {
      alert("削除する列が選択されていません。");
      return;
    }
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
    const { columns, data } = parseMarkdownTable(markdown);
    const delColIdxs: number[] = [];
    for (let col = startCol; col <= endCol; col++) {
      delColIdxs.push(col);
    }
    const newColumns = columns.filter((_, idx) => !delColIdxs.includes(idx));
    const newData = data.map(row => {
      const newRow = { ...row };
      delColIdxs.forEach(idx => {
        if (columns[idx]) delete newRow[columns[idx].name];
      });
      return newRow;
    });
    const newMarkdown = toMarkdownTable(newColumns, newData);
    setMarkdown(newMarkdown);
    setIsModified(true);
  }, [setMarkdown, setIsModified, markdown, jspInstance]);

  return {
    handleAddRow,
    handleAddColumn,
    handleDeleteSelectedColumn,
    handleToggleWrapAll,
    wrapAllChecked,
  };
}