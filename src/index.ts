/* eslint-disable no-console */
import cluster from 'cluster';
import http from 'http';
import mongoose from 'mongoose';
import os from 'os';
import app from './app';
import config from './app/config';
import { initScheduler } from './app/modules/scheduler/scheduler.job';
import {
  cacheClient,
  initializeRedis,
  pubClient,
  subClient,
} from './app/redis';
import { initializeSocket } from './app/socket';

let server: http.Server | null = null;

// Start the server
const main = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database_url);
    console.log(`✅ MongoDB connected - PID: ${process.pid}`);

    // Initialize background jobs (only once in clustered mode or always in single mode)
    // In cluster mode, we might want to run this only in the primary or a specific worker.
    // For simplicity, we run it here. In production with multiple instances, use a job queue like Agenda or Bull.
    if (
      !config.cluster_enabled ||
      (cluster.isWorker && cluster.worker?.id === 1)
    ) {
      initScheduler();
    }

    try {
      await initializeRedis();
      console.log(`🔌 Redis initialized - PID: ${process.pid}`);
    } catch (redisErr) {
      console.warn(`⚠️ Redis setup failed - PID: ${process.pid}`, redisErr);
    }

    server = http.createServer(app);

    try {
      await initializeSocket(server);
      console.log(`🔌 Socket.io initialized - PID: ${process.pid}`);
    } catch (socketErr) {
      console.warn(
        `⚠️ Socket.io setup failed - PID: ${process.pid}`,
        socketErr,
      );
    }

    server.listen(config.port, () => {
      console.log(`🚀 Worker ${process.pid} listening on port ${config.port}`);
    });
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Gracefully shuts down server and database connections.
const shutdown = async (reason: string): Promise<void> => {
  console.log(`🛑 Shutdown initiated: ${reason}`);
  try {
    // Disconnect MongoDB
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');

    // Disconnect Redis cache
    if (cacheClient.isOpen) {
      await cacheClient.quit();
      console.log('🔌 Redis (cache) disconnected');
    }

    // Disconnect Socket.io Redis clients
    if (pubClient.isOpen) {
      await pubClient.quit();
      console.log('🔌 Redis (pub) disconnected');
    }

    if (subClient.isOpen) {
      await subClient.quit();
      console.log('🔌 Redis (sub) disconnected');
    }

    // Close HTTP server
    if (server) {
      server.close(() => {
        console.log('🔒 HTTP server closed');
        process.exit(0);
      });

      // Fallback if server doesn't close in time
      setTimeout(() => {
        console.error('⏱ Server shutdown timed out, forcing exit.');
        process.exit(1);
      }, 5000);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle termination signals for graceful shutdown
process.on('SIGINT', () => shutdown('SIGINT (Ctrl+C)'));
process.on('SIGTERM', () => shutdown('SIGTERM (system kill)'));
process.on('SIGQUIT', () => shutdown('SIGQUIT (quit signal)'));

// Handle unexpected errors and promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('Unhandled Promise Rejection');
});
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown('Uncaught Exception');
});

// Cluster
const numCPUs = os.cpus().length;
const workersToUse = Math.max(1, Math.floor(numCPUs * 0.75));

if (config.cluster_enabled && cluster.isPrimary) {
  console.log(`👑 Primary ${process.pid} is running`);
  for (let i = 0; i < workersToUse; i++) {
    cluster.fork();
  }

  let restartCount = 0;
  const MAX_RESTARTS = 5;
  const RESTART_WINDOW = 60000;
  let firstRestartTime = Date.now();

  cluster.on('exit', (worker) => {
    const now = Date.now();

    if (now - firstRestartTime > RESTART_WINDOW) {
      // Reset restart window
      firstRestartTime = now;
      restartCount = 0;
    }

    if (restartCount < MAX_RESTARTS) {
      console.warn(`⚰️ Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
      restartCount++;
    } else {
      console.error(
        `❌ Too many restarts (${restartCount}) in 1 minute. Not restarting further.`,
      );
    }
  });
} else {
  main();
}
