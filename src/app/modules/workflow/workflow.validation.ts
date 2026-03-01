import { z } from 'zod';

const idSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
  message: 'Invalid ID format',
});

const workflowStageStatusSchema = z.enum([
  'pending',
  'approved',
  'rejected',
  'skipped',
]);
const workflowPriorityStatusSchema = z.enum([
  'low',
  'medium',
  'high',
  'urgent',
]);

export const startWorkflowValidationSchema = z.object({
  body: z.object({
    news: idSchema,
    priority: workflowPriorityStatusSchema.optional(),
    deadline: z.coerce.date().optional(),
    stages: z
      .array(
        z.object({
          stage_name: z.string().min(1),
          assignee: idSchema.optional(),
        }),
      )
      .optional(),
  }),
});

export const updateWorkflowStageValidationSchema = z.object({
  params: z.object({
    id: idSchema, // Workflow ID
  }),
  body: z.object({
    stage_name: z.string().min(1),
    status: workflowStageStatusSchema,
    comments: z.string().optional(),
    assignee: idSchema.optional(),
  }),
});

export const workflowOperationValidationSchema = z.object({
  params: z.object({
    id: idSchema,
  }),
});

export const WorkflowValidation = {
  startWorkflowValidationSchema,
  updateWorkflowStageValidationSchema,
  workflowOperationValidationSchema,
};
