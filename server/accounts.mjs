import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';

export const hashToken = s => createHash('sha256').update(s).digest('hex');

export function accountSchema(db) {
  db.exec("CREATE TABLE IF NOT EXISTS local_accounts (user_id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, name TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL); CREATE TABLE IF NOT EXISTS local_sessions (token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL,expires_at INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS local_login_attempts (key TEXT PRIMARY KEY,attempts INTEGER NOT NULL,window_start INTEGER NOT NULL)");
}

export function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 12 || password.length > 256) throw Error('Password must be 12–256 characters');
  const salt = randomBytes(16).toString('hex');
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || '').split(':');
  if (scheme !== 'scrypt' || !salt || !hash || String(password).length > 256) return false;
  const a = scryptSync(String(password), salt, 64), b = Buffer.from(hash, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export function setAccount(db, { id, email, name = 'Sales Admin', password }) {
  if (!id || !email?.includes('@') || !name) throw Error('Account id, email and name required');
  const now = new Date().toISOString(), hash = hashPassword(password);
  accountSchema(db);
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('INSERT INTO local_accounts (user_id,email,password_hash,name,updated_at) VALUES (?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET email=excluded.email,password_hash=excluded.password_hash,name=excluded.name,updated_at=excluded.updated_at').run(id, email.toLowerCase(), hash, name, now);
    db.prepare('DELETE FROM local_sessions WHERE user_id=?').run(id);
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
