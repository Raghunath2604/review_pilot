import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    $queryRaw: vi.fn(),
  },
}));

describe('Health Check Integration Test', () => {
  it('GET /api/v1/health should return 200 and ok status when DB is reachable', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce([{ '?column?': 1 }]);

    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('connected');
    expect(res.body.timestamp).toBeDefined();
  });

  it('GET /api/v1/health should return 503 when DB throws error', async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('Connection lost'));

    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degraded');
    expect(res.body.db).toBe('disconnected');
  });
});
