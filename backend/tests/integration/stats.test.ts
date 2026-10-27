import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';
import { env } from '../../src/config/env.js';

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    review: {
      count: vi.fn(),
    },
    finding: {
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

describe('Stats Integration Tests', () => {
  const testUserId = 'user-uuid-101';
  let authToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    authToken = jwt.sign({ userId: testUserId, email: 'test@example.com' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  it('should return 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/v1/stats');
    expect(res.status).toBe(401);
  });

  it('should calculate AI precision percentage and category breakdown correctly', async () => {
    vi.mocked(prisma.review.count).mockResolvedValueOnce(5); // total reviews
    vi.mocked(prisma.finding.count)
      .mockResolvedValueOnce(20) // total findings
      .mockResolvedValueOnce(12) // accepted
      .mockResolvedValueOnce(3)  // false positive
      .mockResolvedValueOnce(5); // pending

    // Mock category groupBy
    vi.mocked(prisma.finding.groupBy)
      .mockResolvedValueOnce([
        { category: 'BUG', _count: { category: 8 } },
        { category: 'SECURITY', _count: { category: 6 } },
      ] as any)
      // Mock severity groupBy
      .mockResolvedValueOnce([
        { severity: 'HIGH', _count: { severity: 6 } },
        { severity: 'MEDIUM', _count: { severity: 10 } },
      ] as any);

    const res = await request(app)
      .get('/api/v1/stats')
      .set('Cookie', [`token=${authToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.totalReviews).toBe(5);
    expect(res.body.totalFindings).toBe(20);
    expect(res.body.acceptedCount).toBe(12);
    expect(res.body.falsePositiveCount).toBe(3);
    // Precision: 12 / (12 + 3) = 12 / 15 = 80.0%
    expect(res.body.precisionPercentage).toBe(80);
    expect(res.body.byCategory.BUG).toBe(8);
    expect(res.body.byCategory.SECURITY).toBe(6);
    expect(res.body.bySeverity.HIGH).toBe(6);
    expect(res.body.bySeverity.LOW).toBe(0);
  });

  it('should return 0% precision when no findings have been verified yet', async () => {
    vi.mocked(prisma.review.count).mockResolvedValueOnce(1);
    vi.mocked(prisma.finding.count)
      .mockResolvedValueOnce(4) // total
      .mockResolvedValueOnce(0) // accepted
      .mockResolvedValueOnce(0) // false positive
      .mockResolvedValueOnce(4); // pending

    vi.mocked(prisma.finding.groupBy)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const res = await request(app)
      .get('/api/v1/stats')
      .set('Cookie', [`token=${authToken}`]);

    expect(res.status).toBe(200);
    expect(res.body.precisionPercentage).toBe(0);
  });
});
