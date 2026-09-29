CREATE TABLE ops_members (
  user_id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('owner','manager','editor','sales','analyst')),
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1)),
  receive_leads INTEGER NOT NULL DEFAULT 0 CHECK(receive_leads IN (0,1)),
  assignment_seq INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE ops_settings (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
INSERT INTO ops_settings VALUES (1, '{"autoAssign":true,"chatStyle":"bubble","chatTitle":"Hubungi LOONG JUMP","aiEnabled":false,"formTitle":"Minta penawaran.","formIntro":"Isi kontak dan kebutuhan pembelian Anda.","extraFields":[]}', 0);
ALTER TABLE inquiries ADD COLUMN assignee TEXT;
ALTER TABLE inquiries ADD COLUMN source TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE inquiries ADD COLUMN country TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE inquiries ADD COLUMN device TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE inquiries ADD COLUMN session_id TEXT;
CREATE INDEX inquiries_assignee_idx ON inquiries(assignee,created_at);
CREATE TRIGGER inquiries_auto_assign AFTER INSERT ON inquiries
WHEN NEW.assignee IS NULL AND json_extract((SELECT value FROM ops_settings WHERE id=1),'$.autoAssign')=1
BEGIN
  UPDATE inquiries SET assignee=(SELECT user_id FROM ops_members WHERE active=1 AND receive_leads=1 AND role IN ('sales','manager','owner') ORDER BY assignment_seq,user_id LIMIT 1) WHERE id=NEW.id;
  UPDATE ops_members SET assignment_seq=(SELECT COALESCE(MAX(assignment_seq),0)+1 FROM ops_members) WHERE user_id=(SELECT assignee FROM inquiries WHERE id=NEW.id);
END;
CREATE TABLE ops_content (
  id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('product','news','banner','image','video')),
  title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', media_url TEXT NOT NULL DEFAULT '',
  link_url TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','published','archived')),
  assignee TEXT, starts_at TEXT, ends_at TEXT, updated_at TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX ops_content_public_idx ON ops_content(kind,state,starts_at,ends_at);
CREATE TABLE ops_activity (id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT NOT NULL, action TEXT NOT NULL, target TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE ops_notes (id TEXT PRIMARY KEY, inquiry_id TEXT NOT NULL REFERENCES inquiries(id), actor TEXT NOT NULL, channel TEXT NOT NULL, message TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE ops_visits (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, path TEXT NOT NULL, source TEXT NOT NULL, country TEXT NOT NULL, device TEXT NOT NULL, engaged INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL);
CREATE INDEX ops_visits_date_idx ON ops_visits(created_at,session_id);
CREATE TABLE ops_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE ops_search (id INTEGER PRIMARY KEY AUTOINCREMENT, engine TEXT NOT NULL, day TEXT NOT NULL, query TEXT NOT NULL, page TEXT NOT NULL, clicks INTEGER NOT NULL, impressions INTEGER NOT NULL, position REAL NOT NULL, imported_at TEXT NOT NULL, UNIQUE(engine,day,query,page));
