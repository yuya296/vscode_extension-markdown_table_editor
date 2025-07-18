import React from "react";


type Props = {
  onAddRow: () => void;
  onAddColumn: () => void;
  onDeleteSelectedColumn: () => void;
  onSave: () => void;
  onSaveAndClose: () => void;
  isModified: boolean;
  onToggleWrapAll: () => void;
  wrapAllChecked: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  jspInstance?: React.RefObject<any>;
};

const TableEditorButtons: React.FC<Props> = ({
  onAddRow,
  onAddColumn,
  onDeleteSelectedColumn,
  onSave,
  onSaveAndClose,
  isModified,
  onToggleWrapAll,
  wrapAllChecked,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  jspInstance,
}) => {
  // jspreadsheetのUndoを直接呼び出す
  const handleJSPUndo = () => {
    if (jspInstance?.current && jspInstance.current[0]) {
      jspInstance.current[0].undo();
    }
  };

  const handleJSPRedo = () => {
    if (jspInstance?.current && jspInstance.current[0]) {
      jspInstance.current[0].redo();
    }
  };

  return (
    <div className="tableEditorButtons">
      <button 
        onClick={handleJSPUndo} 
        title="元に戻す (Ctrl+Z)"
      >↶ Undo</button>
      <button 
        onClick={handleJSPRedo} 
        title="やり直し (Ctrl+Y)"
      >↷ Redo</button>
      <button onClick={onAddRow}>行を追加</button>
      <button onClick={onAddColumn}>列を追加</button>
      <button onClick={onDeleteSelectedColumn}>選択列を削除</button>
      <button onClick={onSave} disabled={!isModified}>Save</button>
      <button onClick={onSaveAndClose} disabled={!isModified}>Save & Close</button>
      <label style={{ userSelect: "none", marginLeft: 8 }}>
        <input
          type="checkbox"
          checked={wrapAllChecked}
          onChange={onToggleWrapAll}
          style={{ marginRight: 4 }}
        />
        全列 wrap
      </label>
    </div>
  );
};

export default TableEditorButtons;