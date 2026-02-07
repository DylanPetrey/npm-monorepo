#!/usr/bin/env bash
set -euo pipefail

# Usage: ./newMigrationFile.sh NAME...
[[ $# -ge 1 ]] || { echo "usage: $0 NAME" >&2; exit 1; }

# Slugify the name
slug="$(printf '%s' "$*" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -E 's/[^a-z0-9]+/-/g; s/^-+|-+$//g')"

ts="$(date -u +%Y%m%dT%H%M%SZ)"
base="${ts}-${slug}"
file="${base}.ts"

# If exists, add -001, -002, ...
if [[ -e "$file" ]]; then
  i=1
  while [[ -e "${base}-$(printf '%03d' "$i").ts" ]]; do ((i++)); done
  file="${base}-$(printf '%03d' "$i").ts"
fi

touch "$file"
echo "$file"
mv "$file" "./database/migrations/$file"
