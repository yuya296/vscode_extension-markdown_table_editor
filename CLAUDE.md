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
- `useSimpleUndoRedo`: Implements undo/redo functionality with history stack

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

## Styling and Theme Integration

### VSCode Theme Support
- Uses CSS custom properties for VSCode theme integration
- SCSS variables defined for consistent theming
- Supports both light and dark themes automatically

### jspreadsheet-ce Styling
- Custom CSS overrides in `TableEditor.module.scss`
- Proper styling for editing mode (textarea/input fields)
- VSCode-consistent selection and focus states

## Testing Strategy

### 現状分析
- Jest + ts-jest + @testing-library/react環境が設定済み
- 既存テスト: ユーティリティ関数（table.ts）とカスタムフック（useTableData等）
- テストカバレッジはまだ限定的

### テスト戦略レベル

#### 1. 単体テスト（Unit Tests）
**既存: 一部実装済み**
- ✅ ユーティリティ関数（src/webview/react/utils/__tests__/）
- ✅ カスタムフック（src/webview/react/hooks/__tests__/）

**追加すべきもの:**
- [ ] useSimpleUndoRedo.test.ts - Undo/Redo状態管理
- [ ] より詳細なエッジケーステスト

#### 2. コンポーネント統合テスト（Component Integration Tests）
**新規作成が必要:**
- [ ] TableEditorButtons.test.tsx - ボタンクリック、状態変化
- [ ] TableBody.test.tsx - jspreadsheet統合、セル編集
- [ ] TableEditor.test.tsx - 全体統合、データフロー

#### 3. E2Eテスト（End-to-End Tests）
**新規作成が必要:**
- [ ] VSCode拡張機能レベルのテスト
- [ ] ウェブビュー統合テスト

### 優先度付きテスト実装計画

#### Phase 1: 不足している単体テスト（高優先度）
1. **useSimpleUndoRedo** - 現在テストが存在しない重要フック
2. **table.ts** - エッジケース強化（多言語文字、特殊文字等）

#### Phase 2: Reactコンポーネントテスト（中優先度）
1. **TableEditorButtons** - アイコンボタンのクリック、無効状態
2. **TableEditor** - 初期化、データ変更、キーボードショートカット
3. **TableBody** - jspreadsheetとの統合（モック使用）

#### Phase 3: 統合テスト（中優先度）
1. **マークダウン⇔テーブルデータ変換の完全フロー**
2. **Undo/Redo機能の統合動作**
3. **VSCodeメッセージング（モック）**

#### Phase 4: E2Eテスト（低優先度）
1. **VSCode拡張機能としての動作**
2. **実際のマークダウンファイル編集**

### 技術的考慮事項

#### テスト環境設定
- **jspreadsheet-ce** のモック化が必要
- **VSCode API** のモック化
- **CSS Modules** の処理（既に設定済み）

#### 追加必要ライブラリ
- `@testing-library/user-event` - ユーザーインタラクション
- `jest-canvas-mock` - Canvas API mock（jspreadsheet用）

#### テストヘルパー
- VSCode API モック関数
- jspreadsheet-ce モック
- カスタムレンダー関数（テーマプロバイダー等）

### 現在のテスト構成

#### 既存テストファイル
```
src/webview/react/
├── hooks/__tests__/
│   ├── useClipboard.test.ts
│   ├── useTableData.test.ts
│   ├── useTableEditorHandlers.test.ts
│   └── useTableSave.test.ts
└── utils/__tests__/
    └── table.test.ts
```

#### Jest設定
- **testEnvironment**: jsdom（React Testing Library用）
- **transform**: ts-jest（TypeScript対応）
- **moduleNameMapper**: CSS/SCSSファイルのモック

#### 推奨テストパターン
```typescript
// 単体テスト例
describe('useSimpleUndoRedo', () => {
  it('初期状態ではundoが無効でredoも無効', () => {
    const { result } = renderHook(() => useSimpleUndoRedo());
    expect(result.current.canUndo).toBe(true); // 暫定実装
    expect(result.current.canRedo).toBe(false);
  });
});

// コンポーネントテスト例
describe('TableEditorButtons', () => {
  it('ボタンクリック時に適切なハンドラーが呼ばれる', () => {
    const mockSave = jest.fn();
    render(<TableEditorButtons onSave={mockSave} isModified={true} />);
    fireEvent.click(screen.getByText('Save'));
    expect(mockSave).toHaveBeenCalled();
  });
});
```

## Development Notes

### Current Implementation Status
- ✅ Basic table editing with jspreadsheet-ce
- ✅ Markdown parsing and generation
- ✅ VSCode theme integration
- ✅ Undo/Redo functionality (simplified)
- ✅ Save operations
- ⚠️ Button functionality simplified (only Undo/Redo active)

### Known Issues and TODOs
- Consider full undo/redo implementation beyond jspreadsheet's built-in
- Improve error handling for malformed markdown
- Add more comprehensive keyboard shortcuts
- Enhance accessibility features

### Code Style Guidelines
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use SCSS modules for styling
- Follow VSCode extension best practices
- Write tests for new functionality

## Important Notes for Claude

1. **Language**: Always respond in Japanese as specified
2. **Code Quality**: Maintain existing patterns and conventions
3. **Testing**: Consider test implications when making changes
4. **VSCode Integration**: Ensure changes work with VSCode theming and APIs
5. **Performance**: Be mindful of webview performance with large tables