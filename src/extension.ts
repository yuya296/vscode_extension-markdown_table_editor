// src/extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  // Add Table コマンド
  const addTable = vscode.commands.registerCommand('markdown-table-editor.addTable', () => {
    openTableEditorWebview('Add Table');
  });

  // Edit Table コマンド
  const editTable = vscode.commands.registerCommand('markdown-table-editor.editTable', () => {
    openTableEditorWebview('Edit Table');
  });

  context.subscriptions.push(addTable, editTable);

  function openTableEditorWebview(title: string) {
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

    // 選択範囲のテキストを取得（Add/Edit両方対応）
    let selectedText = '';
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      selectedText = editor.document.getText(editor.selection);
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

    // index.html内のmain.jsパスを書き換え
    html = html.replace(
      /<script src="main\.js"><\/script>/,
      `<script src="${scriptUri}"></script>`
    );

    return html;
  }
}

export function deactivate() {}