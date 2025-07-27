import { useState, useCallback } from "react";

interface UndoRedoActions {
  onEdit: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * シンプルなundo/redo状態管理フック
 * 
 * 暫定実装：undoは常に有効、redoはundo実行後に有効
 */
export function useSimpleUndoRedo(): UndoRedoState & UndoRedoActions {
  const [undoCount, setUndoCount] = useState(0);

  const onEdit = useCallback(() => {
    // 新しい編集後はredoをリセット
    setUndoCount(0);
  }, []);

  const onUndo = useCallback(() => {
    setUndoCount(prev => prev + 1);
  }, []);

  const onRedo = useCallback(() => {
    setUndoCount(prev => Math.max(0, prev - 1));
  }, []);

  return {
    canUndo: true, // 暫定実装：常に有効
    canRedo: undoCount > 0,
    onEdit,
    onUndo,
    onRedo,
  };
}