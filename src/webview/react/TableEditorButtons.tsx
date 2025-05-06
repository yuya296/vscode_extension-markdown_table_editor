import React from "react";

type Props = {
  onAddRow: () => void;
  onAddColumn: () => void;
  onSave: () => void;
  onSaveAndClose: () => void;
  isModified: boolean;
};

const TableEditorButtons: React.FC<Props> = ({
  onAddRow,
  onAddColumn,
  onSave,
  onSaveAndClose,
  isModified,
}) => (
  <div className="tableEditorButtons">
    <button onClick={onAddRow}>行を追加</button>
    <button onClick={onAddColumn}>列を追加</button>
    <button onClick={onSave} disabled={!isModified}>Save</button>
    <button onClick={onSaveAndClose} disabled={!isModified}>Save & Close</button>
  </div>
);

export default TableEditorButtons;