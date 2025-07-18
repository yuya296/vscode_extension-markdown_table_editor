import { useRef, useCallback, useState, useEffect } from "react";

interface TableHistoryData {
    columns: any[];
    data: any[];
}

export function useUndoRedo(initialColumns: any[], initialData: any[]) {
    const history = useRef<TableHistoryData[]>([{ columns: initialColumns, data: initialData }]);
    const pointer = useRef(0);
    const [, forceUpdate] = useState({});
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const updateCanFlags = useCallback(() => {
        setCanUndo(pointer.current > 0);
        setCanRedo(pointer.current < history.current.length - 1);
    }, []);

    const triggerUpdate = useCallback(() => {
        forceUpdate({});
        updateCanFlags();
    }, [updateCanFlags]);

    // 初期化
    useEffect(() => {
        updateCanFlags();
    }, [updateCanFlags]);

    const undo = useCallback(() => {
        if (pointer.current > 0) {
            pointer.current -= 1;
            triggerUpdate();
            return history.current[pointer.current];
        }
        return history.current[pointer.current];
    }, [triggerUpdate]);

    const redo = useCallback(() => {
        if (pointer.current < history.current.length - 1) {
            pointer.current += 1;
            triggerUpdate();
            return history.current[pointer.current];
        }
        return history.current[pointer.current];
    }, [triggerUpdate]);

    const push = useCallback((columns: any[], data: any[]) => {
        // 直近の状態以降は破棄
        history.current = history.current.slice(0, pointer.current + 1);
        history.current.push({ columns, data });
        pointer.current = history.current.length - 1;
        triggerUpdate();
    }, [triggerUpdate]);

    const reset = useCallback((columns: any[], data: any[]) => {
        history.current = [{ columns, data }];
        pointer.current = 0;
        triggerUpdate();
    }, [triggerUpdate]);

    return { undo, redo, push, reset, canUndo, canRedo };
}
