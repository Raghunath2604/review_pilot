# ReviewPilot — Production Deployment Runbook

This guide details deployment procedures for **ReviewPilot** across **AWS (EC2 with Docker or ECS Fargate)** and **Render (Fallback)**.

---

## 1. Environment Variables Checklist

Ensure these variables are configured in production:

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `NODE_ENV` | Yes | Set to `production` | `production` |
| `PORT` | Yes | HTTP port | `5000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/reviewpilot?schema=public` |
| `JWT_SECRET` | Yes | Cryptographic secret for signing JWTs ($\ge 32$ chars) | Random 64-char hex string |
| `JWT_EXPIRES_IN` | Yes | Session token lifespan | `7d` |
| `CORS_ORIGIN` | Yes | Allowed frontend origin | `https://your-domain.com` |
| `ANTHROPIC_API_KEY` | Yes | Official Anthropic Claude API key | `sk-ant-api03-...` |
| `ANTHROPIC_MODEL` | No | Model name (defaults to Claude 3.5 Sonnet) | `claude-3-5-sonnet-20241022` |
| `RATE_LIMIT_WINDOW_MS`| No | Rate limiting window (ms) | `3600000` (1 hour) |
| `RATE_LIMIT_MAX_REVIEWS`| No | Max review requests per user per window | `10` |

---

## 2. Option A: Deploy to AWS EC2 (Docker Compose) — Primary

### Step 1: Launch EC2 Instance
1. In the **AWS Management Console**, navigate to **EC2** and click **Launch Instance**.
2. **AMI**: Amazon Linux 2023 or Ubuntu 22.04 LTS.
3. **Instance Type**: `t3.small` or `t3.medium` (minimum 2 GB RAM recommended for Docker builds).
4. **Key Pair**: Select or create an SSH key pair (`.pem`).
5. **Security Group**:
   - Inbound rules:
     - `SSH` (port 22) from your IP.
     - `HTTP` (port 80) from `0.0.0.0/0`.
     - `HTTPS` (port 443) from `0.0.0.0/0`.

### Step 2: Connect & Execute Automated Deployment
SSH into the instance and run the automated deployment script:
```bash
ssh -i your-key.pem ec2-user@<YOUR-EC2-PUBLIC-IP>

# Clone ReviewPilot and execute setup
git clone https://github.com/Raghunath2604/ReviewPilot.git /opt/reviewpilot
cd /opt/reviewpilot

# Run the verified EC2 deployment script
chmod +x scripts/deploy-ec2.sh
./scripts/deploy-ec2.sh
```

### Step 3: Configure Let's Encrypt SSL (HTTPS)
To configure free automated TLS certificates:
```bash
sudo dnf install -y certbot python3-certbot-nginx # or apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 3. Option B: Deploy to AWS ECS Fargate & Amazon RDS

For a fully managed container service:
1. **Database**: Create an **Amazon RDS PostgreSQL 16** instance in your private VPC subnet.
2. **Container Registry**: Push Docker images to **Amazon ECR**:
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker tag reviewpilot-backend:latest <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/reviewpilot-backend:latest
   docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/reviewpilot-backend:latest
   ```
3. **Task Definition**: Register the task definition in [aws/task-definition.json](file:///c:/Users/raghu/OneDrive/Documents/ReviewPilot/aws/task-definition.json):
   ```bash
   aws ecs register-task-definition --cli-input-json file://aws/task-definition.json
   ```
4. **ECS Service**: Create an ECS Service with an **Application Load Balancer (ALB)** pointing target groups to port 5000 (`/api/v1/health`).

---

## 4. Option C: Render Deployment (Zero-Config Fallback)

If AWS verification or credentials are unavailable:
1. Fork or push this repository to GitHub.
2. Sign in to [Render](https://render.com).
3. Click **New +** -> **Blueprint**.
4. Connect this repository; Render automatically detects [render.yaml](file:///c:/Users/raghu/OneDrive/Documents/ReviewPilot/render.yaml) and creates:
   - Managed PostgreSQL 16 database.
   - Node.js backend Web Service.
   - Vite static frontend site.
5. In the Render Dashboard, paste your `ANTHROPIC_API_KEY` into the backend environment variables.
6. Click **Apply** to deploy.

---

## 5. Health Monitoring & Alerting

Run the standalone health probe manually or via cron:

```bash
# Execute local health probe
npx tsx scripts/health-monitor.ts

# Probe remote production endpoint
HEALTH_CHECK_URL=https://your-domain.com/api/v1/health npx tsx scripts/health-monitor.ts
```

Output:
```json
{"status":"HEALTHY","db":"connected","uptimeSeconds":184,"latencyMs":14,"timestamp":"2026-10-27T22:20:00.000Z"}
```
- Exits with `0` when healthy.
- Exits with `1` when degraded or unreachable, triggering alerts in CloudWatch Alarms or Datadog.
