import { Response, NextFunction } from 'express';
import { FindingService } from '../services/finding.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class FindingController {
  static async updateFeedback(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const findingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { feedback } = req.body;

      const finding = await FindingService.updateFeedback(userId, findingId, feedback);
      res.status(200).json({ finding });
    } catch (error) {
      next(error);
    }
  }
}
