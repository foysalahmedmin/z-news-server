import { Document, Model, Types } from 'mongoose';

export type TWorkflowStageStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'skipped';
export type TWorkflowPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TWorkflowStage = {
  stage_name: string;
  assignee?: Types.ObjectId;
  status: TWorkflowStageStatus;
  comments?: string;
  completed_at?: Date;
};

export type TWorkflow = {
  news: Types.ObjectId;
  current_stage: string;
  stages: TWorkflowStage[];
  deadline?: Date;
  priority: TWorkflowPriority;
  is_deleted: boolean;
};

export interface TWorkflowDocument extends TWorkflow, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TWorkflowDocument | null>;
}

export type TWorkflowModel = Model<TWorkflowDocument> & {
  isWorkflowExist(
    newsId: string | Types.ObjectId,
  ): Promise<TWorkflowDocument | null>;
};
