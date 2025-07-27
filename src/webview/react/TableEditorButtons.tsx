import React from "react";
import { MdUndo, MdRedo } from "react-icons/md";

interface TableEditorButtonsProps {
  // Undo/Redo
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  
  // jspreadsheet instance
  jspInstance?: React.RefObject<any>;
}

const TableEditorButtons: React.FC<TableEditorButtonsProps> = ({
  jspInstance,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}) => {

  // jspreadsheetのUndoを直接呼び出す
  const handleJSPUndo = () => {
    if (jspInstance?.current && jspInstance.current[0]) {
      const instance = jspInstance.current[0];
      
      if (typeof instance.undo === 'function') {
        try {
          instance.undo();
          onUndo();
        } catch (error) {
          console.error("Undo error:", error);
        }
      }
    }
  };

  const handleJSPRedo = () => {
    if (jspInstance?.current && jspInstance.current[0]) {
      const instance = jspInstance.current[0];
      
      if (typeof instance.redo === 'function') {
        try {
          instance.redo();
          onRedo();
        } catch (error) {
          console.error("Redo error:", error);
        }
      }
    }
  };
  
  return (
    <div className="tableEditorButtons">
      <button 
        onClick={handleJSPUndo} 
        title="元に戻す (Ctrl+Z)"
        disabled={!canUndo}
        style={{ backgroundColor: !canUndo ? '#ccc' : '' }}
      >
        {React.createElement(MdUndo as any, { size: 16 })}
      </button>
      <button 
        onClick={handleJSPRedo} 
        title="やり直し (Ctrl+Y)"
        disabled={!canRedo}
      >
        {React.createElement(MdRedo as any, { size: 16 })}
      </button>
    </div>
  );
};

export default TableEditorButtons;