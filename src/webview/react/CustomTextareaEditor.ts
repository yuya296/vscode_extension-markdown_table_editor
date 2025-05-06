import { ICellEditorComp, ICellEditorParams } from "ag-grid-community";

export default class CustomTextareaEditor implements ICellEditorComp {
  private params!: ICellEditorParams;
  private eInput!: HTMLTextAreaElement;

  init(params: ICellEditorParams): void {
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

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && event.shiftKey) {
      event.stopPropagation();
      const textarea = event.target as HTMLTextAreaElement;
      const caret = textarea.selectionStart ?? 0;
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
      event.preventDefault();
      this.params.stopEditing && this.params.stopEditing();
    }
  }

  getGui(): HTMLElement {
    return this.eInput;
  }

  getValue(): any {
    return this.eInput.value;
  }

  afterGuiAttached(): void {
    this.eInput.focus();
    this.eInput.select();
  }
}