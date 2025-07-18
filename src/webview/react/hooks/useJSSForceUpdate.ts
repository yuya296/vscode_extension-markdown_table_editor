import { useCallback } from "react";

/**
 * jspreadsheetのUIを強制的に更新するためのフック
 */
export function useJSSForceUpdate(
    jspInstance: React.RefObject<any>,
    columns: any[],
    data: any[]
) {
    const forceUpdateJSS = useCallback(() => {
        console.log("[DEBUG] forceUpdateJSS called");
        console.log("[DEBUG] jspInstance.current:", jspInstance.current);

        if (jspInstance.current) {
            const tableData = data.map(row =>
                columns.map(col => row[col.name] || "")
            );
            console.log("[DEBUG] forceUpdateJSS - computed tableData:", tableData);

            // setDataメソッドが存在するかチェック
            if (typeof jspInstance.current.setData === "function") {
                console.log("[DEBUG] calling setData with:", tableData);
                jspInstance.current.setData(tableData);
                console.log("[DEBUG] setData completed");

                // setData後の状態を確認
                if (typeof jspInstance.current.getData === "function") {
                    const afterSetData = jspInstance.current.getData();
                    console.log("[DEBUG] data after setData:", afterSetData);
                }
            } else {
                console.log("[DEBUG] setData method not available");
                console.log("[DEBUG] available methods:", Object.getOwnPropertyNames(jspInstance.current));
            }
        } else {
            console.log("[DEBUG] jspInstance.current is null/undefined");
        }
    }, [jspInstance, columns, data]);

    return { forceUpdateJSS };
}
