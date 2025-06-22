import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '../useClipboard';

describe('useClipboard', () => {
    it('should copy and paste text (mocked)', async () => {
        // モック: navigator.clipboard
        const clipboardData = { text: '' };
        // @ts-ignore
        global.navigator.clipboard = {
            writeText: async (text: string) => { clipboardData.text = text; },
            readText: async () => clipboardData.text,
        };
        const { result } = renderHook(() => useClipboard());
        await act(async () => {
            await result.current.copy('hello');
        });
        let pasted = '';
        await act(async () => {
            pasted = await result.current.paste();
        });
        expect(pasted).toBe('hello');
    });
});
