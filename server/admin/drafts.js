// Drafts stay in memory only. File inputs are moved intact to retain their FileList.
export function captureDrafts(root) {
  const controls = [...root.querySelectorAll('input,select,textarea')].filter(
    (el) => !el.matches('[data-language-switch]'),
  );
  const key = (el) =>
    `${el.closest('form')?.dataset.form || el.closest('form')?.id || ''}:${el.name || el.id}`;
  return {
    controls: controls.map((el) => ({
      key: key(el),
      value: el.value,
      checked: el.checked,
      file: el.type === 'file' ? el : null,
      focused: el === document.activeElement,
      start: el.selectionStart,
      end: el.selectionEnd,
    })),
    messages: [...root.querySelectorAll('.form-error,#upload-status')].map(
      (el) => ({
        form: el.closest('form')?.dataset.form,
        id: el.id,
        text: el.textContent,
      }),
    ),
    scroll: root.scrollTop,
  };
}
export function restoreDrafts(root, draft, translate) {
  const controls = [...root.querySelectorAll('input,select,textarea')];
  for (const saved of draft.controls) {
    let el = controls.find(
      (el) =>
        `${el.closest('form')?.dataset.form || el.closest('form')?.id || ''}:${el.name || el.id}` ===
        saved.key,
    );
    if (!el) continue;
    if (saved.file) {
      el.replaceWith(saved.file);
      el = saved.file;
    } else {
      el.value = saved.value;
      if (el.type === 'checkbox' || el.type === 'radio')
        el.checked = saved.checked;
    }
    if (saved.focused) {
      el.focus({ preventScroll: true });
      if (saved.start != null && el.setSelectionRange)
        el.setSelectionRange(saved.start, saved.end);
    }
  }
  for (const saved of draft.messages) {
    const el = [...root.querySelectorAll('.form-error,#upload-status')].find(
      (el) =>
        el.id === saved.id && el.closest('form')?.dataset.form === saved.form,
    );
    if (el) el.textContent = translate(saved.text);
  }
  root.scrollTop = draft.scroll;
}
