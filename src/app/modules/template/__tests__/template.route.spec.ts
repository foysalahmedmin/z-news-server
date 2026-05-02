/**
 * template.route.test.ts
 *
 * Integration tests for the Template HTTP routes.
 */

import express from 'express';
import httpStatus from 'http-status';
import supertest from 'supertest';

// ── Mock service ─────────────────────────────────────────────────────────────
jest.mock('../template.service', () => ({
  TemplateService: {
    createTemplate: jest.fn(),
    getAllTemplates: jest.fn(),
    getTemplateById: jest.fn(),
    updateTemplate: jest.fn(),
    deleteTemplate: jest.fn(),
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

import templateRoutes from '../template.route';
import { TemplateService } from '../template.service';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/template', templateRoutes);
  return app;
};

const app = buildApp();
const request = supertest(app);

const mockTemplateData = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Test Template',
  structure: { blocks: [] },
};

// ─── POST /api/template/create ────────────────────────────────────────────────

describe('POST /api/template/', () => {
  it('should return 201 and create template', async () => {
    (TemplateService.createTemplate as jest.Mock).mockResolvedValue(
      mockTemplateData,
    );

    const res = await request
      .post('/api/template/')
      .send({ name: 'Test Template', structure: {} });

    expect(res.status).toBe(httpStatus.CREATED);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockTemplateData);
  });
});

// ─── GET /api/template/ ──────────────────────────────────────────────────────

describe('GET /api/template/', () => {
  it('should return list of templates', async () => {
    (TemplateService.getAllTemplates as jest.Mock).mockResolvedValue([
      mockTemplateData,
    ]);

    const res = await request.get('/api/template/');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toEqual([mockTemplateData]);
  });
});

// ─── GET /api/template/:id ────────────────────────────────────────────────────

describe('GET /api/template/:id', () => {
  it('should return template by id', async () => {
    (TemplateService.getTemplateById as jest.Mock).mockResolvedValue(
      mockTemplateData,
    );

    const res = await request.get('/api/template/507f1f77bcf86cd799439011');

    expect(res.status).toBe(httpStatus.OK);
    expect(res.body.data).toEqual(mockTemplateData);
  });
});
