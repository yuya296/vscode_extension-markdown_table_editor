import React, { useRef, useEffect } from "react";
import { ICellEditorParams } from "ag-grid-community";

export const TextareaCellEditor: React.FC<ICellEditorParams> = (props) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.select();
    }
  }, []);

  return (
    <textarea
      ref={ref}
      className="ag-input-field-input ag-text-field-input"
      style={{ width: "100%", height: "100%", resize: "vertical", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      defaultValue={props.value}
      onChange={e => props.stopEditing && props.stopEditing()}
      onBlur={e => props.stopEditing && props.stopEditing()}
      onKeyDown={e => {
        console.log(e);
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          props.stopEditing && props.stopEditing();
        }
      }}
      wrap="soft"
      rows={3}
    />
  );
};

export default TextareaCellEditor;