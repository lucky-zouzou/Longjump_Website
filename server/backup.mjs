import {
  mkdirSync,
  readdirSync,
  statSync,
  rmSync,
  existsSync,
  renameSync,
  cpSync,
  chmodSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import { openDatabase, dataRoot } from './storage.mjs';
import { randomUUID } from 'node:crypto';

// VACUUM INTO produces a transactionally consistent snapshot, including WAL
// writes. Uploaded media is immutable and copied into a shared backup folder.
export function createBackup(db, dir, mediaRoot = join(dataRoot, 'media')) {
  const day = new Date().toISOString().slice(0, 10);
  const target = join(resolve(dir), `LOONGJUMP-${day}.sqlite`);
  if (existsSync(target)) {
    if (!verifyBackup(target)) throw Error('Existing backup failed integrity check');
    return target;
  }
  mkdirSync(resolve(dir), { recursive: true, mode: 0o700 });
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    db.prepare('VACUUM INTO ?').run(temporary);
    chmodSync(temporary, 0o600);
    if (!verifyBackup(temporary)) throw Error('Backup integrity check failed');
    const media = mediaRoot;
    if (existsSync(media))
      cpSync(media, join(resolve(dir), 'media'), {
        recursive: true,
        force: false,
        errorOnExist: false,
      });
    renameSync(temporary, target);
  } finally {
    if (existsSync(temporary)) rmSync(temporary);
  }
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
  let last = '',
    running = false;
  const run = async () => {
    const day = new Date().toISOString().slice(0, 10);
    if (running || day === last) return;
    running = true;
    try {
      const path = createBackup(env.DB.sqlite, dir);
      last = day;
      for (const n of readdirSync(dir))
        if (
          /^LOONGJUMP-\d{4}-\d{2}-\d{2}\.sqlite$/.test(n) &&
          Date.now() - statSync(join(dir, n)).mtimeMs >
            Number(process.env.LOONGJUMP_BACKUP_RETENTION_DAYS || 30) * 86400000
        )
          rmSync(join(dir, n));
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
