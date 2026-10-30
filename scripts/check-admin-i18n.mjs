import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { indonesian, errorAliases } from '../server/admin/translations.js';
import {
  t,
  setLanguage,
  getLanguage,
  locale,
  translateError,
} from '../server/admin/i18n.js';
const keys = new Set();
for (const file of ['server/admin/admin.js', 'server/admin/i18n.js']) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === 't' &&
      ts.isStringLiteral(node.arguments[0])
    )
      keys.add(node.arguments[0].text);
    ts.forEachChild(node, visit);
  }
  visit(source);
}
for (const file of [
  'server/admin/index.html',
  'server/admin/offline.html',
  'server/index.mjs',
]) {
  for (const match of readFileSync(file, 'utf8').matchAll(
    /data-i18n(?:-aria-label|-placeholder|-title)?="([^"]+)"/g,
  ))
    keys.add(match[1]);
}
for (const key of keys)
  assert.ok(
    Object.hasOwn(indonesian, key),
    `Missing Indonesian UI copy: ${key}`,
  );
for (const [key, value] of Object.entries(indonesian)) {
  assert.deepEqual(
    [...key.matchAll(/\{\d+\}/g)].map((m) => m[0]).sort(),
    [...value.matchAll(/\{\d+\}/g)].map((m) => m[0]).sort(),
    `Interpolation mismatch: ${key}`,
  );
}
// Every literal validation error from the existing operations handlers has a translation.
for (const file of ['server/operations.mjs', 'server/engagement.mjs']) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === 'fail' &&
      ts.isStringLiteral(node.arguments[1])
    ) {
      const key = node.arguments[1].text;
      if (!/[\u3400-\u9fff]/.test(key)) return;
      assert.ok(
        Object.hasOwn(indonesian, errorAliases[key] ?? key),
        `Missing validation translation: ${key}`,
      );
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
}
setLanguage('id');
assert.equal(locale(), 'id-ID');
assert.equal(t('保存'), 'Simpan');
assert.equal(t(' 页'), '');
assert.equal(t('{0} 至 {1} WIB', ['08:00', '09:00']), '08:00 hingga 09:00 WIB');
assert.equal(
  translateError('Email atau kata sandi salah.'),
  'Email atau kata sandi salah.',
);
assert.equal(translateError(''), '');
setLanguage('invalid');
assert.equal(getLanguage(), 'id');
setLanguage('zh-CN');
assert.equal(t('保存'), '保存');
assert.equal(
  translateError('Email atau kata sandi salah.'),
  '邮箱或密码错误。',
);
assert.equal(t('Customer-entered content'), 'Customer-entered content');
console.log(
  `Admin i18n passed: ${keys.size} UI keys, validation errors, placeholders, locale switching and fallback.`,
);
