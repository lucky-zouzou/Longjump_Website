import { mkdirSync, copyFileSync, readdirSync, statSync, rmSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { openDatabase, dbPath } from './storage.mjs';

// Checkpoints the WAL and copies the database file for the current day.
// Safe while the server runs; the first call per day wins.
export function createBackup(db, dir) {
  const day = new Date().toISOString().slice(0, 10);
  const target = join(resolve(dir), `LOONGJUMP-${day}.sqlite`);
  if (existsSync(target)) return target;
  mkdirSync(resolve(dir), { recursive: true, mode: 0o700 });
  db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  copyFileSync(dbPath(), target);
  return target;
}

export function verifyBackup(path) {
  const db = openDatabase(resolve(path), { migrations: false });
  try {
    const check = db.sqlite.prepare('PRAGMA integrity_check').get();
    return check?.integrity_check === 'ok';
  } finally {
    db.sqlite.close();
  }
}

export function scheduleBackups(env, dir) {
  let last = '', running = false;
  const run = async () => {
    const day = new Date().toISOString().slice(0, 10);
    if (running || day === last) return;
    running = true;
    try {
      const path = createBackup(env.DB.sqlite, dir);
      last = day;
      for (const n of readdirSync(dir)) if (/^LOONGJUMP-\d{4}-\d{2}-\d{2}\.sqlite$/.test(n) && Date.now() - statSync(join(dir, n)).mtimeMs > Number(process.env.LOONGJUMP_BACKUP_RETENTION_DAYS || 30) * 86400000) rmSync(join(dir, n));
      console.log(`Daily backup verified: ${path}`);
    } catch (e) {
      console.error('Daily backup FAILED:', e.message);
    } finally {
      running = false;
    }
  };
  void run();
  const timer = setInterval(run, 60000);
  timer.unref();
  return timer;
}
