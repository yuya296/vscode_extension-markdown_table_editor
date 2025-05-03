# Markdown Table Editor

VSCode上でMarkdownテーブルをExcelライクなUIで直感的に編集できる拡張機能です。

## 主な機能

- コマンドパレット/右クリックメニューから「Add Table」「Edit Table」で編集画面を起動
- 行・列の追加/削除、Undo/Redo、セル編集
- 編集内容をMarkdownテーブルとして即時反映（今後実装予定）

| 機能             | 説明                                         |
|------------------|----------------------------------------------|
| Add Table        | 新規テーブルを挿入し編集UIを起動             |
| Edit Table       | 既存テーブルを編集UIで編集                   |
| 行・列追加/削除  | テーブルの行や列を追加・削除                 |
| Undo/Redo        | 編集操作の取り消し・やり直し                 |
| セル編集         | セル内容を直接編集                           |
| 保存             | 編集内容をMarkdownに反映（今後実装予定）     |

## インストール

1. このリポジトリをクローン
2. `npm install`
3. `npm run build` でフロントエンドと拡張機能を一度にビルド
4. VSCodeで「Run Extension」または「拡張機能のデバッグ」を実行

### 開発

- `src/webview/react/`配下がReactアプリです。
- `npm run dev` で拡張機能とReactフロントエンドを同時に監視・自動ビルドできます。
- `npm run watch:webview` でReact部分のみを自動ビルドできます（src/webview/main.jsに出力）。
- `npm run watch` で拡張機能バックエンド(TypeScript)部分のみを自動ビルドできます。
- main.jsはReactビルド成果物です。直接編集しないでください。

## 使い方

1. Markdownファイルを開く
2. コマンドパレット（Ctrl+Shift+P）で「Add Table」または「Edit Table」を実行
3. Webviewでテーブル編集UIが表示される
4. 編集後「保存」ボタンで反映（現状はダイアログのみ）

## 今後の予定

- Markdownテーブル⇔2次元配列変換ロジックの実装
- 編集内容のエディタ反映
- セル結合/分割、コピー/貼り付け、プレビュー機能
- CSVインポート/エクスポート、GFM拡張対応

---