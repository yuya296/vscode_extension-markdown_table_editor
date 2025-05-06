import React from "react";


type Props = {
  onAddRow: () => void;
  onAddColumn: () => void;
  onSave: () => void;
  onSaveAndClose: () => void;
  isModified: boolean;
  onToggleWrapAll: () => void;
  wrapAllChecked: boolean;
};

const TableEditorButtons: React.FC<Props> = ({
  onAddRow,
  onAddColumn,
  onSave,
  onSaveAndClose,
  isModified,
  onToggleWrapAll,
  wrapAllChecked,
}) => (
  <div className="tableEditorButtons">
    <button onClick={onAddRow}>行を追加</button>
    <button onClick={onAddColumn}>列を追加</button>
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

export default TableEditorButtons;