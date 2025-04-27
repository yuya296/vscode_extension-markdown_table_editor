// src/webview/main.js

if (!window.vscode) {
  if (typeof acquireVsCodeApi === 'function') {
    window.vscode = acquireVsCodeApi();
  }
}
const root = document.getElementById('table-editor-root');

// 初期テーブルデータ
let tableData;

// 選択範囲から初期データ反映
console.log('INIT_MARKDOWN:', window.__INIT_MARKDOWN__);
if (window.__INIT_MARKDOWN__ && typeof window.__INIT_MARKDOWN__ === 'string' && window.__INIT_MARKDOWN__.trim()) {
  const parsed = parseMarkdownTable(window.__INIT_MARKDOWN__);
  console.log('PARSED_TABLE:', parsed);
  if (parsed && parsed.length > 0) {
    tableData = parsed;
  } else {
    tableData = [['Header1', 'Header2'], ['Cell1', 'Cell2']];
  }
} else {
  // 空範囲なら空テーブル
  tableData = [['', ''], ['', '']];
}

// Markdownテーブル→2次元配列
function parseMarkdownTable(md) {
  const lines = md.trim().split('\n').filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return [];
  const rows = lines.map(line =>
    line
      .replace(/^\s*\|/, '')
      .replace(/\|\s*$/, '')
      .split('|')
      .map(cell => cell.trim())
  );
  // 2行目が---区切りなら除外
  if (rows.length > 1 && rows[1].every(cell => /^-+$/.test(cell))) {
    rows.splice(1, 1);
  }
  return rows;
}

let history = [];
let historyIndex = -1;

function renderTable() {
  root.innerHTML = '';
  const table = document.createElement('table');
  tableData.forEach((row, rowIdx) => {
    const tr = document.createElement('tr');
    row.forEach((cell, colIdx) => {
      const td = document.createElement(rowIdx === 0 ? 'th' : 'td');
      td.contentEditable = true;
      td.innerText = cell;
      td.addEventListener('input', (e) => {
        tableData[rowIdx][colIdx] = td.innerText;
        saveHistory();
      });
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
  root.appendChild(table);
}

function saveHistory() {
  history = history.slice(0, historyIndex + 1);
  history.push(JSON.stringify(tableData));
  historyIndex++;
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--;
    tableData = JSON.parse(history[historyIndex]);
    renderTable();
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    tableData = JSON.parse(history[historyIndex]);
    renderTable();
  }
}

document.getElementById('add-row').onclick = () => {
  const cols = tableData[0].length;
  tableData.push(Array(cols).fill(''));
  saveHistory();
  renderTable();
};
document.getElementById('add-col').onclick = () => {
  tableData.forEach(row => row.push(''));
  saveHistory();
  renderTable();
};
document.getElementById('del-row').onclick = () => {
  if (tableData.length > 2) {
    tableData.pop();
    saveHistory();
    renderTable();
  }
};
document.getElementById('del-col').onclick = () => {
  if (tableData[0].length > 1) {
    tableData.forEach(row => row.pop());
    saveHistory();
    renderTable();
  }
};
document.getElementById('undo').onclick = undo;
document.getElementById('redo').onclick = redo;
document.getElementById('save').onclick = () => {
  // VSCode連携
  const markdown = tableToMarkdown(tableData);
  if (window.vscode) {
    console.log('postMessage: save', markdown);
    window.vscode.postMessage({ type: 'save', markdown });
  } else {
    alert('保存（VSCode連携が未検出）\n\n' + markdown);
  }
};

// VSCode API連携用
if (!window.vscode) {
  if (typeof acquireVsCodeApi === 'function') {
    window.vscode = acquireVsCodeApi();
  }
}

// 2次元配列→Markdownテーブル変換
function tableToMarkdown(data) {
  if (!data || !data.length) return '';
  const header = '| ' + data[0].join(' | ') + ' |';
  const sep = '| ' + data[0].map(() => '---').join(' | ') + ' |';
  const rows = data.slice(1).map(row => '| ' + row.join(' | ') + ' |');
  return [header, sep, ...rows].join('\n');
}

// 初期化
saveHistory();
renderTable();

// ExtensionからのpostMessage受信テスト
window.addEventListener('message', (event) => {
  console.log('Webview received message:', event.data);
});