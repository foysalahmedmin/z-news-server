/**
 * poll.route.spec.ts
 *
 * Integration tests for the Poll HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

// ── Mock service and middlewares BEFORE importing routes ─────────────────────
jest.mock('../poll.service');
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { _id: 'user123', role: 'user' };
    next();
  });
});
jest.mock('../../../middlewares/guest.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});
jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import PollRoutes from '../poll.route';
import { PollService } from '../poll.service';

// ─── App Factory ──────────────────────────────────────────────────────────────

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/poll', PollRoutes);

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

describe('Poll Routes', () => {
  const mockId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/poll', () => {
    it('should return 200 when poll created', async () => {
      (PollService.createPoll as jest.Mock).mockResolvedValue({
        _id: mockId,
        title: 'Test Poll',
      });

      const res = await request.post('/api/poll').send({
        title: 'Test Poll',
        options: [{ text: 'A' }, { text: 'B' }],
        start_date: new Date(),
      });

      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body.success).toBe(true);
      expect(PollService.createPoll).toHaveBeenCalled();
    });
  });

  describe('GET /api/poll', () => {
    it('should return 200 with all polls', async () => {
      (PollService.getAllPolls as jest.Mock).mockResolvedValue([
        { _id: mockId },
      ]);

      const res = await request.get('/api/poll');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(PollService.getAllPolls).toHaveBeenCalled();
    });
  });

  describe('GET /api/poll/active', () => {
    it('should return 200 with active polls', async () => {
      (PollService.getActivePolls as jest.Mock).mockResolvedValue([
        { _id: mockId, is_active: true },
      ]);

      const res = await request.get('/api/poll/active');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(PollService.getActivePolls).toHaveBeenCalled();
    });
  });

  describe('GET /api/poll/:pollId', () => {
    it('should return 200 with poll details', async () => {
      (PollService.getPollById as jest.Mock).mockResolvedValue({
        _id: mockId,
        title: 'Test Poll',
        has_voted: false,
      });

      const res = await request.get(`/api/poll/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(PollService.getPollById).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/poll/:pollId', () => {
    it('should return 200 when poll updated', async () => {
      (PollService.updatePoll as jest.Mock).mockResolvedValue({
        _id: mockId,
        title: 'Updated Poll',
      });

      const res = await request
        .patch(`/api/poll/${mockId}`)
        .send({ title: 'Updated Poll' });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(PollService.updatePoll).toHaveBeenCalled();
    });
  });

  describe('POST /api/poll/:pollId/vote', () => {
    it('should return 200 when vote submitted', async () => {
      (PollService.vote as jest.Mock).mockResolvedValue({
        _id: mockId,
        total_votes: 1,
      });

      const res = await request
        .post(`/api/poll/${mockId}/vote`)
        .send({ option_indices: [0] });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(PollService.vote).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/poll/:pollId', () => {
    it('should return 200 when poll deleted', async () => {
      (PollService.deletePoll as jest.Mock).mockResolvedValue(undefined);

      const res = await request.delete(`/api/poll/${mockId}`);

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
      expect(PollService.deletePoll).toHaveBeenCalled();
    });
  });
});
