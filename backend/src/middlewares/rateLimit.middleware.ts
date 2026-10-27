import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { AuthenticatedRequest } from '../types/index.js';

export const reviewRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 1 hour by default
  max: env.RATE_LIMIT_MAX_REVIEWS, // 10 reviews per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req as AuthenticatedRequest).user?.userId || req.ip || 'anonymous';
  },
  handler: (_req, res) => {
    res.status(429).json({
      error: `Rate limit exceeded. You can submit up to ${env.RATE_LIMIT_MAX_REVIEWS} code reviews per hour.`,
    });
  },
});
