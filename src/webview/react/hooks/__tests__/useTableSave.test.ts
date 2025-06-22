import { renderHook, act } from '@testing-library/react';
import { useTableSave } from '../useTableSave';

describe('useTableSave', () => {
  it('save posts message and resets modified', () => {
    const columns = [ { name: 'A', header: 'A' } ];
    const data = [ { A: '1' } ];
    let modified = true;
    const setIsModified = (v: boolean) => { modified = v; };
    // モックwindow.vscode
    const postMessage = jest.fn();
    // @ts-ignore
    global.window.vscode = { postMessage };
    const { result } = renderHook(() => useTableSave({ columns, data, setIsModified }));
    act(() => result.current.save());
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'save' }));
    expect(modified).toBe(false);
  });

  it('saveAndClose posts message and resets modified', () => {
    const columns = [ { name: 'A', header: 'A' } ];
    const data = [ { A: '1' } ];
    let modified = true;
    const setIsModified = (v: boolean) => { modified = v; };
    const postMessage = jest.fn();
    // @ts-ignore
    global.window.vscode = { postMessage };
    const { result } = renderHook(() => useTableSave({ columns, data, setIsModified }));
    act(() => result.current.saveAndClose());
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: 'saveAndClose' }));
    expect(modified).toBe(false);
  });
});
