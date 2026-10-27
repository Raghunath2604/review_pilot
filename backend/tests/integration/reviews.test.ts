import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../../src/app.js';
import { prisma } from '../../src/db/prisma.js';
import { env } from '../../src/config/env.js';
import { setLlmService, MockLlmService } from '../../src/services/llm/index.js';

vi.mock('../../src/db/prisma.js', () => ({
  prisma: {
    review: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    finding: {
      createMany: vi.fn(),
    },
    $transaction: vi.fn((callback) =>
      callback({
        finding: {
          createMany: vi.fn(),
        },
        review: {
          update: vi.fn(),
        },
      })
    ),
    $disconnect: vi.fn(),
  },
}));

describe('Reviews Integration Tests', () => {
  const testUserId = 'user-uuid-101';
  let authToken: string;
  let mockLlm: MockLlmService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLlm = new MockLlmService();
    setLlmService(mockLlm);
    authToken = jwt.sign({ userId: testUserId, email: 'test@example.com' }, env.JWT_SECRET, {
      expiresIn: '1h',
    });
  });

  describe('POST /api/v1/reviews', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .send({ sourceType: 'DIFF', diff: '+ const a = 1;' });

      expect(res.status).toBe(401);
    });

    it('should return 400 when diff is empty for DIFF sourceType', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Cookie', [`token=${authToken}`])
        .send({ sourceType: 'DIFF', diff: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should return 400 when prUrl is invalid for GITHUB_PR sourceType', async () => {
      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Cookie', [`token=${authToken}`])
        .send({ sourceType: 'GITHUB_PR', prUrl: 'https://other-site.com/repo/1' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should successfully create review with DIFF, call LLM, and persist findings', async () => {
      const mockCreatedReview = {
        id: 'rev-uuid-1',
        userId: testUserId,
        sourceType: 'DIFF',
        sourceRef: 'Unified Diff Submission',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockCompletedReview = {
        ...mockCreatedReview,
        status: 'COMPLETED',
        findings: [
          {
            id: 'find-1',
            reviewId: 'rev-uuid-1',
            file: 'src/auth.ts',
            line: 12,
            severity: 'HIGH',
            category: 'SECURITY',
            message: 'Potential secret detected',
            suggestion: 'Use env var',
            feedback: 'PENDING',
            createdAt: new Date(),
          },
        ],
      };

      vi.mocked(prisma.review.create).mockResolvedValueOnce(mockCreatedReview as any);
      vi.mocked(prisma.$transaction).mockResolvedValueOnce(mockCompletedReview as any);

      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Cookie', [`token=${authToken}`])
        .send({
          sourceType: 'DIFF',
          diff: '+ const secret = "super-secret";',
        });

      expect(res.status).toBe(201);
      expect(res.body.review).toBeDefined();
      expect(res.body.review.status).toBe('COMPLETED');
      expect(res.body.review.findings).toHaveLength(1);
    });

    it('should handle LLM failure gracefully: mark status as FAILED and return 502', async () => {
      mockLlm.setFailure(true, 'Anthropic API connection timeout');

      const mockCreatedReview = {
        id: 'rev-uuid-fail',
        userId: testUserId,
        sourceType: 'DIFF',
        status: 'PENDING',
      };

      vi.mocked(prisma.review.create).mockResolvedValueOnce(mockCreatedReview as any);
      vi.mocked(prisma.review.update).mockResolvedValueOnce({
        ...mockCreatedReview,
        status: 'FAILED',
        failureReason: 'Anthropic API connection timeout',
      } as any);

      const res = await request(app)
        .post('/api/v1/reviews')
        .set('Cookie', [`token=${authToken}`])
        .send({
          sourceType: 'DIFF',
          diff: '+ const x = 1;',
        });

      expect(res.status).toBe(502);
      expect(res.body.error).toContain('AI Review failed');
      expect(prisma.review.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'rev-uuid-fail' },
          data: expect.objectContaining({ status: 'FAILED' }),
        })
      );
    });
  });

  describe('GET /api/v1/reviews', () => {
    it('should return paginated list of user reviews', async () => {
      vi.mocked(prisma.review.count).mockResolvedValueOnce(1);
      vi.mocked(prisma.review.findMany).mockResolvedValueOnce([
        {
          id: 'rev-uuid-1',
          sourceType: 'DIFF',
          sourceRef: 'Direct Diff',
          status: 'COMPLETED',
          failureReason: null,
          createdAt: new Date(),
          _count: { findings: 3 },
        } as any,
      ]);

      const res = await request(app)
        .get('/api/v1/reviews?page=1&limit=10')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.reviews).toHaveLength(1);
      expect(res.body.reviews[0].findingsCount).toBe(3);
      expect(res.body.total).toBe(1);
    });
  });

  describe('GET /api/v1/reviews/:id', () => {
    it('should return 404 if review does not exist or belongs to another user', async () => {
      vi.mocked(prisma.review.findUnique).mockResolvedValueOnce({
        id: 'rev-other',
        userId: 'different-user-uuid',
      } as any);

      const res = await request(app)
        .get('/api/v1/reviews/rev-other')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(404);
    });

    it('should return review details with findings when user is authorized', async () => {
      const mockDetail = {
        id: 'rev-mine',
        userId: testUserId,
        sourceType: 'DIFF',
        status: 'COMPLETED',
        findings: [
          {
            id: 'find-10',
            file: 'src/main.ts',
            line: 5,
            severity: 'MEDIUM',
            category: 'PERFORMANCE',
            message: 'Slow query',
            suggestion: 'Add index',
          },
        ],
      };

      vi.mocked(prisma.review.findUnique).mockResolvedValueOnce(mockDetail as any);

      const res = await request(app)
        .get('/api/v1/reviews/rev-mine')
        .set('Cookie', [`token=${authToken}`]);

      expect(res.status).toBe(200);
      expect(res.body.review.id).toBe('rev-mine');
      expect(res.body.review.findings).toHaveLength(1);
    });
  });
});
