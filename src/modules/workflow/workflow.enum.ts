export enum WorkflowStageStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SKIPPED = 'skipped',
}

export enum WorkflowPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum WorkflowStage {
  DRAFT = 'draft',
  REVIEW = 'review',
  EDITORIAL = 'editorial',
  APPROVED = 'approved',
  PUBLISHED = 'published',
}
