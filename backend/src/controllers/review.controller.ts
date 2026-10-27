import { Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ReviewController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const review = await ReviewService.createReview(userId, req.body);
      res.status(201).json({ review });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;

      const data = await ReviewService.getReviews(userId, page, limit);
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const reviewId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const review = await ReviewService.getReviewById(userId, reviewId);
      res.status(200).json({ review });
    } catch (error) {
      next(error);
    }
  }
}
