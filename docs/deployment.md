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

## 2. Option A: Deploy to AWS EC2 (Single-Instance / Free Tier / Recommended for College Viva)

The fastest and most reliable way to showcase a 100% self-hosted, cloud-native instance on AWS. It uses Docker Compose to run PostgreSQL 16, the Express API, and an Nginx reverse-proxied React frontend.

### Step 1: Launch EC2 Instance in AWS Console
1. Log in to the **AWS Management Console** -> navigate to **EC2** -> click **Launch Instance**.
2. **Name**: `reviewpilot-production`.
3. **AMI**: **Amazon Linux 2023** or **Ubuntu 22.04 LTS** (64-bit x86).
4. **Instance Type**: `t3.small` (2 vCPU, 2 GiB RAM) or `t2.micro` (Free Tier eligible).
5. **Key Pair**: Select or create an SSH key pair (e.g. `reviewpilot-key.pem`).
6. **Network / Security Group**:
   - Check **Allow SSH traffic** from anywhere (or your IP).
   - Check **Allow HTTP traffic from the internet** (Port 80).
   - Check **Allow HTTPS traffic from the internet** (Port 443).
   - Add custom TCP rule for Port 5000 (if direct API access is desired).
7. Click **Launch Instance**.

### Step 2: One-Command Automated Deployment
Connect to your EC2 instance via SSH and run the automated provisioning script:

```bash
# 1. Connect to EC2
ssh -i reviewpilot-key.pem ubuntu@<YOUR-EC2-PUBLIC-IP>
# (Or 'ec2-user@<YOUR-EC2-PUBLIC-IP>' if using Amazon Linux 2023)

# 2. Run the ReviewPilot 1-Click Deployment Script
curl -sSL https://raw.githubusercontent.com/Raghunath2604/ReviewPilot/main/scripts/deploy-ec2.sh | bash
```

The script automatically:
1. Installs Docker engine and Docker Compose v2.
2. Clones the repository to `/opt/reviewpilot`.
3. Generates production environment files with secure secrets.
4. Builds and launches all 3 containers (`postgres:16`, `backend`, `frontend`).
5. Probes `/api/v1/health` until all health checks pass.
6. Displays your live public web application URL!

### Step 3: Automated CI/CD Deployment via GitHub Actions
To automatically deploy to EC2 every time you push code to `main`:
1. In your GitHub repository, go to **Settings** -> **Secrets and variables** -> **Actions**.
2. Add the following repository secrets:
   - `AWS_EC2_HOST`: Your EC2 Public IPv4 address (e.g., `54.210.12.34`).
   - `AWS_EC2_USER`: `ubuntu` (or `ec2-user`).
   - `AWS_EC2_SSH_KEY`: The entire contents of your `.pem` private key file.

---

## 3. Option B: Deploy to AWS App Runner (Serverless PaaS)

AWS App Runner provides fully managed container execution with automatic TLS, load balancing, and zero infrastructure maintenance:

1. Build and push your backend Docker image to **Amazon ECR**:
   ```bash
   aws ecr create-repository --repository-name reviewpilot-backend --region us-east-1
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
   docker build -t <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/reviewpilot-backend:latest -f docker/Dockerfile.backend backend
   docker push <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/reviewpilot-backend:latest
   ```
2. In AWS Console, go to **AWS App Runner** -> click **Create Service**.
3. Choose **Container registry** -> **Amazon ECR** -> select `reviewpilot-backend:latest`.
4. Configure Port `5000` and pass environment variables (`DATABASE_URL`, `JWT_SECRET`, `ANTHROPIC_API_KEY`).
5. App Runner automatically provisions an `https://xxxx.awsapprunner.com` URL with 99.99% uptime.

---

## 4. Option C: Deploy to AWS ECS Fargate & Amazon RDS (Enterprise Architecture)

For an enterprise-grade multi-tier architecture:
1. **Managed Database**: Provision an **Amazon RDS PostgreSQL 16** db instance in your VPC private subnet.
2. **Secrets**: Store sensitive credentials in **AWS Secrets Manager**:
   - `reviewpilot/DATABASE_URL`
   - `reviewpilot/JWT_SECRET`
   - `reviewpilot/ANTHROPIC_API_KEY`
3. **Register Task Definition**:
   ```bash
   aws ecs register-task-definition --cli-input-json file://aws/task-definition.json
   ```
4. **Create ECS Service**:
   Deploy the task definition to an ECS cluster backed by AWS Fargate with an Application Load Balancer (ALB).

---

## 5. Option D: Render Deployment (Zero-Config Fallback)

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
