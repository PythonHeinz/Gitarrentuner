#!/usr/bin/env bash
# Startet einen lokalen Server und führt alle Tests aus. Aufruf: bash tests/run_all.sh
set -u
cd "$(dirname "$0")/.."
PORT="${PORT:-8765}"
python3 tests/check_files.py || exit 1
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
trap 'kill $SRV 2>/dev/null' EXIT
sleep 1
BASE_URL="http://localhost:$PORT/" python3 tests/test_app.py
