// src/extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { marked } from 'marked';

export function activate(context: vscode.ExtensionContext) {
  // TableEditCodeLensProviderの登録とイベントリスナーもactivate内にまとめる
  const tableEditProvider = new TableEditCodeLensProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ language: "markdown" }, tableEditProvider)
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(e => {
      if (e.document.languageId === 'markdown') {
        tableEditProvider.refresh();
      }
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(editor => {
      if (editor && editor.document.languageId === 'markdown') {
        tableEditProvider.refresh();
        setTimeout(() => {
          vscode.commands.executeCommand('editor.action.codeLensRefresh');
        }, 100);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => {
      if (doc.languageId === 'markdown') {
        tableEditProvider.refresh();
        setTimeout(() => {
          vscode.commands.executeCommand('editor.action.codeLensRefresh');
        }, 100);
      }
    })
  );

  // Add Table コマンド
  const addTable = vscode.commands.registerCommand('markdown-table-editor.addTable', () => {
    openTableEditorWebview('Add Table');
  });

  // Edit Table コマンド
  const editTable = vscode.commands.registerCommand('markdown-table-editor.editTable', (rangeArg?: { startLine: number, endLine: number }) => {
    openTableEditorWebview('Edit Table', rangeArg);
  });

  context.subscriptions.push(addTable, editTable);

  function openTableEditorWebview(title: string, rangeArg?: { startLine: number, endLine: number }) {
    const panel = vscode.window.createWebviewPanel(
      'markdownTableEditor',
      title,
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        localResourceRoots: [
          vscode.Uri.joinPath(context.extensionUri, 'src', 'webview')
        ]
      }
    );
    // Webview起動時点のエディタ情報を保存
    const initialEditor = vscode.window.activeTextEditor;
    const initialUri = initialEditor?.document.uri;
    const initialSelection = initialEditor?.selection;

    // テーブル範囲指定があればその部分を取得、なければ選択範囲
    let selectedText = '';
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      if (rangeArg && typeof rangeArg.startLine === 'number' && typeof rangeArg.endLine === 'number') {
        const start = new vscode.Position(rangeArg.startLine, 0);
        const end = new vscode.Position(rangeArg.endLine + 1, 0);
        const range = new vscode.Range(start, end);
        selectedText = editor.document.getText(range);
      } else {
        selectedText = editor.document.getText(editor.selection);
      }
    }

    // Webview初期化用のスクリプトを埋め込む
    // Webviewからのメッセージ受信
    panel.webview.onDidReceiveMessage(async (message) => {
      vscode.window.showInformationMessage('onDidReceiveMessage: ' + JSON.stringify(message));
      if (message.type === 'save' && message.markdown) {
        // 保存時点でWebview起動時のエディタ情報を利用
        if (initialUri && initialSelection) {
          const doc = await vscode.workspace.openTextDocument(initialUri);
          const edit = new vscode.WorkspaceEdit();
          let selection = initialSelection;
          // 選択範囲が空ならカーソル位置に挿入
          if (selection.isEmpty) {
            selection = new vscode.Selection(selection.start, selection.start);
          }
          edit.replace(initialUri, selection, message.markdown);
          const result = await vscode.workspace.applyEdit(edit);
          vscode.window.showInformationMessage(
            `applyEdit result: ${result}, uri: ${initialUri.fsPath}, selection: ${selection.start.line}:${selection.start.character}`
          );
        } else {
          vscode.window.showErrorMessage('保存時に編集対象のMarkdownドキュメント情報が取得できません');
        }
        panel.dispose();
      } else {
        vscode.window.showInformationMessage('onDidReceiveMessage (other): ' + JSON.stringify(message));
      }
    });

    panel.webview.html = injectInitScript(getWebviewContent(panel), selectedText);

    // Webviewへテストメッセージ送信
    setTimeout(() => {
      panel.webview.postMessage({ type: 'test', msg: 'from extension' });
    }, 1000);
  }

  // Webview HTMLに初期データ渡し用スクリプトを埋め込む
  function injectInitScript(html: string, selectedText: string): string {
    const script = `<script>window.__INIT_MARKDOWN__ = ${JSON.stringify(selectedText)};</script>`;
    return html.replace('</head>', `${script}\n</head>`);
  }

  function getWebviewContent(panel: vscode.WebviewPanel): string {
    // index.htmlの内容を読み込む
    const htmlPath = path.join(context.extensionPath, 'src', 'webview', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // main.jsのパスをWebview用に変換
    const scriptPathOnDisk = vscode.Uri.file(
      path.join(context.extensionPath, 'src', 'webview', 'main.js')
    );
    const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);

    // main.cssのパスをWebview用に変換
    const cssPathOnDisk = vscode.Uri.file(
      path.join(context.extensionPath, 'src', 'webview', 'main.css')
    );
    const cssUri = panel.webview.asWebviewUri(cssPathOnDisk);

    // index.html内のmain.jsパスを書き換え
    html = html.replace(
      /<script src="main\.js"><\/script>/,
      `<script src="${scriptUri}"></script>`
// デバッグ: CodeLensProviderの呼び出し状況を確認
    );

    // index.html内のmain.cssパスを書き換え
    html = html.replace(
      /<link rel="stylesheet" href="main\.css">/,
      `<link rel="stylesheet" href="${cssUri}">`
    );

    return html;
  }
}
// --- CodeLens Provider for Markdown Tables ---
class TableEditCodeLensProvider implements vscode.CodeLensProvider {
  private _onDidChangeCodeLenses = new vscode.EventEmitter<void>();
  readonly onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;

  provideCodeLenses(document: any): vscode.CodeLens[] {
    // デバッグ: CodeLensProviderの呼び出し状況を確認
    const codeLenses: vscode.CodeLens[] = [];
    const text = document.getText();

    // markedでパースしてテーブルノードを抽出
    const tokens = marked.lexer(text);

    let offset = 0;
    for (const token of tokens) {
      if (token.type === 'table') {
        // ヘッダー行のみで位置を特定（柔軟に対応）
        // header配列の内容を正規表現化して各行を走査
        // token.rawからheader行を抽出し、その行番号にCodeLensを表示
        if (typeof token.raw === 'string') {
          const lines = text.split('\n');
          const rawLines = token.raw.split('\n').map(l => l.trim());
          // header行はrawの最初の行
          const headerRaw = rawLines[0];
          // ドキュメント内でheaderRawに緩く一致する行を探す
          for (let i = 0; i < lines.length; i++) {
            // headerはToken[]なのでtextプロパティを使う
            const headerPattern = '^\\s*\\|?\\s*' +
              token.header.map((h: any) => escapeRegExp(h.text.trim()) + '\\s*').join('\\|\\s*') +
              '\\|?\\s*$';
            const headerRegex = new RegExp(headerPattern);
            if (headerRegex.test(lines[i])) {
              // セパレータ行（---）が次行にあるかも確認
              if (i + 1 < lines.length && /^\s*\|?(\s*:?-+:?\s*\|)+\s*$/.test(lines[i + 1])) {
                if (!codeLenses.some(lens => lens.range.start.line === i)) {
                  const range = new vscode.Range(i, 0, i, 0);
                  codeLenses.push(
                    new vscode.CodeLens(range, {
                      title: "Edit Table",
                      command: "markdown-table-editor.editTable",
                      arguments: [{ startLine: i, endLine: findTableEndLine(lines, i) }]
                    })
                  );
                }
                break; // 1テーブルにつき1つだけ
              }
            }
          }
        }
      }
    }
    return codeLenses;
  }


  refresh() {
    this._onDidChangeCodeLenses.fire();
  }
}

// 正規表現エスケープ関数
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function findTableEndLine(lines: string[], startLine: number): number {
  // テーブルの終端は空行または非テーブル行まで
  let end = startLine + 1;
  while (
    end < lines.length &&
    /^\s*\|.*\|\s*$/.test(lines[end])
  ) {
    end++;
  }
  return end - 1;
}

export function deactivate() {}