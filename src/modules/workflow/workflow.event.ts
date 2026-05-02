import { publish } from '../../events/event-publisher';

export const emitWorkflowCreated = (workflowId: string, newsId: string) =>
  publish('news.created', { workflowId, newsId, type: 'workflow_created' });

export const emitWorkflowStageAdvanced = (
  workflowId: string,
  newsId: string,
  stage: string,
  assigneeId?: string,
) =>
  publish('news.published', {
    workflowId,
    newsId,
    stage,
    assigneeId,
    type: 'workflow_stage_advanced',
  });

export const emitWorkflowCompleted = (workflowId: string, newsId: string) =>
  publish('news.published', { workflowId, newsId, type: 'workflow_completed' });

export const emitWorkflowRejected = (
  workflowId: string,
  newsId: string,
  reason?: string,
) =>
  publish('news.archived', {
    workflowId,
    newsId,
    reason,
    type: 'workflow_rejected',
  });
