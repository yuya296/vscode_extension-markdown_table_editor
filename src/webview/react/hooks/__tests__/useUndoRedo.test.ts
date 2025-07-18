import { renderHook, act } from '@testing-library/react';
import { useUndoRedo } from '../useUndoRedo';

describe('useUndoRedo', () => {
    it('should initialize with initial value', () => {
        const initialColumns = [{ name: 'col1', header: 'Column1' }];
        const initialData = [{ col1: 'a' }];
        const { result } = renderHook(() => useUndoRedo(initialColumns, initialData));
        expect(result.current.undo()).toEqual({ columns: initialColumns, data: initialData });
        expect(result.current.redo()).toEqual({ columns: initialColumns, data: initialData });
    });

    it('should push and undo/redo values', () => {
        const initialColumns = [{ name: 'col1', header: 'Column1' }];
        const initialData = [{ col1: 'a' }];
        const { result } = renderHook(() => useUndoRedo(initialColumns, initialData));

        const columns2 = [{ name: 'col1', header: 'Column1' }];
        const data2 = [{ col1: 'b' }];
        const columns3 = [{ name: 'col1', header: 'Column1' }];
        const data3 = [{ col1: 'c' }];

        act(() => result.current.push(columns2, data2));
        act(() => result.current.push(columns3, data3));

        expect(result.current.undo()).toEqual({ columns: columns2, data: data2 });
        expect(result.current.undo()).toEqual({ columns: initialColumns, data: initialData });
        expect(result.current.redo()).toEqual({ columns: columns2, data: data2 });
        expect(result.current.redo()).toEqual({ columns: columns3, data: data3 });
    });

    it('should reset history', () => {
        const initialColumns = [{ name: 'col1', header: 'Column1' }];
        const initialData = [{ col1: 'a' }];
        const { result } = renderHook(() => useUndoRedo(initialColumns, initialData));

        const columns2 = [{ name: 'col1', header: 'Column1' }];
        const data2 = [{ col1: 'b' }];
        const resetColumns = [{ name: 'col1', header: 'Column1' }];
        const resetData = [{ col1: 'z' }];

        act(() => result.current.push(columns2, data2));
        act(() => result.current.reset(resetColumns, resetData));

        expect(result.current.undo()).toEqual({ columns: resetColumns, data: resetData });
        expect(result.current.redo()).toEqual({ columns: resetColumns, data: resetData });
    });
});
