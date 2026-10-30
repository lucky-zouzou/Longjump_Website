import { setLanguage, translateStatic } from './i18n.js';
translateStatic();
document.addEventListener('change', (event) => {
  if (!event.target.matches('[data-language-switch]')) return;
  setLanguage(event.target.value);
  translateStatic();
});
