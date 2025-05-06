export default class CustomTextareaEditor {
  init(params) {
    this.params = params;
    this.eInput = document.createElement('textarea');
    this.eInput.value = params.value || '';
    this.eInput.style.width = '100%';
    this.eInput.style.height = '100%';
    this.eInput.style.resize = 'vertical';
    this.eInput.style.whiteSpace = 'pre-wrap';
    this.eInput.style.wordBreak = 'break-word';
    this.eInput.addEventListener('keydown', this.onKeyDown.bind(this));
    setTimeout(() => this.eInput.focus(), 0);
  }

  onKeyDown(event) {
    if (event.key === 'Enter' && event.shiftKey) {
      // Shift+Enterで改行を挿入し、イベント伝播を止める
      event.stopPropagation();
      const textarea = event.target;
      const caret = textarea.selectionStart;
      const val = textarea.value;
      textarea.value = val.slice(0, caret) + '\n' + val.slice(caret);
      textarea.selectionStart = textarea.selectionEnd = caret + 1;
    } else if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey
    ) {
      // Enter単体で編集確定
      event.preventDefault();
      this.params.stopEditing();
    }
  }

  getGui() {
    return this.eInput;
  }

  getValue() {
    return this.eInput.value;
  }

  afterGuiAttached() {
    this.eInput.focus();
    this.eInput.select();
  }
}