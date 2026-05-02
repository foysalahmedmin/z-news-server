/**
 * user-profile.route.spec.ts
 *
 * Integration tests for the UserProfile HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

// ── Mock service and middlewares BEFORE importing routes ─────────────────────
jest.mock('../user-profile.service');
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { _id: 'user123', role: 'user' };
    next();
  });
});
jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import UserProfileRoutes from '../user-profile.route';
import { UserProfileService } from '../user-profile.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/user-profile', UserProfileRoutes);

  app.use((err: any, _req: any, res: any, _next: any) => {
    res
      .status(err.status || 500)
      .json({ success: false, message: err.message });
  });

  return app;
};

const app = buildApp();
const request = supertest(app);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('UserProfile Routes', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockAuthorId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/user-profile/me', () => {
    it('should return 200 with my profile', async () => {
      (UserProfileService.createOrGetProfile as jest.Mock).mockResolvedValue({
        user: 'user123',
        bio: 'My bio',
      });

      const res = await request.get('/api/user-profile/me');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(UserProfileService.createOrGetProfile).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/user-profile/me', () => {
    it('should return 200 when profile updated', async () => {
      (UserProfileService.updateProfile as jest.Mock).mockResolvedValue({
        user: 'user123',
        bio: 'Updated bio',
      });

      const res = await request
        .patch('/api/user-profile/me')
        .send({ bio: 'Updated bio' });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(UserProfileService.updateProfile).toHaveBeenCalled();
    });
  });

  describe('GET /api/user-profile/top', () => {
    it('should return 200 with top users', async () => {
      (UserProfileService.getTopUsersByReputation as jest.Mock).mockResolvedValue(
        [{ user: mockUserId, reputation_score: 100 }],
      );

      const res = await request.get('/api/user-profile/top');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(UserProfileService.getTopUsersByReputation).toHaveBeenCalled();
    });
  });

  describe('GET /api/user-profile/:userId', () => {
    it('should return 200 with user profile', async () => {
      (UserProfileService.getProfileByUserId as jest.Mock).mockResolvedValue({
        user: mockUserId,
      });

      const res = await request.get(`/api/user-profile/${mockUserId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(UserProfileService.getProfileByUserId).toHaveBeenCalledWith(
        mockUserId,
      );
    });
  });

  describe('POST /api/user-profile/follow/author', () => {
    it('should return 200 when following an author', async () => {
      (UserProfileService.followAuthor as jest.Mock).mockResolvedValue({
        following_authors: [mockAuthorId],
      });

      const res = await request
        .post('/api/user-profile/follow/author')
        .send({ authorId: mockAuthorId });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(UserProfileService.followAuthor).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/user-profile/follow/author/:authorId', () => {
    it('should return 200 when unfollowing an author', async () => {
      (UserProfileService.unfollowAuthor as jest.Mock).mockResolvedValue({
        following_authors: [],
      });

      const res = await request.delete(
        `/api/user-profile/follow/author/${mockAuthorId}`,
      );

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(UserProfileService.unfollowAuthor).toHaveBeenCalled();
    });
  });
});
