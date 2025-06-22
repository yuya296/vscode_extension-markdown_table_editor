import { useCallback } from "react";
import { toMarkdownTable, Column, RowData } from "../utils/table";

interface UseTableSaveProps {
    columns: Column[];
    data: RowData[];
    setIsModified: (v: boolean) => void;
    jspInstance?: React.RefObject<any>;
}

export function useTableSave({ columns, data, setIsModified, jspInstance }: UseTableSaveProps) {
    // テーブルデータを取得（jspInstance優先、なければpropsのdata）
    const getCurrentData = useCallback(() => {
        if (jspInstance?.current && jspInstance.current[0]) {
            const currentData = jspInstance.current[0].getData();
            const safeData = Array.isArray(currentData) ? currentData : [];
            return safeData.map((row: any[]) => {
                const obj: RowData = {};
                columns.forEach((col, i) => {
                    obj[col.name] = row[i] ?? "";
                });
                return obj;
            });
        }
        return data;
    }, [jspInstance, columns, data]);

    // 保存
    const save = useCallback(() => {
        const dataObjects = getCurrentData();
        const md = toMarkdownTable(columns, dataObjects);
        if (window.vscode && typeof window.vscode.postMessage === "function") {
            window.vscode.postMessage({ type: "save", markdown: md });
            window.vscode.postMessage({ type: "saved" });
        }
        setIsModified(false);
    }, [columns, getCurrentData, setIsModified]);

    // 保存して閉じる
    const saveAndClose = useCallback(() => {
        const dataObjects = getCurrentData();
        const md = toMarkdownTable(columns, dataObjects);
        if (window.vscode && typeof window.vscode.postMessage === "function") {
            window.vscode.postMessage({ type: "saveAndClose", markdown: md });
        }
        setIsModified(false);
    }, [columns, getCurrentData, setIsModified]);

    return { save, saveAndClose };
}
