import { renderHook } from '@testing-library/react';
import { useTableData } from '../useTableData';

describe('useTableData', () => {
    it('parses valid markdown table', () => {
        const md = `| A | B |\n|---|---|\n| 1 | 2 |`;
        const { result } = renderHook(() => useTableData(md));
        expect(result.current.columns.length).toBe(2);
        expect(result.current.data.length).toBe(1);
        expect(result.current.data[0]['A']).toBe('1');
        expect(result.current.data[0]['B']).toBe('2');
    });

    it('returns default table for empty markdown', () => {
        const { result } = renderHook(() => useTableData(''));
        expect(result.current.columns.length).toBe(3);
        expect(result.current.data.length).toBe(3);
    });

    it('returns default table for invalid markdown', () => {
        const { result } = renderHook(() => useTableData('not a table'));
        expect(result.current.columns.length).toBe(3);
        expect(result.current.data.length).toBe(3);
    });
});
