#!/usr/bin/env bash
# ReviewPilot - One-Click Local Development Launcher (Bash)
set -e

echo ""
echo "========================================================"
echo "   ReviewPilot - AI Code Review Assistant Launcher"
echo "========================================================"
echo ""

# 1. Start PostgreSQL
echo "[1/4] Ensuring PostgreSQL container is running on port 5434..."
docker compose -f docker/docker-compose.yml up -d postgres

# 2. Synchronize Prisma Schema
echo "[2/4] Verifying database schema..."
(cd backend && npx prisma db push --skip-generate)

# 3. Build Backend
echo "[3/4] Building Backend TypeScript..."
(cd backend && npm run build)

# 4. Run Concurrently or background
echo "[4/4] Starting ReviewPilot services..."
echo "--------------------------------------------------------"
echo "Backend API:  http://localhost:5000"
echo "Frontend App: http://localhost:5173"
echo "Health Check: http://localhost:5000/api/v1/health"
echo "Demo Login:   demo-dev@reviewpilot.io / Password123!"
echo "--------------------------------------------------------"

trap 'kill $(jobs -p)' EXIT
(cd backend && node dist/server.js) &
(cd frontend && npm run dev) &
wait
