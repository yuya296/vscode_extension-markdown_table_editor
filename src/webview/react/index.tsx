// src/webview/react/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { TableEditor } from "./TableEditor";

const root = document.getElementById("table-editor-root");
if (root) {
  createRoot(root).render(<TableEditor />);
}