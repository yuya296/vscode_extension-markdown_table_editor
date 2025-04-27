## 手順概要

VS Code拡張機能の開発手順は以下の通りです。

1. プロジェクト作成（yoコマンドで雛形生成）
2. コマンド内容を実装（JS/TSで処理を記述）
3. コマンドの呼び出し方法を定義（package.json編集）
4. 動作確認（VS Codeデバッガー使用）
5. 拡張機能として利用可能にする（vsixファイル作成・インポート）

※ここでは自分用のExtension作成手順を説明します。マーケットプレイス公開手順は割愛します。

## 手順

### 1. プロジェクト作成

[Yeoman（yo）](https://www.npmjs.com/package/yo)を使うと簡単にプロジェクトを作成できます。  
まず[generator-code](https://www.npmjs.com/package/generator-code)をグローバルインストールします。

```sh
npm install -g generator-code
```

`yo code`を実行すると、対話形式でプロジェクト作成が始まります。

```sh
npx yo code
```

主な選択項目：

- 開発言語（JavaScript/TypeScript）
- Extension名
- ExtensionID（Extension名と同じでOK）
- Extensionの説明（任意）
- Git初期化
- Webpack利用有無
- パッケージマネージャー（npm/yarn）

実行後、指定したエクステンション名のディレクトリが作成されます。  
![](https://www.evernote.com/l/APcsRNNugydJ-ImxyHCo8b-Qz8DTt9X8aZwB/image.png)

### 2. コマンド内容を実装

VS Code拡張の本体は**コマンド**です。  
コマンドの処理内容は`extension.ts`に記述します。  
初期状態の例：

```typescript
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'vs-devio-opener.helloWorld',
    () => {
      vscode.window.showInformationMessage('Hello World from vs-devio-opener!');
    }
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
```

`vscode.window.showInformationMessage()`でメッセージ表示、  
`vscode.commands.registerCommand`でコマンド登録を行います。  
VS Code APIの詳細は[公式ドキュメント](https://code.visualstudio.com/api/references/vscode-api)参照。

### 3. コマンドの呼び出し方法を定義

`package.json`でコマンドの呼び出し方法を定義します。

```json
{
  "activationEvents": [
    "onCommand:vs-devio-opener.helloWorld"
  ],
  // ...省略...
  "contributes": {
    "commands": [
      {
        "command": "vs-devio-opener.helloWorld",
        "title": "Hello World"
      }
    ]
  }
}
```

- `activationEvents`：どのイベントで拡張機能を有効化するか
- `contributes.commands`：コマンドのUI表示名など

さらに`contributes.menus`を追加すると、エディタのコンテキストメニュー等にもコマンドを表示できます。

```json
"contributes": {
  "commands": [
    {
      "command": "vscode-context.openDevio",
      "title": "Open DevIO"
    }
  ],
  "menus": {
    "editor/context": [
      {
        "when": "editorFocus",
        "command": "vscode-context.openDevio",
        "group": "myGroup@1"
      }
    ]
  }
}
```

詳細は[contributes.menus公式](https://code.visualstudio.com/api/references/contribution-points#contributes.menus)参照。

### 4. 動作確認

VS Codeのデバッガーで動作確認できます。  
[Run Extension]をクリックし、別ウィンドウでコマンドを実行します。

![](https://www.evernote.com/l/APeE7v8qouhKrar2JFopd262PBSCAEsuuCQB/image.png)

コマンドパレットやコンテキストメニューからコマンドを呼び出し、通知欄にメッセージが表示されればOKです。

### 5. 拡張機能として利用可能にする

READMEを編集後、[vsce](https://www.npmjs.com/package/vsce)でパッケージ化します。

```sh
npx vsce package
```

生成されたvsixファイルをVS Codeの[Install from VSIX]で読み込めば、拡張機能として利用できます。

![](https://www.evernote.com/l/APdAoHPcHAFOt4zR_Y02rTjvEp1ZOYkXlEYB/image.png)

### 補足：拡張機能の公開

公開もvsceコマンドで可能です。詳細は[公式ガイド](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)参照。

## おわりに

VS Code拡張機能の開発手順をまとめました。  
自分だけのExtensionで開発効率を高めましょう。