import { useMemo } from "react";
import { parseMarkdownTable } from "../utils/table";

export function useTableData(markdown: string) {
    return useMemo(() => {
        const result = parseMarkdownTable(markdown);
        if (result.columns.length === 0) {
            return {
                columns: [
                    { name: "Column1", header: "Column1" },
                    { name: "Column2", header: "Column2" },
                    { name: "Column3", header: "Column3" }
                ],
                data: [
                    { "Column1": "", "Column2": "", "Column3": "" },
                    { "Column1": "", "Column2": "", "Column3": "" },
                    { "Column1": "", "Column2": "", "Column3": "" }
                ]
            };
        }
        return result;
    }, [markdown]);
}
