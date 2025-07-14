import http from 'http';
import mongoose from 'mongoose';
import { Server as IOServer } from 'socket.io';
import app from './app';
import config from './app/config';
import { socket } from './app/socket';

let server: http.Server | null = null;

// Start the server
const main = async (): Promise<void> => {
  try {
    await mongoose.connect(config.database_url);
    console.log('✅ MongoDB connected');

    server = http.createServer(app);

    const io = new IOServer(server, {
      cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    socket(io);

    server.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
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

    if (server) {
      server.close(() => {
        console.log('🔒 HTTP server closed');
        process.exit(0);
      });

      // Force exit if server doesn't close in 5 seconds
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

// Start the server
main();
