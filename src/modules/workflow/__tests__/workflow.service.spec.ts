/**
 * workflow.service.test.ts
 *
 * Unit tests for the Workflow Service layer.
 */

import httpStatus from 'http-status';
import { Types } from 'mongoose';

// ── Mock dependencies ─────────────────────────────────────────────────────────
jest.mock('../workflow.repository');
jest.mock('../../news/news.model', () => ({
  News: {
    findById: jest.fn(),
  },
}));
jest.mock('../../user/user.model', () => ({ User: { findById: jest.fn() } }));
jest.mock('../../notification/notification.service', () => ({
  sendNewsNotification: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('mongoose', () => {
  const actual = jest.requireActual('mongoose');
  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn(),
  };
  return {
    ...actual,
    startSession: jest.fn().mockResolvedValue(mockSession),
  };
});

import { News } from '../../news/news.model';
import * as WorkflowRepository from '../workflow.repository';
import { WorkflowService } from '../workflow.service';
import { TWorkflow } from '../workflow.type';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockWorkflow = (overrides: Partial<TWorkflow> = {}): TWorkflow =>
  ({
    _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
    news: new Types.ObjectId('507f1f77bcf86cd799439012'),
    current_stage: 'drafting',
    stages: [
      { stage_name: 'drafting', status: 'pending' },
      { stage_name: 'editing', status: 'pending' },
    ],
    priority: 'medium',
    is_deleted: false,
    ...overrides,
  }) as unknown as TWorkflow;

const mockNews = (overrides = {}) => ({
  _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
  status: 'draft',
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

// ─── startWorkflow ───────────────────────────────────────────────────────────

describe('WorkflowService.startWorkflow', () => {
  it('should start a workflow successfully', async () => {
    const news = mockNews();
    const workflow = mockWorkflow();

    (News.findById as jest.Mock).mockResolvedValue(news);
    (WorkflowRepository.findOne as jest.Mock).mockResolvedValue(null);
    (WorkflowRepository.create as jest.Mock).mockResolvedValue(workflow);

    const result = await WorkflowService.startWorkflow({
      news: news._id as any,
    });

    expect(News.findById).toHaveBeenCalledWith(news._id);
    expect(WorkflowRepository.create).toHaveBeenCalled();
    expect(result).toEqual(workflow);
  });

  it('should throw NOT_FOUND if news article does not exist', async () => {
    (News.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      WorkflowService.startWorkflow({
        news: '507f1f77bcf86cd799439012' as any,
      }),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });

  it('should throw BAD_REQUEST if workflow already exists', async () => {
    (News.findById as jest.Mock).mockResolvedValue(mockNews());
    (WorkflowRepository.findOne as jest.Mock).mockResolvedValue(mockWorkflow());

    await expect(
      WorkflowService.startWorkflow({
        news: '507f1f77bcf86cd799439012' as any,
      }),
    ).rejects.toMatchObject({ status: httpStatus.BAD_REQUEST });
  });
});

// ─── updateWorkflowStage ──────────────────────────────────────────────────────

describe('WorkflowService.updateWorkflowStage', () => {
  it('should update stage and move to next stage on approval', async () => {
    const workflowDoc = {
      ...mockWorkflow(),
      save: jest.fn().mockResolvedValue(true),
    } as any;
    (WorkflowRepository.findById as jest.Mock).mockResolvedValue(workflowDoc);

    const result = await WorkflowService.updateWorkflowStage(
      workflowDoc._id.toString(),
      {
        stage_name: 'drafting',
        status: 'approved',
      },
    );

    expect(workflowDoc.stages[0].status).toBe('approved');
    expect(workflowDoc.current_stage).toBe('editing');
    expect(workflowDoc.save).toHaveBeenCalled();
    expect(result).toEqual(workflowDoc);
  });

  it('should publish news if last stage is approved', async () => {
    const news = mockNews({ status: 'draft' });
    const workflowDoc = {
      ...mockWorkflow({
        current_stage: 'editing',
        stages: [{ stage_name: 'editing', status: 'pending' }],
      }),
      save: jest.fn().mockResolvedValue(true),
    } as any;

    (WorkflowRepository.findById as jest.Mock).mockResolvedValue(workflowDoc);
    (News.findById as jest.Mock).mockReturnValue({
      session: jest.fn().mockResolvedValue(news),
    });

    await WorkflowService.updateWorkflowStage(workflowDoc._id.toString(), {
      stage_name: 'editing',
      status: 'approved',
    });

    expect(news.status).toBe('published');
    expect(news.save).toHaveBeenCalled();
  });
});

// ─── getWorkflowByNewsId ──────────────────────────────────────────────────────

describe('WorkflowService.getWorkflowByNewsId', () => {
  it('should return workflow if found', async () => {
    const workflow = mockWorkflow();
    (WorkflowRepository.findOne as jest.Mock).mockResolvedValue(workflow);

    const result = await WorkflowService.getWorkflowByNewsId('id');

    expect(result).toEqual(workflow);
  });

  it('should throw NOT_FOUND if not found', async () => {
    (WorkflowRepository.findOne as jest.Mock).mockResolvedValue(null);

    await expect(
      WorkflowService.getWorkflowByNewsId('id'),
    ).rejects.toMatchObject({ status: httpStatus.NOT_FOUND });
  });
});
