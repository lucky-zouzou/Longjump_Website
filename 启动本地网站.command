#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
# Prefer an installed Node 24 runtime, with the desktop bundled runtime as fallback.
if ! command -v node >/dev/null 2>&1 || ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 24 ? 0 : 1)' 2>/dev/null; then
  export PATH="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH"
fi
node -e 'if (Number(process.versions.node.split(".")[0]) < 24) throw Error("Node.js 24 or newer is required")'
mkdir -p data/local secrets
chmod 700 data/local secrets
if [ ! -f secrets/local-admin-password.txt ]; then
  node --input-type=module -e 'import {randomBytes} from "node:crypto"; import {writeFileSync} from "node:fs"; writeFileSync("secrets/local-admin-password.txt", randomBytes(18).toString("base64url") + "\n", {mode:0o600,flag:"wx"})'
fi
export LOONGJUMP_ORIGIN=http://localhost:3188
export LOONGJUMP_ALLOW_HTTP=1
export LOONGJUMP_ADMIN_EMAIL=local-admin@example.test
export SALES_ADMIN_EMAILS=local-admin@example.test
export LOONGJUMP_ADMIN_NAME="本地管理员"
export LOONGJUMP_ADMIN_PASSWORD_FILE="$PWD/secrets/local-admin-password.txt"
export LOONGJUMP_DATA_DIR="$PWD/data/local"
export PORT=3188
export HOST=127.0.0.1
export NODE_ENV=production
if [ "${1:-}" != "--skip-build" ]; then
  pnpm build:server
fi
printf '\n网站：http://localhost:3188/\n后台：http://localhost:3188/manage/\n账号：local-admin@example.test\n密码文件：%s/secrets/local-admin-password.txt\n按 Control+C 停止服务。\n\n' "$PWD"
exec node server/index.mjs
