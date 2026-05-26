#!/usr/bin/env bash
# Dump the budget_tracker postgres DB to a gzipped SQL file under ./backups.
# Reads connection settings from repo-root .env. Safe to run from cron (uses -T).
#
# Env overrides:
#   BACKUP_DIR          target directory (default: <repo>/backups)
#   BACKUP_RETAIN_DAYS  prune dumps older than N days (default: 14, 0 disables)
#   POSTGRES_SERVICE    compose service name (default: postgres)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  source "$REPO_ROOT/.env"
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-budget}"
POSTGRES_DB="${POSTGRES_DB:-budget_tracker}"
BACKUP_DIR="${BACKUP_DIR:-$REPO_ROOT/backups}"
RETAIN_DAYS="${BACKUP_RETAIN_DAYS:-14}"
SERVICE="${POSTGRES_SERVICE:-postgres}"

mkdir -p "$BACKUP_DIR"

timestamp="$(date +%Y%m%d-%H%M%S)"
file="$BACKUP_DIR/${POSTGRES_DB}-${timestamp}.sql.gz"

echo "[backup] dumping ${POSTGRES_DB} -> ${file}"

# Confirm the postgres container is up before attempting exec
if ! docker compose -f "$REPO_ROOT/docker-compose.yml" ps --status running --services | grep -qx "$SERVICE"; then
  echo "[backup] FAILED: compose service '$SERVICE' is not running" >&2
  echo "[backup] start it with: docker compose up -d $SERVICE" >&2
  exit 1
fi

docker compose -f "$REPO_ROOT/docker-compose.yml" exec -T "$SERVICE" \
  pg_dump --clean --if-exists --no-owner --no-privileges \
    -U "$POSTGRES_USER" "$POSTGRES_DB" \
  | gzip > "$file"

if [[ ! -s "$file" ]]; then
  echo "[backup] FAILED: ${file} is empty" >&2
  rm -f "$file"
  exit 1
fi

size="$(du -h "$file" | cut -f1)"
echo "[backup] ok (${size})"

if [[ "$RETAIN_DAYS" -gt 0 ]]; then
  pruned="$(find "$BACKUP_DIR" -maxdepth 1 -name "${POSTGRES_DB}-*.sql.gz" -type f -mtime "+${RETAIN_DAYS}" -print -delete | wc -l)"
  if [[ "$pruned" -gt 0 ]]; then
    echo "[backup] pruned ${pruned} dump(s) older than ${RETAIN_DAYS} days"
  fi
fi
