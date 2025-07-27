# CLAUDE.md

！！！必ず日本語で回答してください！！！

このファイルは、このリポジトリでコードを扱う際のClaude Code (claude.ai/code) へのガイダンスを提供します。

## コマンド

### ビルドと開発
- `npm run build` - フルビルド：TypeScript拡張機能をコンパイルし、Reactウェブビューを構築
- `npm run compile` - TypeScriptコンパイルのみ（拡張機能コード）
- `npm run watch` - TypeScriptコンパイルのウォッチモード
- `npm run build:webview` - Reactウェブビューのみをビルド（src/webview/main.jsに出力）
- `npm run watch:webview` - Reactウェブビュービルドのウォッチモード
- `npm run dev` - 拡張機能とウェブビューの同時ウォッチモード

### テスト
- `npm test` - Jestテストを実行
- `npm run pretest` - テスト実行前にTypeScriptをコンパイル
- テストファイルは `src/webview/react/hooks/__tests__/` および `src/webview/react/utils/__tests__/` に配置

### VSCode拡張機能開発
- VSCodeで「拡張機能の実行」または「拡張機能のデバッグ」を使用して拡張機能をテスト
- 拡張機能はMarkdownファイルまたはコマンド実行時にアクティブ化
- メイン拡張機能エントリーポイント: `src/extension.ts`

## アーキテクチャ

### VSCode拡張機能構造
これは、ExcelライクなReact UIでMarkdownテーブルを編集するVSCode拡張機能です。拡張機能は以下で構成されています：

1. **拡張機能ホスト (src/extension.ts)**
   - コマンド登録: `markdown-table-editor.addTable` および `markdown-table-editor.editTable`
   - ウェブビューのライフサイクルと通信を管理
   - エディター内「Edit Table」ボタンのためのCodeLensプロバイダーを実装
   - `marked`ライブラリを使用してMarkdownテーブル検出を処理

2. **Reactウェブビュー (src/webview/react/)**
   - React 18とjspreadsheet-ceでテーブル編集を構築
   - エントリーポイント: `src/webview/react/index.tsx`
   - メインコンポーネント: `TableEditor.tsx`
   - SCSSモジュールサポートのesbuildで構築

### 主要コンポーネント

#### TableEditor (src/webview/react/TableEditor.tsx)
- テーブル編集を統括するメインReactコンポーネント
- 状態管理：Markdownテキスト、変更ステータス、undo/redo
- VSCodeウェブビュー通信を処理
- 機能性のための複数のカスタムフックを統合

#### カスタムフック
- `useTableData`: Markdownをカラム/データに解析、デフォルト3x3テーブルを提供
- `useTableEditorHandlers`: 行/列の追加、削除、ラッピングを処理
- `useTableSave`: 保存操作とVSCode通信を管理
- `useSimpleUndoRedo`: 履歴スタックによるundo/redo機能を実装

#### ユーティリティ関数 (src/webview/react/utils/table.ts)
- `parseMarkdownTable`: Markdown文字列をカラム/データ構造に変換
- `toMarkdownTable`: カラム/データをMarkdown文字列に変換
- `parseMarkdownTable2D`/`generateMarkdownTable2D`: 低レベル2次元配列ユーティリティ

### ビルドシステム
- **拡張機能**: TypeScriptを`out/`ディレクトリにコンパイル
- **ウェブビュー**: esbuildで`src/webview/main.js`にReactアプリを構築
- **スタイリング**: CSSモジュールサポート付きSCSSモジュール
- **テスト**: ts-jest、jsdom環境でのJest

### 通信フロー
1. 拡張機能がMarkdownテーブルを検出し、CodeLens「Edit Table」ボタンを表示
2. コマンドが`window.__INIT_MARKDOWN__`経由で初期Markdownデータとウェブビューを開く
3. ウェブビューが保存操作のためのメッセージを拡張機能に送信
4. 拡張機能が元のMarkdownドキュメントに編集を適用

### 理解すべき主要ファイル
- `src/extension.ts` - 拡張機能アクティベーション、コマンド、ウェブビュー管理
- `src/webview/react/TableEditor.tsx` - メインReactコンポーネント
- `src/webview/react/utils/table.ts` - Markdown解析/生成ロジック
- `esbuild.webview.mjs` - Reactビルド設定
- `jest.config.js` - テスト設定

## スタイリングとテーマ統合

### VSCodeテーマサポート
- VSCodeテーマ統合のためのCSSカスタムプロパティを使用
- 一貫したテーマ設定のためのSCSS変数定義
- ライトテーマとダークテーマの両方を自動サポート

### jspreadsheet-ceスタイリング
- `TableEditor.module.scss`でのカスタムCSSオーバーライド
- 編集モード（textarea/inputフィールド）の適切なスタイリング
- VSCode一貫の選択とフォーカス状態

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
- [x] useSimpleUndoRedo.test.ts - Undo/Redo状態管理
- [x] より詳細なエッジケーステスト

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

## 開発ノート

### 現在の実装状況
- ✅ jspreadsheet-ceによる基本的なテーブル編集
- ✅ Markdown解析と生成
- ✅ VSCodeテーマ統合
- ✅ Undo/Redo機能（簡易版）
- ✅ 保存操作
- ⚠️ ボタン機能の簡素化（Undo/Redoのみアクティブ）

### 既知の問題とTODO
- jspreadsheetの組み込み機能を超えた完全なundo/redo実装の検討
- 不正なMarkdownのエラー処理改善
- より包括的なキーボードショートカットの追加
- アクセシビリティ機能の強化

### コードスタイルガイドライン
- TypeScript strict モードを使用
- フックを使った関数コンポーネントを優先
- スタイリングにはSCSSモジュールを使用
- VSCode拡張機能のベストプラクティスに従う
- 新機能にはテストを記述

## Claudeへの重要な注意事項

1. **言語**: 指定通り常に日本語で回答
2. **コード品質**: 既存のパターンと規約を維持
3. **テスト**: 変更時にはテストへの影響を考慮
4. **VSCode統合**: 変更がVSCodeテーマとAPIで動作することを確認
5. **パフォーマンス**: 大きなテーブルでのウェブビューパフォーマンスに注意