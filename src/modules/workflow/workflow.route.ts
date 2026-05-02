import { Router } from 'express';
import auth from '../../middlewares/auth.middleware';
import validation from '../../middlewares/validation.middleware';
import { WorkflowController } from './workflow.controller';
import { WorkflowValidation } from './workflow.validator';

const router = Router();

// Start a workflow for a news article
router.post(
  '/start',
  auth('super-admin', 'admin', 'editor'),
  validation(WorkflowValidation.startWorkflowValidationSchema),
  WorkflowController.startWorkflow,
);

// Update a workflow stage (editor or mentioned assignee)
router.patch(
  '/:id/stage',
  auth('super-admin', 'admin', 'editor'),
  validation(WorkflowValidation.updateWorkflowStageValidationSchema),
  WorkflowController.updateWorkflowStage,
);

// Get workflow by news ID
router.get(
  '/news/:newsId',
  auth('super-admin', 'admin', 'editor', 'author'),
  WorkflowController.getWorkflowByNewsId,
);

// Get all workflows (admin only)
router.get(
  '/',
  auth('super-admin', 'admin', 'editor'),
  WorkflowController.getAllWorkflows,
);

const WorkflowRoutes = router;

export default WorkflowRoutes;
