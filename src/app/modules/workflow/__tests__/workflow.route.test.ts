/**
 * workflow.route.test.ts
 *
 * Integration tests for the Workflow HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import supertest from 'supertest';

// ── Mock service ─────────────────────────────────────────────────────────────
jest.mock('../workflow.service', () => ({
  WorkflowService: {
    startWorkflow: jest.fn(),
    updateWorkflowStage: jest.fn(),
    getWorkflowByNewsId: jest.fn(),
    getAllWorkflows: jest.fn(),
  },
}));

// ── Stub middlewares ──────────────────────────────────────────────────────────
jest.mock('../../../middlewares/auth.middleware', () => {
  return jest.fn(() => (req: any, _res: any, next: any) => {
    req.user = { _id: '507f1f77bcf86cd799439011', role: 'admin' };
    next();
  });
});

jest.mock('../../../middlewares/validation.middleware', () => {
  return jest.fn(() => (_req: any, _res: any, next: any) => next());
});

import workflowRoutes from '../workflow.route';
import { WorkflowService } from '../workflow.service';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/workflow', workflowRoutes);
  return app;
};

const app = buildApp();
const request = supertest(app);

const mockWorkflowData = {
  _id: '507f1f77bcf86cd799439011',
  news: '507f1f77bcf86cd799439012',
  current_stage: 'drafting',
  stages: [{ stage_name: 'drafting', status: 'pending' }],
};

// ─── POST /api/workflow/start ──────────────────────────────────────────────────

describe('POST /api/workflow/start', () => {
  it('should return 201 and start workflow', async () => {
    (WorkflowService.startWorkflow as jest.Mock).mockResolvedValue(
      mockWorkflowData,
    );

    const res = await request
      .post('/api/workflow/start')
      .send({ news: '507f1f77bcf86cd799439012' });

    expect(res.status).toBe(httpStatus.CREATED);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockWorkflowData);
  });
});

// ─── PATCH /api/workflow/:id/stage ───────────────────────────────────────────

describe('PATCH /api/workflow/:id/stage', () => {
  it('should update stage and return 200', async () => {
    const updated = { ...mockWorkflowData, current_stage: 'editing' };
    (WorkflowService.updateWorkflowStage as jest.Mock).mockResolvedValue(
      updated,
    );

    const res = await request
      .patch('/api/workflow/507f1f77bcf86cd799439011/stage')
      .send({ stage_name: 'drafting', status: 'approved' });

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data.current_stage).toBe('editing');
  });
});

// ─── GET /api/workflow/news/:newsId ──────────────────────────────────────────

describe('GET /api/workflow/news/:newsId', () => {
  it('should return workflow for a news article', async () => {
    (WorkflowService.getWorkflowByNewsId as jest.Mock).mockResolvedValue(
      mockWorkflowData,
    );

    const res = await request.get(
      '/api/workflow/news/507f1f77bcf86cd799439012',
    );

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toEqual(mockWorkflowData);
  });
});
