import { readFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { openDatabase } from './storage.mjs';
import { setAccount } from './accounts.mjs';
import { createBackup, verifyBackup } from './backup.mjs';

const [command, ...args] = process.argv.slice(2), opts = {};
for (let i = 0; i < args.length; i += 2) {
  if (!args[i].startsWith('--') || !args[i + 1]) throw Error('Options require --name value');
  opts[args[i].slice(2)] = args[i + 1];
}

try {
  if (command === 'account:add') {
    const password = process.env.LOONGJUMP_ACCOUNT_PASSWORD_FILE ? readFileSync(process.env.LOONGJUMP_ACCOUNT_PASSWORD_FILE, 'utf8').trim() : readFileSync(0, 'utf8').trim();
    const db = openDatabase();
    setAccount(db.sqlite, { ...opts, password });
    db.sqlite.close();
    console.log('Sales account saved; existing sessions revoked.');
  } else if (command === 'backup') {
    const db = openDatabase();
    try { console.log(createBackup(db.sqlite, opts.output || 'backups')); } finally { db.sqlite.close(); }
  } else if (command === 'verify') {
    if (!opts.input) throw Error('Required: --input backup.sqlite');
    console.log(JSON.stringify({ verified: verifyBackup(opts.input) }));
  } else if (command === 'restore') {
    if (!opts.input || !opts.target) throw Error('Required: --input backup.sqlite --target DATA_DIR');
    if (!verifyBackup(opts.input)) throw Error('Backup failed verification');
    const target = resolve(opts.target, 'inquiries.sqlite');
    if (existsSync(target)) throw Error(`Refusing to overwrite ${target}; stop the server and move the current file away first.`);
    mkdirSync(dirname(target), { recursive: true, mode: 0o700 });
    copyFileSync(resolve(opts.input), target);
    console.log(`Restored to ${target}. Restart the server to use it.`);
  } else throw Error('Commands: account:add (--id --email --name, password via stdin or LOONGJUMP_ACCOUNT_PASSWORD_FILE), backup --output DIR, verify --input FILE, restore --input FILE --target DATA_DIR');
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
