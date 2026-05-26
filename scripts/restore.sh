#!/usr/bin/env bash
# Restore a budget_tracker dump produced by scripts/backup.sh.
#
# Usage:
#   scripts/restore.sh                          # restores the newest dump in $BACKUP_DIR
#   scripts/restore.sh path/to/dump.sql.gz      # restores the given file
#   scripts/restore.sh -y path/to/dump.sql.gz   # skip confirmation (for scripts)
#
# Reads connection settings from repo-root .env. Uses --single-transaction +
# ON_ERROR_STOP, so a bad dump leaves the DB untouched.
#
# Note: stop the api first if it's running, otherwise open connections may
# block the DROPs in the dump:  docker compose stop api

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
SERVICE="${POSTGRES_SERVICE:-postgres}"

ASSUME_YES=0
DUMP_PATH=""

for arg in "$@"; do
  case "$arg" in
    -y|--yes) ASSUME_YES=1 ;;
    -h|--help)
      sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    -*)
      echo "[restore] unknown flag: $arg" >&2
      exit 2
      ;;
    *) DUMP_PATH="$arg" ;;
  esac
done

if [[ -z "$DUMP_PATH" ]]; then
  # Newest matching dump
  DUMP_PATH="$(find "$BACKUP_DIR" -maxdepth 1 -name "${POSTGRES_DB}-*.sql.gz" -type f -printf '%T@ %p\n' 2>/dev/null \
    | sort -rn | head -n1 | cut -d' ' -f2-)"
  if [[ -z "$DUMP_PATH" ]]; then
    echo "[restore] no dumps found in $BACKUP_DIR" >&2
    exit 1
  fi
fi

if [[ ! -f "$DUMP_PATH" ]]; then
  echo "[restore] dump not found: $DUMP_PATH" >&2
  exit 1
fi

if ! docker compose -f "$REPO_ROOT/docker-compose.yml" ps --status running --services | grep -qx "$SERVICE"; then
  echo "[restore] FAILED: compose service '$SERVICE' is not running" >&2
  echo "[restore] start it with: docker compose up -d $SERVICE" >&2
  exit 1
fi

echo "[restore] target database: $POSTGRES_DB"
echo "[restore] from dump:       $DUMP_PATH"
echo "[restore] this will DROP and recreate all tables in $POSTGRES_DB."

if [[ "$ASSUME_YES" -ne 1 ]]; then
  read -r -p "Proceed? [y/N] " confirm
  case "$confirm" in
    y|Y|yes|YES) ;;
    *) echo "[restore] aborted"; exit 1 ;;
  esac
fi

if [[ "$DUMP_PATH" == *.gz ]]; then
  decompress=(gunzip -c "$DUMP_PATH")
else
  decompress=(cat "$DUMP_PATH")
fi

"${decompress[@]}" | docker compose -f "$REPO_ROOT/docker-compose.yml" exec -T "$SERVICE" \
  psql --single-transaction -v ON_ERROR_STOP=1 \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null

echo "[restore] ok"
