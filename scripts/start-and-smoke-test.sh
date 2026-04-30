#!/usr/bin/env bash
# Production start script with automatic post-deploy smoke test.
# Starts the API server, waits for it to respond, then runs a smoke test
# against localhost. Exits non-zero (killing the deployment) if the site
# is not healthy after startup.
set -euo pipefail

PORT="${PORT:-8080}"
MAX_WAIT=60  # seconds to wait for the server to be ready

echo "[start-and-smoke-test] Starting API server on port $PORT..."
node services/api-server/dist/index.js &
SERVER_PID=$!

echo "[start-and-smoke-test] Waiting for server to become ready (max ${MAX_WAIT}s)..."
READY=0
for i in $(seq 1 $MAX_WAIT); do
  if curl -sf --max-time 2 "http://localhost:${PORT}/api/healthz" > /dev/null 2>&1; then
    READY=1
    echo "[start-and-smoke-test] Server is ready (${i}s)."
    break
  fi
  sleep 1
done

if [ "$READY" -eq 0 ]; then
  echo "[start-and-smoke-test] ERROR: Server did not become ready within ${MAX_WAIT}s." >&2
  kill "$SERVER_PID" 2>/dev/null || true
  exit 1
fi

echo "[start-and-smoke-test] Running smoke test against http://localhost:${PORT}..."
if SMOKE_TEST_BASE_URL="http://localhost:${PORT}" bash scripts/smoke-test.sh; then
  echo "[start-and-smoke-test] Smoke test passed. Deployment is healthy."
else
  echo "[start-and-smoke-test] ERROR: Smoke test failed. Deployment is unhealthy." >&2
  kill "$SERVER_PID" 2>/dev/null || true
  exit 1
fi

# Keep the server running
wait "$SERVER_PID"
