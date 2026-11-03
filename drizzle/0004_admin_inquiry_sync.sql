-- Durable delivery state. No credentials or HTTP response bodies are stored.
CREATE TABLE admin_inquiry_outbox (
 inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id),
 generation INTEGER NOT NULL DEFAULT 1,
 delivered_generation INTEGER NOT NULL DEFAULT 0,
 attempts INTEGER NOT NULL DEFAULT 0,
 next_attempt_at INTEGER NOT NULL DEFAULT 0,
 last_error TEXT NOT NULL DEFAULT '',
 delivered_at TEXT,
 admin_lead_id TEXT,
 message_generation INTEGER NOT NULL DEFAULT 0,
 message_json TEXT,
 lease_id TEXT,
 lease_until INTEGER NOT NULL DEFAULT 0
);
INSERT INTO admin_inquiry_outbox(inquiry_id) SELECT id FROM inquiries;
CREATE TRIGGER inquiries_admin_sync_insert AFTER INSERT ON inquiries BEGIN
 INSERT INTO admin_inquiry_outbox(inquiry_id) VALUES(NEW.id)
 ON CONFLICT(inquiry_id) DO UPDATE SET generation=generation+1,next_attempt_at=0;
END;
CREATE TRIGGER inquiries_admin_sync_update AFTER UPDATE OF payload,topic,assignee,status,sales_note ON inquiries
WHEN NEW.payload IS NOT OLD.payload OR NEW.topic IS NOT OLD.topic OR NEW.assignee IS NOT OLD.assignee OR NEW.status IS NOT OLD.status OR NEW.sales_note IS NOT OLD.sales_note
BEGIN
 INSERT INTO admin_inquiry_outbox(inquiry_id) VALUES(NEW.id)
 ON CONFLICT(inquiry_id) DO UPDATE SET generation=generation+1,next_attempt_at=0;
END;
CREATE INDEX admin_inquiry_outbox_due ON admin_inquiry_outbox(next_attempt_at,lease_until);
