import { openDatabase } from './storage.mjs';

// Node-side substitute for the `cloudflare:workers` env module (wired up via
// vite resolve.alias in the LOONGJUMP_TARGET=node build). SALES_ADMIN_EMAILS is
// read by lib/server-sales-auth.ts as the sales-desk allowlist.
const key = Symbol.for('loongjump.website.storage');
export const env = globalThis[key] || (globalThis[key] = {
  DB: openDatabase(),
  SALES_ADMIN_EMAILS: process.env.SALES_ADMIN_EMAILS ?? '',
});
