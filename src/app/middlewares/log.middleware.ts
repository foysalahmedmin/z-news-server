import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import mongoose, { Schema, Types } from 'mongoose';
import config from '../config';
import { TJwtPayload } from '../modules/auth/auth.type';

// Log type
type TLog = {
  user: Types.ObjectId;
  role: string;
  ip_address: string;
  user_agent: string;
  url: string;
  method: string;
  status: number;
  payload: any;
  response: any;
  duration: number;
  date: Date;
};

// Log schema
const logSchema = new mongoose.Schema<TLog>(
  {
    user: { type: Schema.Types.ObjectId },
    role: { type: String },
    ip_address: { type: String },
    user_agent: { type: String },
    url: { type: String },
    method: { type: String },
    status: { type: Number },
    payload: { type: Schema.Types.Mixed },
    response: { type: Schema.Types.Mixed },
    duration: { type: Number },
    date: { type: Date, default: Date.now },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

logSchema.index(
  { updated_at: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 30 * 3,
  },
);

// Log model
const Log = mongoose.model('Log', logSchema);

// Log Middleware
const log: RequestHandler = (req, res, next) => {
  const start = Date.now();

  // Hold response body
  const oldSend = res.send;
  let responseBody: any;

  // Override res.send to capture response
  (res.send as any) = function (body: any) {
    responseBody = body;
    return oldSend.apply(res, arguments as any);
  };

  res.on('finish', async () => {
    try {
      if (req.method === 'GET') return;

      const token = req.headers['authorization'];
      if (!token) return;

      let _id: string | undefined;
      let role: string | undefined;

      try {
        const decoded = jwt.verify(
          token,
          config.jwt_access_secret,
        ) as TJwtPayload;
        _id = decoded._id;
        role = decoded.role;
      } catch (_err) {
        return;
      }

      // Skip if user role is "user"
      if (!_id || !role || (role && role === 'user')) return;

      await Log.create({
        user: _id,
        role: role,
        ip_address: req.ip === '::1' ? '127.0.0.1' : req.ip,
        user_agent: req.get('User-Agent') || '',
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        payload: req.body,
        response: responseBody,
        duration: Date.now() - start,
        date: new Date(),
      });
    } catch (err) {
      console.error('Log save error:', err);
    }
  });

  next();
};

export default log;
