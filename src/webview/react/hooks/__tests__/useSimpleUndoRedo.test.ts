import { renderHook, act } from '@testing-library/react';
import { useSimpleUndoRedo } from '../useSimpleUndoRedo';

describe('useSimpleUndoRedo', () => {
    it('初期状態では undo が有効で redo が無効', () => {
        const { result } = renderHook(() => useSimpleUndoRedo());
        
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it('undo 実行後は redo が有効になる', () => {
        const { result } = renderHook(() => useSimpleUndoRedo());
        
        act(() => {
            result.current.onUndo();
        });
        
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(true);
    });

    it('複数回 undo 実行後も redo が有効', () => {
        const { result } = renderHook(() => useSimpleUndoRedo());
        
        act(() => {
            result.current.onUndo();
            result.current.onUndo();
            result.current.onUndo();
        });
        
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(true);
    });

    it('redo 実行後は undo カウントが減る', () => {
        const { result } = renderHook(() => useSimpleUndoRedo());
        
        // 2回 undo して 1回 redo
        act(() => {
            result.current.onUndo();
            result.current.onUndo();
        });
        
        expect(result.current.canRedo).toBe(true);
        
        act(() => {
            result.current.onRedo();
        });
        
        expect(result.current.canRedo).toBe(true); // まだ1回分残っている
    });

    it('すべて redo した後は redo が無効になる', () => {
        const { result } = renderHook(() => useSimpleUndoRedo());
        
        // 2回 undo して 2回 redo
        act(() => {
            result.current.onUndo();
            result.current.onUndo();
        });
        
        act(() => {
            result.current.onRedo();
            result.current.onRedo();
        });
        
        expect(result.current.canRedo).toBe(false);
    });

    it('redo が0回以下にならない（下限チェック）', () => {
        const { result } = renderHook(() => useSimpleUndoRedo());
        
        // undo なしで redo を実行
        act(() => {
            result.current.onRedo();
        });
        
        expect(result.current.canRedo).toBe(false);
    });

    it('編集後は redo がリセットされる', () => {
        const { result } = renderHook(() => useSimpleUndoRedo());
        
        // undo して redo を有効にしてから編集
        act(() => {
            result.current.onUndo();
        });
        
        expect(result.current.canRedo).toBe(true);
        
        act(() => {
            result.current.onEdit();
        });
        
        expect(result.current.canRedo).toBe(false);
    });

    it('編集後も undo は有効のまま', () => {
        const { result } = renderHook(() => useSimpleUndoRedo());
        
        act(() => {
            result.current.onEdit();
        });
        
        expect(result.current.canUndo).toBe(true);
    });

    it('undo/redo/edit の複合操作', () => {
        const { result } = renderHook(() => useSimpleUndoRedo());
        
        // 編集 → undo → 編集 → undo → redo
        act(() => {
            result.current.onEdit();
        });
        expect(result.current.canRedo).toBe(false);
        
        act(() => {
            result.current.onUndo();
        });
        expect(result.current.canRedo).toBe(true);
        
        act(() => {
            result.current.onEdit(); // redo がリセット
        });
        expect(result.current.canRedo).toBe(false);
        
        act(() => {
            result.current.onUndo();
        });
        expect(result.current.canRedo).toBe(true);
        
        act(() => {
            result.current.onRedo();
        });
        expect(result.current.canRedo).toBe(false);
    });
});