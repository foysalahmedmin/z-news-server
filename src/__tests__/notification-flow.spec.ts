/**
 * Integration: Notification Flow
 *
 * Tests the notification lifecycle:
 *   create → get all (admin) → get mine → mark as read → read all
 *
 * Services are mocked; validation middleware and error handler run real.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

jest.mock('../modules/notification/notification.service');
jest.mock('../modules/notification-recipient/notification-recipient.service');
jest.mock('../config/redis', () => ({
  cacheClient: { get: jest.fn(), set: jest.fn(), del: jest.fn() },
  pubClient: {},
  subClient: {},
}));
jest.mock('../config/socket', () => ({}));
jest.mock('../middlewares/rate-limit.middleware', () => ({
  authRateLimiter: (_r: unknown, _s: unknown, next: () => void) => next(),
  forgetPasswordRateLimiter: (_r: unknown, _s: unknown, next: () => void) =>
    next(),
  globalRateLimiter: (_r: unknown, _s: unknown, next: () => void) => next(),
}));
jest.mock('../middlewares/file.middleware', () =>
  jest.fn(
    () =>
      (req: { files?: unknown }, _res: unknown, next: () => void) => {
        req.files = {};
        next();
      },
  ),
);
jest.mock('../middlewares/auth.middleware', () =>
  jest.fn(
    (..._roles: string[]) =>
      (
        req: express.Request,
        _res: express.Response,
        next: express.NextFunction,
      ) => {
        (req as express.Request & { user: unknown }).user = {
          _id: '507f1f77bcf86cd799439011',
          role: 'admin',
          name: 'Admin User',
          email: 'admin@example.com',
        };
        next();
      },
  ),
);

import * as NotificationService from '../modules/notification/notification.service';
import * as NotificationRecipientService from '../modules/notification-recipient/notification-recipient.service';
import app from '../app';

const agent = supertest(app);

const notificationId = new mongoose.Types.ObjectId().toString();
const recipientId = new mongoose.Types.ObjectId().toString();
const senderId = '507f1f77bcf86cd799439011';

const mockNotification = {
  _id: notificationId,
  title: 'Test Notification',
  message: 'This is a test notification',
  type: 'news-request',
  priority: 'medium',
  channels: ['web'],
  sender: senderId,
};

const mockRecipient = {
  _id: recipientId,
  notification: notificationId,
  recipient: senderId,
  is_read: false,
};

describe('Notification Flow Integration', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/notification — create', () => {
    it('creates a notification and returns 200', async () => {
      (NotificationService.createNotification as jest.Mock).mockResolvedValue(
        mockNotification,
      );

      const res = await agent
        .post('/api/notification')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test Notification',
          message: 'This is a test notification',
          type: 'news-request',
          channels: ['web'],
          sender: senderId,
        });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 for missing required fields', async () => {
      const res = await agent
        .post('/api/notification')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Only title' });

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('returns 400 for invalid type', async () => {
      const res = await agent
        .post('/api/notification')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          message: 'A message',
          type: 'invalid-type',
          channels: ['web'],
          sender: senderId,
        });

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
  });

  describe('GET /api/notification — get all (admin)', () => {
    it('returns paginated list of notifications', async () => {
      (NotificationService.getNotifications as jest.Mock).mockResolvedValue({
        data: [mockNotification],
        meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
      });

      const res = await agent
        .get('/api/notification')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(res.body.meta).toBeDefined();
    });
  });

  describe('GET /api/notification-recipient/self — get my notifications', () => {
    it('returns my notification recipients', async () => {
      (
        NotificationRecipientService.getSelfNotificationRecipients as jest.Mock
      ).mockResolvedValue([mockRecipient]);

      const res = await agent
        .get('/api/notification-recipient/self')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });
  });

  describe('PATCH /api/notification-recipient/read-all/self — mark all as read', () => {
    it('marks all notifications as read', async () => {
      (
        NotificationRecipientService.readAllNotificationRecipients as jest.Mock
      ).mockResolvedValue({ modifiedCount: 3 });

      const res = await agent
        .patch('/api/notification-recipient/read-all/self')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });
  });
});
