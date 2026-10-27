import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './db/prisma.js';

const server = app.listen(env.PORT, () => {
  console.log(`[ReviewPilot API] Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
});

const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Gracefully shutting down...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Prisma client disconnected.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
