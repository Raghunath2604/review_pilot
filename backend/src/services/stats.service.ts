import { prisma } from '../db/prisma.js';
import { Category, Severity } from '@prisma/client';

export class StatsService {
  static async getUserStats(userId: string) {
    const [
      totalReviews,
      totalFindings,
      acceptedCount,
      falsePositiveCount,
      pendingCount,
      categoryGroups,
      severityGroups,
    ] = await Promise.all([
      prisma.review.count({ where: { userId } }),
      prisma.finding.count({ where: { review: { userId } } }),
      prisma.finding.count({ where: { review: { userId }, feedback: 'ACCEPTED' } }),
      prisma.finding.count({ where: { review: { userId }, feedback: 'FALSE_POSITIVE' } }),
      prisma.finding.count({ where: { review: { userId }, feedback: 'PENDING' } }),
      prisma.finding.groupBy({
        by: ['category'],
        where: { review: { userId } },
        _count: { category: true },
      }),
      prisma.finding.groupBy({
        by: ['severity'],
        where: { review: { userId } },
        _count: { severity: true },
      }),
    ]);

    const totalVerified = acceptedCount + falsePositiveCount;
    const precisionPercentage =
      totalVerified > 0
        ? parseFloat(((acceptedCount / totalVerified) * 100).toFixed(1))
        : 0;

    // Normalize category counts with zero defaults
    const byCategory: Record<Category, number> = {
      BUG: 0,
      SECURITY: 0,
      PERFORMANCE: 0,
      TESTING: 0,
      STYLE: 0,
    };
    categoryGroups.forEach((group) => {
      byCategory[group.category] = group._count.category;
    });

    // Normalize severity counts with zero defaults
    const bySeverity: Record<Severity, number> = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
    severityGroups.forEach((group) => {
      bySeverity[group.severity] = group._count.severity;
    });

    return {
      totalReviews,
      totalFindings,
      acceptedCount,
      falsePositiveCount,
      pendingCount,
      precisionPercentage,
      byCategory,
      bySeverity,
    };
  }
}
