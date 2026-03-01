import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { WorkflowService } from './workflow.service';

const startWorkflow = catchAsync(async (req, res) => {
  const result = await WorkflowService.startWorkflow(req.body);
  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: 'Workflow started successfully!',
    data: result,
  });
});

const updateWorkflowStage = catchAsync(async (req, res) => {
  const result = await WorkflowService.updateWorkflowStage(
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Workflow stage updated successfully!',
    data: result,
  });
});

const getWorkflowByNewsId = catchAsync(async (req, res) => {
  const result = await WorkflowService.getWorkflowByNewsId(req.params.newsId);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'Workflow fetched successfully!',
    data: result,
  });
});

const getAllWorkflows = catchAsync(async (req, res) => {
  const result = await WorkflowService.getAllWorkflows(req.query);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: 'All workflows fetched successfully!',
    data: result,
  });
});

export const WorkflowController = {
  startWorkflow,
  updateWorkflowStage,
  getWorkflowByNewsId,
  getAllWorkflows,
};
