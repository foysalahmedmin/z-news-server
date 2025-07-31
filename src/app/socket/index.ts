import { createAdapter } from '@socket.io/redis-adapter';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Server as IOServer, Socket } from 'socket.io';
import config from '../config';
import { TJwtPayload } from '../modules/auth/auth.type';
import { pubClient, subClient } from '../redis';

export let io: IOServer;

// Socket.io
export const socket = async (server: http.Server) => {
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
    try {
      if (!pubClient.isOpen) await pubClient.connect();
      if (!subClient.isOpen) await subClient.connect();

      io.adapter(createAdapter(pubClient, subClient));
      console.log('✅ Redis adapter connected');
    } catch (err) {
      console.warn('⚠️ Redis adapter connection failed:', err);

      setTimeout(connectRedisAdapter, 10000);
    }
  };

  connectRedisAdapter();

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
