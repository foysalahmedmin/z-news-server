import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../builder/app-error';
import { News } from '../news/news.model';
import * as WorkflowRepository from './workflow.repository';
import { TWorkflow, TWorkflowStageStatus } from './workflow.type';

// Default workflow stages
const DEFAULT_STAGES = [
  { stage_name: 'drafting', status: 'pending' as const },
  { stage_name: 'editing', status: 'pending' as const },
  { stage_name: 'fact-checking', status: 'pending' as const },
  { stage_name: 'legal-review', status: 'pending' as const },
  { stage_name: 'publishing', status: 'pending' as const },
];

// Start a workflow for a news article
const startWorkflow = async (payload: Partial<TWorkflow>) => {
  const { news: newsId, stages, ...rest } = payload;

  const news = await News.findById(newsId);
  if (!news) {
    throw new AppError(httpStatus.NOT_FOUND, 'News article not found');
  }

  // Check if workflow already exists for this news
  const existingWorkflow = await WorkflowRepository.findOne({ news: newsId });
  if (existingWorkflow) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Workflow already exists for this news article',
    );
  }

  const workflowStages = stages && stages.length > 0 ? stages : DEFAULT_STAGES;

  const result = await WorkflowRepository.create({
    news: newsId as unknown as Types.ObjectId,
    stages: workflowStages,
    current_stage: workflowStages[0].stage_name,
    ...rest,
  });

  return result;
};

// Update a workflow stage status
const updateWorkflowStage = async (
  workflowId: string,
  payload: {
    stage_name: string;
    status: TWorkflowStageStatus;
    comments?: string;
    assignee?: string;
  },
) => {
  const workflow = await WorkflowRepository.findById(workflowId);
  if (!workflow) {
    throw new AppError(httpStatus.NOT_FOUND, 'Workflow not found');
  }

  const stageIndex = workflow.stages.findIndex(
    (s) => s.stage_name === payload.stage_name,
  );
  if (stageIndex === -1) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      `Stage '${payload.stage_name}' not found in this workflow`,
    );
  }

  const stage = workflow.stages[stageIndex];

  // Update stage status and metadata
  stage.status = payload.status;
  if (payload.comments) stage.comments = payload.comments;
  if (payload.assignee)
    stage.assignee = payload.assignee as unknown as Types.ObjectId;
  if (['approved', 'rejected', 'skipped'].includes(payload.status)) {
    stage.completed_at = new Date();
  }

  // If stage is approved, move to the next stage if it exists
  if (payload.status === 'approved') {
    if (stageIndex < workflow.stages.length - 1) {
      workflow.current_stage = workflow.stages[stageIndex + 1].stage_name;
    } else {
      // If it's the last stage and it's approved, the article is ready for final publishing
      // We'll update the news status automatically
      const news = await News.findById(workflow.news);
      if (news && news.status !== 'published') {
        news.status = 'published';
        news.published_at = new Date();
        await news.save();
      }
    }
  }

  // If stage is rejected, move back to drafting or special rejection stage?
  // For simplicity, we'll keep it as rejected and maybe author needs to fix it.

  await workflow.save();

  return workflow;
};

// Get workflow by News ID
const getWorkflowByNewsId = async (newsId: string) => {
  const result = await WorkflowRepository.findOne({ news: newsId }, [
    { path: 'news', select: 'title slug status' },
    { path: 'stages.assignee', select: 'name email role' },
  ]);

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Workflow not found for this news article',
    );
  }

  return result;
};

// Get all workflows (admin only)
const getAllWorkflows = async (query: Record<string, unknown>) => {
  const result = await WorkflowRepository.findManyLean(query, [
    { path: 'news', select: 'title slug status' },
    { path: 'stages.assignee', select: 'name email role' },
  ]);
  return result;
};

export const WorkflowService = {
  startWorkflow,
  updateWorkflowStage,
  getWorkflowByNewsId,
  getAllWorkflows,
};
