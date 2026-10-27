# ReviewPilot - One-Click Local Development Launcher (PowerShell)
# Starts Docker PostgreSQL, runs migrations if needed, and launches Backend & Frontend

$ErrorActionPreference = "Stop"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   ReviewPilot - AI Code Review Assistant Launcher" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# 1. Start PostgreSQL Docker container
Write-Host "[1/4] Starting PostgreSQL Docker Container..." -ForegroundColor Yellow
$containerStatus = docker ps -a --filter "name=reviewpilot-postgres" --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "Creating and starting reviewpilot-postgres on port 5434..." -ForegroundColor Gray
    docker compose -f docker/docker-compose.yml up -d postgres
} elseif ($containerStatus -notmatch "^Up") {
    Write-Host "Restarting existing reviewpilot-postgres container..." -ForegroundColor Gray
    docker start reviewpilot-postgres
} else {
    Write-Host "PostgreSQL container is already healthy and running on port 5434." -ForegroundColor Green
}

# 2. Synchronize Database Schema
Write-Host "`n[2/4] Verifying Database Schema with Prisma..." -ForegroundColor Yellow
Push-Location backend
npx prisma db push --skip-generate
Pop-Location
Write-Host "Database schema up-to-date." -ForegroundColor Green

# 3. Check / Build Backend
Write-Host "`n[3/4] Building Backend TypeScript..." -ForegroundColor Yellow
Push-Location backend
npm run build
Pop-Location

# 4. Starting Services Banner
Write-Host "`n[4/4] Starting ReviewPilot Services..." -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Gray
Write-Host "Backend API:  http://localhost:5000" -ForegroundColor Green
Write-Host "Frontend App: http://localhost:5173" -ForegroundColor Green
Write-Host "Health Probe: http://localhost:5000/api/v1/health" -ForegroundColor Green
Write-Host "Demo User:    demo-dev@reviewpilot.io / Password123!" -ForegroundColor Green
Write-Host "--------------------------------------------------------" -ForegroundColor Gray
Write-Host "Press Ctrl+C in either terminal to stop.`n" -ForegroundColor Gray

# Launch Backend in new window and Frontend in current window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot/../backend'; Write-Host 'Starting ReviewPilot Backend...' -ForegroundColor Cyan; node dist/server.js"
Push-Location frontend
npm run dev
Pop-Location
