import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const { method, originalUrl } = req;
    const { statusCode } = res;

    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger.log(level, `HTTP ${method} ${originalUrl} ${statusCode}`, {
      requestId,
      durationMs,
      context: {
        method,
        path: originalUrl,
        statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
    });
  });

  next();
};
