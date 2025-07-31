import { createAdapter } from '@socket.io/redis-adapter';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server as IOServer, Socket } from 'socket.io';
import config from '../config';
import { TJwtPayload } from '../modules/auth/auth.type';
import { pubClient, subClient } from '../redis';

export let io: IOServer;

// Socket.io
export const initializeSocket = async (server: http.Server) => {
  io = new IOServer(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:8080',
        'http://localhost:8081',
      ],
      methods: ['GET', 'POST'],
    },
  });

  const connectRedisAdapter = async () => {
    // Check if Redis is enabled in config
    if (!config.redis_enabled) {
      console.log('🔕 Redis adapter disabled by configuration');
      return;
    }

    try {
      // Check if Redis is available before connecting
      const pubConnected =
        pubClient.isOpen || (await connectWithTimeout(pubClient, 5000));
      const subConnected =
        subClient.isOpen || (await connectWithTimeout(subClient, 5000));

      if (pubConnected && subConnected) {
        io.adapter(createAdapter(pubClient, subClient));
        console.log('✅ Redis adapter connected successfully');
      } else {
        console.warn(
          '⚠️ Redis not available, running without adapter (single instance mode)',
        );
      }
    } catch (err) {
      console.warn('⚠️ Redis adapter connection failed:', err);
      console.log(
        '📝 Socket.io running in single instance mode (no clustering)',
      );
    }
  };

  // Helper function to connect with timeout
  const connectWithTimeout = async (
    client: any,
    timeout: number,
  ): Promise<boolean> => {
    try {
      if (client.isOpen) return true;

      await Promise.race([
        client.connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), timeout),
        ),
      ]);
      return true;
    } catch (error) {
      console.warn(`Redis client connection failed: ${error}`);
      return false;
    }
  };

  // Try to setup Redis adapter, but don't fail if Redis is unavailable
  await connectRedisAdapter();

  // Socket.io event listeners
  io.on('connection', (socket: Socket) => {
    const token = socket.handshake.auth?.token;
    const decoded = verifyToken(token);

    if (decoded) {
      const { _id, role } = decoded;
      if (_id && role) {
        socket.join(_id);
        socket.join(`role:${role}`);
        console.log(
          `✅ Authenticated socket | ${socket.id} | user: ${_id}, role: ${role}`,
        );
      }
    } else {
      console.log(`🟡 Guest/unauthenticated socket | ${socket.id}`);
    }

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected | ${socket.id}`);
    });
  });

  return io;
};

// JWT verification
function verifyToken(token: string): TJwtPayload | null {
  try {
    return jwt.verify(token, config.jwt_access_secret) as TJwtPayload;
  } catch {
    return null;
  }
}

// Optional: Getter for global io access
export const getIO = (): IOServer => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};
