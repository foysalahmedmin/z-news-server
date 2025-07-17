import cluster from 'cluster';
import http from 'http';
import mongoose from 'mongoose';
import os from 'os';
import app from './app';
import config from './app/config';
import { cacheClient } from './app/redis';
import { socket } from './app/socket';

let server: http.Server | null = null;

// Start the server
const main = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database_url);
    console.log(`✅ MongoDB connected - PID: ${process.pid}`);

    await cacheClient.connect();
    console.log(`🔌 Redis (cache) connected - PID: ${process.pid}`);

    server = http.createServer(app);
    await socket(server);

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
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
    await cacheClient.quit();
    console.log('🔌 Redis (cache) disconnected');

    if (server) {
      server.close(() => {
        console.log('🔒 HTTP server closed');
        process.exit(0);
      });

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

if (cluster.isPrimary) {
  console.log(`👑 Primary ${process.pid} is running`);
  for (let i = 0; i < workersToUse; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, _code, _signal) => {
    console.warn(`⚰️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  main();
}
