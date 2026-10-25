#!/usr/bin/env bash
set -euo pipefail

HOST="127.0.0.1"
PORT="4173"
BASE_URL="http://${HOST}:${PORT}"
SERVER_LOG="${TMPDIR:-/tmp}/vitala-e2e.log"

bun run build:check >/dev/null
bun run dev --host "$HOST" --port "$PORT" >"$SERVER_LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in {1..30}; do
  if curl --silent --fail "$BASE_URL/" >/dev/null; then
    break
  fi
  sleep 1
done

if ! curl --silent --fail "$BASE_URL/" >/dev/null; then
  cat "$SERVER_LOG"
  exit 1
fi

for viewport in "360,800" "390,844" "412,915" "768,1024"; do
  output="/tmp/vitala-mobile-${viewport//,/-}.png"
  bunx playwright screenshot \
    --browser=chromium \
    --viewport-size="$viewport" \
    --wait-for-selector="#main" \
    "$BASE_URL/" \
    "$output" >/dev/null
  test -s "$output"
done

for route in "/flash" "/radar" "/talents" "/espace"; do
  output="/tmp/vitala-route-${route#/}.png"
  bunx playwright screenshot \
    --browser=chromium \
    --viewport-size="390,844" \
    --wait-for-selector="#main" \
    "$BASE_URL$route" \
    "$output" >/dev/null
  test -s "$output"
done

echo "Mobile E2E smoke validation passed for four target viewports and core routes."
