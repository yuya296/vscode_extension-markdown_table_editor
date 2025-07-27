# CLAUDE.md

！！！必ず日本語で回答してください！！！

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build and Development
- `npm run build` - Full build: compiles TypeScript extension and builds React webview
- `npm run compile` - TypeScript compilation only (extension code)
- `npm run watch` - Watch mode for TypeScript compilation
- `npm run build:webview` - Build React webview only (outputs to src/webview/main.js)
- `npm run watch:webview` - Watch mode for React webview build
- `npm run dev` - Concurrent watch mode for both extension and webview

### Testing
- `npm test` - Run Jest tests
- `npm run pretest` - Compile TypeScript before running tests
- Test files are located in `src/webview/react/hooks/__tests__/` and `src/webview/react/utils/__tests__/`

### VSCode Extension Development
- Use "Run Extension" or "拡張機能のデバッグ" in VSCode to test the extension
- Extension activates on markdown files or when commands are executed
- Main extension entry point: `src/extension.ts`

## Architecture

### VSCode Extension Structure
This is a VSCode extension for editing Markdown tables with an Excel-like React UI. The extension consists of:

1. **Extension Host (src/extension.ts)**
   - Registers commands: `markdown-table-editor.addTable` and `markdown-table-editor.editTable`
   - Manages webview lifecycle and communication
   - Implements CodeLens provider for in-editor "Edit Table" buttons
   - Handles markdown table detection using `marked` library

2. **React Webview (src/webview/react/)**
   - Built with React 18 and jspreadsheet-ce for table editing
   - Entry point: `src/webview/react/index.tsx`
   - Main component: `TableEditor.tsx`
   - Built using esbuild with SCSS modules support

### Key Components

#### TableEditor (src/webview/react/TableEditor.tsx)
- Main React component that orchestrates table editing
- Manages state: markdown text, modification status, undo/redo
- Handles VSCode webview communication
- Integrates multiple custom hooks for functionality

#### Custom Hooks
- `useTableData`: Parses markdown to columns/data, provides default 3x3 table
- `useTableEditorHandlers`: Handles row/column addition, deletion, wrapping
- `useTableSave`: Manages save operations and VSCode communication
- `useUndoRedo`: Implements undo/redo functionality with history stack

#### Utility Functions (src/webview/react/utils/table.ts)
- `parseMarkdownTable`: Converts markdown string to column/data structures
- `toMarkdownTable`: Converts column/data back to markdown string
- `parseMarkdownTable2D`/`generateMarkdownTable2D`: Lower-level 2D array utilities

### Build System
- **Extension**: TypeScript compiled to `out/` directory
- **Webview**: React app built with esbuild to `src/webview/main.js`
- **Styling**: SCSS modules with CSS modules support
- **Testing**: Jest with ts-jest, jsdom environment

### Communication Flow
1. Extension detects markdown tables and shows CodeLens "Edit Table" buttons
2. Commands open webview with initial markdown data via `window.__INIT_MARKDOWN__`
3. Webview sends messages back to extension for save operations
4. Extension applies edits to the original markdown document

### Key Files to Understand
- `src/extension.ts` - Extension activation, commands, webview management
- `src/webview/react/TableEditor.tsx` - Main React component
- `src/webview/react/utils/table.ts` - Markdown parsing/generation logic
- `esbuild.webview.mjs` - React build configuration
- `jest.config.js` - Test configuration