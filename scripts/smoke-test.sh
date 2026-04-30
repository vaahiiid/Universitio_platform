#!/usr/bin/env bash
# Post-deploy smoke test
#
# Usage:
#   ./scripts/smoke-test.sh [BASE_URL]
#   SMOKE_TEST_BASE_URL=https://myapp.replit.app ./scripts/smoke-test.sh
#
# URL resolution order:
#   1. First positional argument
#   2. SMOKE_TEST_BASE_URL environment variable  (preferred for CI / post-deploy)
#   3. REPLIT_DEV_DOMAIN environment variable    (set automatically by Replit)
#   4. https://universitio.com                  (production default)
#
# Exit codes:
#   0 — all checks passed
#   1 — one or more checks failed (deployment is likely unhealthy)

set -euo pipefail

BASE_URL="${1:-}"
BASE_URL="${BASE_URL:-${SMOKE_TEST_BASE_URL:-}}"
BASE_URL="${BASE_URL:-${REPLIT_DEV_DOMAIN:+https://$REPLIT_DEV_DOMAIN}}"
BASE_URL="${BASE_URL:-https://universitio.com}"

# Strip trailing slash
BASE_URL="${BASE_URL%/}"

PASS=0
FAIL=0

check() {
  local label="$1"
  local url="$2"
  local expected="${3:-200}"

  printf "  %-30s " "$label"
  local status
  status=$(curl -o /dev/null -s -w "%{http_code}" --max-time 15 "$url") || {
    echo "FAIL (connection error)"
    FAIL=$((FAIL + 1))
    return
  }

  if [ "$status" -eq "$expected" ]; then
    echo "OK ($status)"
    PASS=$((PASS + 1))
  else
    echo "FAIL (expected $expected, got $status)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "Smoke test against: $BASE_URL"
echo "----------------------------------------"

check "Homepage (/)"                 "$BASE_URL/"
check "Health check (/api/healthz)"  "$BASE_URL/api/healthz"

echo "----------------------------------------"
echo "Passed: $PASS  Failed: $FAIL"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "ERROR: $FAIL smoke test(s) failed. The deployment may be unhealthy." >&2
  exit 1
fi

echo "All smoke tests passed."
