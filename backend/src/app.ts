import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import reviewRoutes from './routes/review.routes.js';
import findingRoutes from './routes/finding.routes.js';
import statsRoutes from './routes/stats.routes.js';
import healthRoutes from './routes/health.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';

export const createApp = () => {
  const app = express();

  // Correlation ID & Structured Access Logging
  app.use(requestLogger);

  // Security HTTP Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Parse Cookie Headers & JSON Payloads (250kb limit)
  app.use(cookieParser());
  app.use(express.json({ limit: '250kb' }));

  // API v1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/reviews', reviewRoutes);
  app.use('/api/v1/findings', findingRoutes);
  app.use('/api/v1', statsRoutes);

  // Health Check Routes (Root & API v1)
  app.use('/health', healthRoutes);
  app.use('/api/v1', healthRoutes);

  // 404 Not Found Handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
export default app;
