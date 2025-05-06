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
      onChange={() => {}}
      onBlur={e => props.stopEditing && props.stopEditing()}
      onKeyDown={e => {
        // 何もせず
      }}
      onKeyUp={e => {
        console.log(
          "onKeyUp:",
          JSON.stringify({
            key: e.key,
            shiftKey: e.shiftKey,
            ctrlKey: e.ctrlKey,
            metaKey: e.metaKey,
            altKey: e.altKey
          })
        );
      }}
      onInput={e => {
        console.log("onInput:", e);
      }}
      wrap="soft"
      rows={3}
    />
  );
};

export default TextareaCellEditor;