import { prisma } from '../db/prisma.js';
import { AppError } from '../middlewares/error.middleware.js';
import { Feedback } from '@prisma/client';

export class FindingService {
  static async updateFeedback(userId: string, findingId: string, feedback: Feedback) {
    const finding = await prisma.finding.findUnique({
      where: { id: findingId },
      include: {
        review: {
          select: { userId: true },
        },
      },
    });

    if (!finding || finding.review.userId !== userId) {
      throw new AppError('Finding not found or unauthorized access', 404);
    }

    const updated = await prisma.finding.update({
      where: { id: findingId },
      data: { feedback },
    });

    return updated;
  }
}
