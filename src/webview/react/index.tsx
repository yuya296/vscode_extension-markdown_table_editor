// src/webview/react/index.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { TableEditor } from "./TableEditor";

console.log("[DEBUG] index.tsx loaded!");
const root = document.getElementById("table-editor-root");
console.log("[DEBUG] root element:", root);
if (root) {
  console.log("[DEBUG] Rendering TableEditor...");
  createRoot(root).render(<TableEditor />);
  console.log("[DEBUG] TableEditor rendered!");
} else {
  console.error("[ERROR] Root element not found!");
}