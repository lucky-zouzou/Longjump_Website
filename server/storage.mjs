import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';

export const dataRoot = resolve(process.env.LOONGJUMP_DATA_DIR || './data');
export const dbPath = () => resolve(process.env.LOONGJUMP_DB_PATH || resolve(dataRoot, 'inquiries.sqlite'));

// Applies drizzle/*.sql idempotently, tracked in a local_migrations table with
// per-file sha256 so an already-applied migration that later changes is caught.
export function migrate(sqlite, migrationDir = resolve('drizzle')) {
  sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=10000; PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS local_migrations(name TEXT PRIMARY KEY,sha256 TEXT NOT NULL,applied_at TEXT NOT NULL)');
  for (const name of readdirSync(migrationDir).filter(n => n.endsWith('.sql')).sort()) {
    const source = readFileSync(resolve(migrationDir, name), 'utf8'), hash = createHash('sha256').update(source).digest('hex'), done = sqlite.prepare('SELECT sha256 FROM local_migrations WHERE name=?').get(name);
    if (done) {
      if (done.sha256 !== hash) throw Error(`Applied migration changed: ${name}`);
      continue;
    }
    sqlite.exec('BEGIN IMMEDIATE');
    try {
      sqlite.exec(source);
      sqlite.prepare('INSERT INTO local_migrations VALUES (?,?,?)').run(name, hash, new Date().toISOString());
      sqlite.exec('COMMIT');
    } catch (e) {
      sqlite.exec('ROLLBACK');
      throw e;
    }
  }
}

// Opens a SQLite database behind a D1-compatible API so route code written for
// Cloudflare D1 (prepare/bind/run/first/all/batch) keeps working unchanged.
export function openDatabase(path = dbPath(), { migrations = true } = {}) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const sqlite = new DatabaseSync(path);
  if (migrations) migrate(sqlite);
  sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=10000');
  class Statement {
    constructor(sql, args = []) { this.sql = sql; this.args = args; }
    bind(...args) { return new Statement(this.sql, args); }
    execute() {
      const s = sqlite.prepare(this.sql);
      if (s.columns().length) return { results: s.all(...this.args), success: true, meta: { changes: 0 } };
      const r = s.run(...this.args);
      return { results: [], success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    }
    async first(column) { const r = this.execute().results[0]; return column ? r?.[column] ?? null : r ?? null; }
    async all() { return this.execute(); }
    async run() { return this.execute(); }
    async raw() { return this.execute().results.map(Object.values); }
  }
  return {
    sqlite,
    prepare: sql => new Statement(sql),
    async batch(statements) {
      sqlite.exec('BEGIN IMMEDIATE');
      try {
        const r = statements.map(s => s.execute());
        sqlite.exec('COMMIT');
        return r;
      } catch (e) {
        sqlite.exec('ROLLBACK');
        throw e;
      }
    },
    async exec(sql) { sqlite.exec(sql); return { count: 1, duration: 0 }; },
  };
}
