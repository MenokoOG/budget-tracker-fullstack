#!/usr/bin/env bash
#
# Deploy the latest committed code to this host.
#
# Fixes the "stale frontend" trap: passes the current git commit as a build arg
# (GIT_SHA) so Docker is forced to rebuild the frontend/api on every new commit,
# then verifies the served build actually changed instead of trusting the cache.
#
# Usage:  ./scripts/deploy.sh
set -euo pipefail

cd "$(dirname "$0")/.."

echo ">> Pulling latest..."
git pull --ff-only

GIT_SHA="$(git rev-parse --short HEAD)"
export GIT_SHA

# Docker needs sudo on hosts where the user isn't in the docker group.
DOCKER="docker"
if ! docker info >/dev/null 2>&1; then
  DOCKER="sudo docker"
fi

echo ">> Building & starting (commit ${GIT_SHA})..."
$DOCKER compose up -d --build

echo ">> Waiting for the app to come up..."
for _ in $(seq 1 15); do
  if curl -sf -o /dev/null http://localhost:3000/; then break; fi
  sleep 1
done

echo ">> Served HTML head:"
curl -s -i http://localhost:3000/ | head -8

cat <<'EOF'

>> Sanity check:
   - "Last-Modified" above should be TODAY (a fresh build), not an old date.
   - The served HTML <head> should contain <link rel="manifest" ...>.
   If either looks stale, run a hard rebuild: docker compose build --no-cache api
EOF
