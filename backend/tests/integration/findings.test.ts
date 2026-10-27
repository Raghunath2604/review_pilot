import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';
import { env } from '../../src/config/env.js';

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    finding: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $disconnect: vi.fn(),
  },
}));

describe('Findings Feedback Integration Tests', () => {
  const testUserId = 'user-uuid-101';
  let authToken: string;

  beforeEach(() => {
    vi.clearAllMocks();
    authToken = jwt.sign({ userId: testUserId, email: 'test@example.com' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  it('should return 401 if unauthenticated', async () => {
    const res = await request(app)
      .patch('/api/v1/findings/some-id/feedback')
      .send({ feedback: 'ACCEPTED' });

    expect(res.status).toBe(401);
  });

  it('should return 400 if feedback value is invalid', async () => {
    const res = await request(app)
      .patch('/api/v1/findings/some-id/feedback')
      .set('Cookie', [`token=${authToken}`])
      .send({ feedback: 'INVALID_FEEDBACK' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('should return 404 if finding does not belong to user', async () => {
    vi.mocked(prisma.finding.findUnique).mockResolvedValueOnce({
      id: 'find-other',
      review: { userId: 'different-user-uuid' },
    } as any);

    const res = await request(app)
      .patch('/api/v1/findings/find-other/feedback')
      .set('Cookie', [`token=${authToken}`])
      .send({ feedback: 'ACCEPTED' });

    expect(res.status).toBe(404);
  });

  it('should update feedback to ACCEPTED and return 200', async () => {
    vi.mocked(prisma.finding.findUnique).mockResolvedValueOnce({
      id: 'find-mine',
      review: { userId: testUserId },
    } as any);

    vi.mocked(prisma.finding.update).mockResolvedValueOnce({
      id: 'find-mine',
      reviewId: 'rev-1',
      file: 'src/app.ts',
      line: 10,
      severity: 'HIGH',
      category: 'SECURITY',
      message: 'Secret detected',
      suggestion: 'Fix secret',
      feedback: 'ACCEPTED',
      createdAt: new Date(),
    });

    const res = await request(app)
      .patch('/api/v1/findings/find-mine/feedback')
      .set('Cookie', [`token=${authToken}`])
      .send({ feedback: 'ACCEPTED' });

    expect(res.status).toBe(200);
    expect(res.body.finding.feedback).toBe('ACCEPTED');
    expect(prisma.finding.update).toHaveBeenCalledWith({
      where: { id: 'find-mine' },
      data: { feedback: 'ACCEPTED' },
    });
  });
});
