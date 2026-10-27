import { Response, NextFunction } from 'express';
import { StatsService } from '../services/stats.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class StatsController {
  static async getStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const stats = await StatsService.getUserStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }
}
