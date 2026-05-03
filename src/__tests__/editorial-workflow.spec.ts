/**
 * Integration: Editorial Workflow Flow
 *
 * Tests the editorial approval journey:
 *   start workflow → update stage → get by news id → get all
 *
 * Also tests news validation guards: invalid payloads return 400.
 */

import express from 'express';
import httpStatus from 'http-status';
import mongoose from 'mongoose';
import supertest from 'supertest';

jest.mock('../modules/workflow/workflow.service');
jest.mock('../modules/news/news.service');
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
  jest.fn(() => (req: { files?: unknown }, _res: unknown, next: () => void) => {
    req.files = {};
    next();
  }),
);
jest.mock('../middlewares/guest.middleware', () =>
  jest.fn(() => (_req: unknown, _res: unknown, next: () => void) => next()),
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

import { WorkflowService } from '../modules/workflow/workflow.service';
import * as NewsService from '../modules/news/news.service';
import app from '../app';

const agent = supertest(app);

const newsId = new mongoose.Types.ObjectId().toString();
const workflowId = new mongoose.Types.ObjectId().toString();

const mockWorkflow = {
  _id: workflowId,
  news: newsId,
  current_stage: 'review',
  status: 'in_progress',
  initiated_by: '507f1f77bcf86cd799439011',
};

describe('Editorial Workflow Integration', () => {
  afterEach(() => jest.clearAllMocks());

  describe('POST /api/workflow/start — start workflow', () => {
    it('starts an editorial workflow for a news article', async () => {
      (WorkflowService.startWorkflow as jest.Mock).mockResolvedValue(
        mockWorkflow,
      );

      const res = await agent
        .post('/api/workflow/start')
        .set('Authorization', 'Bearer token')
        .send({ news: newsId });

      expect(res.status).toBe(httpStatus.CREATED);
      expect(res.body.success).toBe(true);
    });

    it('returns 400 for missing news id', async () => {
      const res = await agent
        .post('/api/workflow/start')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
  });

  describe('PATCH /api/workflow/:id/stage — update stage', () => {
    it('updates the workflow stage', async () => {
      (WorkflowService.updateWorkflowStage as jest.Mock).mockResolvedValue({
        ...mockWorkflow,
        current_stage: 'approved',
      });

      const res = await agent
        .patch(`/api/workflow/${workflowId}/stage`)
        .set('Authorization', 'Bearer token')
        .send({ stage_name: 'editorial-review', status: 'approved', comments: 'Looks good' });

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/workflow/news/:newsId — get by news', () => {
    it('returns workflow for a specific news article', async () => {
      (WorkflowService.getWorkflowByNewsId as jest.Mock).mockResolvedValue(
        mockWorkflow,
      );

      const res = await agent
        .get(`/api/workflow/news/${newsId}`)
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/workflow — get all', () => {
    it('returns list of all workflows for admin', async () => {
      (WorkflowService.getAllWorkflows as jest.Mock).mockResolvedValue({
        data: [mockWorkflow],
        meta: { total: 1, page: 1, limit: 10, total_pages: 1 },
      });

      const res = await agent
        .get('/api/workflow')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(httpStatus.OK);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Validation guards on news creation', () => {
    it('rejects news with invalid canonical_url', async () => {
      const res = await agent
        .post('/api/news')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          content: '<p>Content</p>',
          content_type: 'article',
          canonical_url: 'not-a-valid-url-###',
        });

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('rejects news with invalid sensitivity_level', async () => {
      const res = await agent
        .post('/api/news')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          content: '<p>Content</p>',
          content_type: 'article',
          sensitivity_level: 'top-secret',
        });

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('rejects news with invalid content_type', async () => {
      const res = await agent
        .post('/api/news')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Test',
          content: '<p>Content</p>',
          content_type: 'invalid-type',
        });

      expect(res.status).toBe(httpStatus.BAD_REQUEST);
    });
  });
});
