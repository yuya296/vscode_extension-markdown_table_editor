import { useRef, useCallback } from "react";

export function useUndoRedo<T>(initialValue: T) {
    const history = useRef<T[]>([initialValue]);
    const pointer = useRef(0);

    const canUndo = pointer.current > 0;
    const canRedo = pointer.current < history.current.length - 1;

    const undo = useCallback(() => {
        if (pointer.current > 0) {
            pointer.current -= 1;
            return history.current[pointer.current];
        }
        return history.current[pointer.current];
    }, []);

    const redo = useCallback(() => {
        if (pointer.current < history.current.length - 1) {
            pointer.current += 1;
            return history.current[pointer.current];
        }
        return history.current[pointer.current];
    }, []);

    const push = useCallback((value: T) => {
        // 直近の状態以降は破棄
        history.current = history.current.slice(0, pointer.current + 1);
        history.current.push(value);
        pointer.current = history.current.length - 1;
    }, []);

    const reset = useCallback((value: T) => {
        history.current = [value];
        pointer.current = 0;
    }, []);

    return { undo, redo, push, reset, canUndo, canRedo };
}
