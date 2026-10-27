/**
 * ReviewPilot Health Check Monitor
 * Runs standalone probe against /api/v1/health endpoint
 * Suitable for container health checks, AWS CloudWatch synthetics, and cron alerting.
 */

const HEALTH_URL = process.env.HEALTH_CHECK_URL || 'http://localhost:5000/api/v1/health';
const TIMEOUT_MS = parseInt(process.env.HEALTH_TIMEOUT_MS || '5000', 10);

interface HealthResponse {
  status: string;
  db: string;
  uptime: number;
  timestamp: string;
}

async function runHealthCheck(): Promise<void> {
  const startTime = Date.now();
  console.log(`[HealthMonitor] Probing endpoint: ${HEALTH_URL}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(HEALTH_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ReviewPilot-HealthMonitor/1.0',
      },
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      console.error(
        JSON.stringify({
          status: 'UNHEALTHY',
          code: response.status,
          latencyMs,
          error: `HTTP error: ${response.statusText}`,
          timestamp: new Date().toISOString(),
        })
      );
      process.exitCode = 1;
      return;
    }

    const data = (await response.json()) as HealthResponse;

    if (data.status !== 'ok' || data.db !== 'connected') {
      console.error(
        JSON.stringify({
          status: 'DEGRADED',
          db: data.db,
          latencyMs,
          timestamp: new Date().toISOString(),
        })
      );
      process.exitCode = 1;
      return;
    }

    console.log(
      JSON.stringify({
        status: 'HEALTHY',
        db: data.db,
        uptimeSeconds: Math.round(data.uptime),
        latencyMs,
        timestamp: new Date().toISOString(),
      })
    );
    process.exitCode = 0;
  } catch (err) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    console.error(
      JSON.stringify({
        status: 'CRITICAL',
        error: (err as Error).message || 'Connection refused or timed out',
        latencyMs,
        timestamp: new Date().toISOString(),
      })
    );
    process.exitCode = 1;
  }
}

runHealthCheck();
