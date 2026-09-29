#!/usr/bin/env bash
# Runs on the existing production server, after source extraction to app.new.
# No database rollback: additive migrations preserve inquiries received during
# deployment. A verified snapshot is retained for deliberate disaster recovery.
set -euo pipefail
cd /opt/loongjump-website
release="$(date -u +%Y%m%dT%H%M%SZ)"
previous_image="$(docker inspect --format '{{.Image}}' loongjump-web)"
docker tag "$previous_image" "loongjump-website:rollback-$release"
docker build -t "loongjump-website:release-$release" app.new
# Each deployment uses a separate backup directory, even within the same day.
docker exec loongjump-web node server/cli.mjs backup --output "/backups/predeploy-$release"
cp compose.yaml "compose.previous-$release.yaml"
mv app "app.previous-$release"
mv app.new app
cp app/compose.yaml compose.yaml
docker tag "loongjump-website:release-$release" loongjump-website:current
rollback() {
  echo "Deployment failed; restoring previous application image and source."
  mv app "app.failed-$release"
  mv "app.previous-$release" app
  cp "compose.previous-$release.yaml" compose.yaml
  printf 'services:\n  web:\n    image: loongjump-website:rollback-%s\n' "$release" > "rollback-$release.yaml"
  docker compose -f compose.yaml -f "rollback-$release.yaml" up -d --no-build
  exit 1
}
docker compose up -d --no-build || rollback
healthy=false
for attempt in $(seq 1 45); do
  status="$(docker inspect --format '{{.State.Health.Status}}' loongjump-web 2>/dev/null || true)"
  if [ "$status" = healthy ]; then healthy=true; break; fi
  sleep 4
done
[ "$healthy" = true ] || rollback
curl -fsS --retry 3 -o /dev/null https://loongjump.com/ || rollback
curl -fsS --retry 3 https://loongjump.com/api/public/content | python3 -c 'import json,sys;d=json.load(sys.stdin);assert isinstance(d["content"],list) and "settings" in d' || rollback
curl -fsS --retry 3 -o /dev/null https://loongjump.com/manage/manifest.webmanifest || rollback
echo "Deployment verified: $release; previous source, image and database backup retained."
