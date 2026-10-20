CREATE TABLE ops_promotions (
 id TEXT PRIMARY KEY, product_id TEXT NOT NULL REFERENCES ops_content(id),
 cadence TEXT NOT NULL CHECK(cadence IN ('daily','weekly')), title TEXT NOT NULL,
 price INTEGER NOT NULL CHECK(price>0), regular_price INTEGER CHECK(regular_price>price),
 starts_at TEXT NOT NULL, ends_at TEXT NOT NULL CHECK(ends_at>starts_at),
 state TEXT NOT NULL CHECK(state IN ('draft','published','archived')),
 revision INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL
);
CREATE INDEX promotions_schedule ON ops_promotions(state,starts_at,ends_at);
CREATE TABLE ops_feedback (
 id TEXT PRIMARY KEY, display_name TEXT NOT NULL, contact TEXT NOT NULL DEFAULT '',
 category TEXT NOT NULL, message TEXT NOT NULL, consent_public INTEGER NOT NULL CHECK(consent_public IN (0,1)),
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','approved','rejected')),
 reply TEXT NOT NULL DEFAULT '', revision INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX feedback_public ON ops_feedback(state,created_at);
