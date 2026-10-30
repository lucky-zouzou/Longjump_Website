import { indonesian, errorAliases } from './translations.js';
const STORAGE_KEY = 'loongjump-admin-language';
let language = 'zh-CN';
try {
  if (globalThis.localStorage?.getItem(STORAGE_KEY) === 'id') language = 'id';
} catch {
  /* Storage can be disabled by the browser. */
}
export const getLanguage = () => language;
export const locale = () => (language === 'id' ? 'id-ID' : 'zh-CN');
export function setLanguage(value) {
  if (!['zh-CN', 'id'].includes(value)) return;
  language = value;
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, value);
  } catch {
    /* Keep the session preference. */
  }
}
export function t(key, values = []) {
  const text = language === 'id' ? (indonesian[key] ?? key) : key;
  return text.replace(/\{(\d+)\}/g, (match, index) =>
    String(values[index] ?? match),
  );
}
const reverse = new Map(
  Object.entries(indonesian)
    .filter(([, value]) => value)
    .map(([key, value]) => [value, key]),
);
export function translateError(message) {
  if (!message) return '';
  return t(
    errorAliases[message] ??
      reverse.get(message) ??
      String(message || '操作失败，请重试'),
  );
}
export function translateStatic(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]'))
    el.textContent = t(el.dataset.i18n);
  for (const attribute of ['placeholder', 'aria-label', 'title']) {
    for (const el of root.querySelectorAll(`[data-i18n-${attribute}]`))
      el.setAttribute(attribute, t(el.getAttribute(`data-i18n-${attribute}`)));
  }
  for (const el of root.querySelectorAll('[data-i18n-error]'))
    el.textContent = translateError(el.textContent);
  for (const el of root.querySelectorAll('[data-language-switch]'))
    el.value = language;
  if (root.documentElement) root.documentElement.lang = language;
}
export function languageSelector() {
  return `<label class="language-control"><span data-i18n="界面语言">${t('界面语言')}</span><select data-language-switch aria-label="${t('界面语言')}" data-i18n-aria-label="界面语言"><option value="zh-CN" ${language === 'zh-CN' ? 'selected' : ''}>中文</option><option value="id" ${language === 'id' ? 'selected' : ''}>Bahasa Indonesia</option></select></label>`;
}
