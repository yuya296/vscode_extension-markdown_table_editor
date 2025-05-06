import React from "react";

type Props = {
  onAddRow: () => void;
  onAddColumn: () => void;
  onSave: () => void;
  onSaveAndClose: () => void;
  isModified: boolean;
  columns: { name: string; header: string }[];
  onToggleWrap: (field: string) => void;
};

const TableEditorButtons: React.FC<Props> = ({
  onAddRow,
  onAddColumn,
  onSave,
  onSaveAndClose,
  isModified,
  columns,
  onToggleWrap,
}) => (
  <div className="tableEditorButtons">
    <button onClick={onAddRow}>行を追加</button>
    <button onClick={onAddColumn}>列を追加</button>
    <button onClick={onSave} disabled={!isModified}>Save</button>
    <button onClick={onSaveAndClose} disabled={!isModified}>Save & Close</button>
    {columns.map((col: { name: string; header: string }) => (
      <button key={col.name} onClick={() => onToggleWrap(col.name)}>
        {col.header} wrap切替
      </button>
    ))}
  </div>
);

export default TableEditorButtons;