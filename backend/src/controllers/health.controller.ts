import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';

export class HealthController {
  static async check(_req: Request, res: Response): Promise<void> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.status(200).json({
        status: 'ok',
        db: 'connected',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'degraded',
        db: 'disconnected',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
