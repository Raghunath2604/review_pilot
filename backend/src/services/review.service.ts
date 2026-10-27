import { prisma } from '../db/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';
import { CreateReviewInput } from '../schemas/review.schema.js';
import { GitHubService } from './github.service.js';
import { getLlmService } from './llm/index.js';
import { FindingOutput } from './llm/llm.interface.js';

export class ReviewService {
  static async createReview(userId: string, input: CreateReviewInput) {
    let diffContent = '';

    // 1. Resolve diff content
    if (input.sourceType === 'DIFF') {
      diffContent = input.diff || '';
    } else if (input.sourceType === 'GITHUB_PR') {
      if (!input.prUrl) {
        throw new AppError('GitHub PR URL is required', 400);
      }
      diffContent = await GitHubService.fetchPrDiff(input.prUrl);
    }

    const sourceRef =
      input.sourceType === 'GITHUB_PR' ? input.prUrl : 'Unified Diff Submission';

    // 2. Create initial review record with PENDING status
    const review = await prisma.review.create({
      data: {
        userId,
        sourceType: input.sourceType,
        sourceRef,
        status: 'PENDING',
      },
    });

    // 3. Process LLM review with graceful failure handling
    try {
      const llmService = getLlmService();
      const findings: FindingOutput[] = await llmService.reviewDiff(diffContent);

      // Save findings and mark review as COMPLETED in a single transaction
      const updatedReview = await prisma.$transaction(async (tx) => {
        if (findings.length > 0) {
          await tx.finding.createMany({
            data: findings.map((f) => ({
              reviewId: review.id,
              file: f.file,
              line: f.line,
              severity: f.severity,
              category: f.category,
              message: f.message,
              suggestion: f.suggestion,
              feedback: 'PENDING',
            })),
          });
        }

        return tx.review.update({
          where: { id: review.id },
          data: { status: 'COMPLETED' },
          include: {
            findings: {
              orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }],
            },
          },
        });
      });

      return updatedReview;
    } catch (err) {
      // Mark review as FAILED with friendly user explanation without crashing
      const errorMessage = (err as Error).message || 'Failed to complete AI code review';
      await prisma.review.update({
        where: { id: review.id },
        data: {
          status: 'FAILED',
          failureReason: errorMessage,
        },
      });

      throw new AppError(`AI Review failed: ${errorMessage}`, 502);
    }
  }

  static async getReviews(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where: { userId } }),
      prisma.review.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { findings: true },
          },
        },
      }),
    ]);

    return {
      reviews: reviews.map((r) => ({
        id: r.id,
        sourceType: r.sourceType,
        sourceRef: r.sourceRef,
        status: r.status,
        failureReason: r.failureReason,
        createdAt: r.createdAt,
        findingsCount: r._count.findings,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  static async getReviewById(userId: string, reviewId: string) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        findings: {
          orderBy: [{ severity: 'desc' }, { createdAt: 'asc' }],
        },
      },
    });

    if (!review || review.userId !== userId) {
      throw new AppError('Review not found or unauthorized access', 404);
    }

    return review;
  }
}
