#!/usr/bin/env bash
# ==============================================================================
# ReviewPilot — AWS EC2 Production Deployment Script
# Supports Amazon Linux 2023 and Ubuntu 22.04 LTS
# ==============================================================================

set -euo pipefail

echo "========================================="
echo "  ReviewPilot — Deploying to AWS EC2     "
echo "========================================="

# 1. Update OS & Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "[1/5] Installing Docker engine..."
    if [ -f /etc/os-release ] && grep -qi "amzn" /etc/os-release; then
        sudo dnf update -y
        sudo dnf install -y docker
        sudo systemctl enable --now docker
        sudo usermod -aG docker "$USER"
    else
        sudo apt-get update -y
        sudo apt-get install -y docker.io docker-compose-v2
        sudo systemctl enable --now docker
        sudo usermod -aG docker "$USER"
    fi
    echo "Docker installed successfully."
fi

# 2. Navigate to application directory
APP_DIR="/opt/reviewpilot"
if [ ! -d "$APP_DIR" ]; then
    echo "[2/5] Creating application directory at $APP_DIR..."
    sudo mkdir -p "$APP_DIR"
    sudo chown -R "$USER:$USER" "$APP_DIR"
    git clone https://github.com/Raghunath2604/ReviewPilot.git "$APP_DIR"
    cd "$APP_DIR"
else
    echo "[2/5] Pulling latest changes from main branch..."
    cd "$APP_DIR"
    git fetch origin main
    git reset --hard origin/main
fi

# 3. Verify Environment File
if [ ! -f "backend/.env" ]; then
    echo "[3/5] Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "WARNING: Please update backend/.env with production secrets and Anthropic API key!"
fi

# 4. Build and Launch Containers
echo "[4/5] Building and launching Docker Compose containers..."
docker compose -f docker/docker-compose.yml down --remove-orphans || true
docker compose -f docker/docker-compose.yml up -d --build

# 5. Health Check Probe
echo "[5/5] Awaiting service initialization and probing /api/v1/health..."
RETRIES=15
WAIT_SECS=3

for i in $(seq 1 $RETRIES); do
    if curl -s -f http://localhost/api/v1/health > /dev/null; then
        echo "========================================="
        echo "  ReviewPilot Deployed Successfully!     "
        echo "  Web UI: http://$(curl -s http://checkip.amazonaws.com || echo 'localhost')"
        echo "========================================="
        exit 0
    fi
    echo "Waiting for health check... ($i/$RETRIES)"
    sleep $WAIT_SECS
done

echo "ERROR: Health check failed after $RETRIES attempts."
docker compose -f docker/docker-compose.yml logs --tail=50
exit 1
