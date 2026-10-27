import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import rateLimit from 'express-rate-limit';

describe('Rate Limiter Middleware Test', () => {
  it('should return 429 when requests exceed the configured threshold', async () => {
    const testApp = express();
    const testLimiter = rateLimit({
      windowMs: 60000,
      max: 2, // Low threshold to easily trigger 429 in test
      handler: (_req, res) => {
        res.status(429).json({ error: 'Rate limit exceeded' });
      },
    });

    testApp.use('/test-rate-limit', testLimiter, (_req, res) => {
      res.status(200).json({ ok: true });
    });

    // Request 1: 200
    const res1 = await request(testApp).get('/test-rate-limit');
    expect(res1.status).toBe(200);

    // Request 2: 200
    const res2 = await request(testApp).get('/test-rate-limit');
    expect(res2.status).toBe(200);

    // Request 3: 429 Exceeded
    const res3 = await request(testApp).get('/test-rate-limit');
    expect(res3.status).toBe(429);
    expect(res3.body.error).toBe('Rate limit exceeded');
  });
});
