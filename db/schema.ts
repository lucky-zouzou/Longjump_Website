import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const inquiries = sqliteTable('inquiries', {
  id: text('id').primaryKey(),
  requestKey: text('request_key').notNull(),
  payloadHash: text('payload_hash').notNull(),
  topic: text('topic').notNull(),
  status: text('status').notNull().default('new'),
  payload: text('payload').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  salesNote: text('sales_note').notNull().default(''),
  updatedBy: text('updated_by'),
  revision: integer('revision').notNull().default(0),
}, table => [
  uniqueIndex('inquiries_request_key_unique').on(table.requestKey),
  index('inquiries_created_idx').on(table.createdAt, table.id),
  index('inquiries_status_created_idx').on(table.status, table.createdAt, table.id),
]);
