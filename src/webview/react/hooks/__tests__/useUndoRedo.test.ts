import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from '../useUndoRedo';

describe('useUndoRedo', () => {
    it('should initialize with initial value', () => {
        const { result } = renderHook(() => useUndoRedo('a'));
        expect(result.current.undo()).toBe('a');
        expect(result.current.redo()).toBe('a');
    });

    it('should push and undo/redo values', () => {
        const { result } = renderHook(() => useUndoRedo('a'));
        act(() => result.current.push('b'));
        act(() => result.current.push('c'));
        expect(result.current.undo()).toBe('b');
        expect(result.current.undo()).toBe('a');
        expect(result.current.redo()).toBe('b');
        expect(result.current.redo()).toBe('c');
    });

    it('should reset history', () => {
        const { result } = renderHook(() => useUndoRedo('a'));
        act(() => result.current.push('b'));
        act(() => result.current.reset('z'));
        expect(result.current.undo()).toBe('z');
        expect(result.current.redo()).toBe('z');
    });
});
