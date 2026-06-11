#!/usr/bin/env bash
# Records the read-only demo flow and produces docs/demo.gif.
#
# Usage (from the repo root):
#   ./scripts/local/record_demo.sh
#
# Requires: node deps installed (npm install), Playwright Chromium
# (npx playwright install chromium), and ffmpeg on PATH.
#
# Pipeline: production demo build → next start → Playwright-recorded
# Chromium session (scripts/local/record_demo.mjs) → ffmpeg palette-based
# webm-to-GIF conversion.
set -euo pipefail

PORT="${PORT:-3300}"
BASE_URL="http://127.0.0.1:${PORT}"
VIDEO_DIR="scripts/local/.demo-video"
OUT_GIF="docs/demo.gif"

export APP_MODE=demo AUTH_SECRET=local-demo-secret AUTH_TRUST_HOST=true

echo "==> Building demo bundle"
npx next build

echo "==> Starting demo server on :${PORT}"
npx next start -p "${PORT}" &
SERVER_PID=$!
trap 'kill "${SERVER_PID}" 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  curl -sf -o /dev/null "${BASE_URL}/login" && break
  sleep 1
done
curl -sf -o /dev/null "${BASE_URL}/login" || { echo "server never came up"; exit 1; }

echo "==> Recording demo flow"
rm -rf "${VIDEO_DIR}"
BASE_URL="${BASE_URL}" VIDEO_DIR="${VIDEO_DIR}" node scripts/local/record_demo.mjs

WEBM=$(ls "${VIDEO_DIR}"/*.webm | head -1)
echo "==> Converting ${WEBM} -> ${OUT_GIF}"
ffmpeg -y -loglevel error -i "${WEBM}" \
  -vf "fps=10,scale=960:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" \
  "${OUT_GIF}"

rm -rf "${VIDEO_DIR}"
echo "==> Done: ${OUT_GIF} ($(du -h "${OUT_GIF}" | cut -f1))"
