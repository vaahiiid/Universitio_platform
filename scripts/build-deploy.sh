#!/usr/bin/env bash
set -euo pipefail

echo "Building frontend..."
PORT=80 BASE_PATH=/ pnpm --filter @workspace/universitio run build

echo "Building API server..."
pnpm --filter @workspace/api-server run build

echo "Build complete."
