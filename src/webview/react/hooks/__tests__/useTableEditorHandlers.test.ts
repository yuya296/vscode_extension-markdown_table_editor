import { renderHook, act } from '@testing-library/react';
import { useTableEditorHandlers } from '../useTableEditorHandlers';

const baseColumns = [
    { name: 'A', header: 'A' },
    { name: 'B', header: 'B' }
];
const baseData = [
    { A: '1', B: '2' },
    { A: '3', B: '4' }
];

describe('useTableEditorHandlers', () => {
    it('handleAddRow adds a row', () => {
        let markdown = '';
        const setMarkdown = (md: string) => { markdown = md; };
        let modified = false;
        const setIsModified = (v: boolean) => { modified = v; };
        const { result } = renderHook(() =>
            useTableEditorHandlers({
                columnDefs: baseColumns,
                rowData: baseData,
                setMarkdown,
                setIsModified,
                markdown: '',
            })
        );
        act(() => result.current.handleAddRow());
        expect(markdown).toMatch(/\|\s*\|/); // markdown table
        expect(modified).toBe(true);
    });

    it('handleAddColumn adds a column', () => {
        let markdown = '';
        const setMarkdown = (md: string) => { markdown = md; };
        let modified = false;
        const setIsModified = (v: boolean) => { modified = v; };
        const { result } = renderHook(() =>
            useTableEditorHandlers({
                columnDefs: baseColumns,
                rowData: baseData,
                setMarkdown,
                setIsModified,
                markdown: '',
            })
        );
        act(() => result.current.handleAddColumn());
        expect(markdown).toMatch(/Column3/);
        expect(modified).toBe(true);
    });
});
