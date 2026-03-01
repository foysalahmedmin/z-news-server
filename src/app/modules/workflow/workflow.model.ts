import mongoose, { Schema, Types } from 'mongoose';
import {
  TWorkflowDocument,
  TWorkflowModel,
  TWorkflowStage,
} from './workflow.type';

const workflowStageSchema = new Schema<TWorkflowStage>({
  stage_name: { type: String, required: true },
  assignee: { type: Schema.Types.ObjectId, ref: 'User' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'skipped'],
    default: 'pending',
  },
  comments: { type: String },
  completed_at: { type: Date },
});

const workflowSchema = new Schema<TWorkflowDocument>(
  {
    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
      required: true,
      unique: true,
    },
    current_stage: { type: String, required: true },
    stages: [workflowStageSchema],
    deadline: { type: Date },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    is_deleted: { type: Boolean, default: false },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Query middleware to exclude deleted docs
workflowSchema.pre(/^find/, function (next) {
  const query = this as any;
  query.where({ is_deleted: { $ne: true } });
  next();
});

// Case-insensitive search for newsId
workflowSchema.statics.isWorkflowExist = async function (
  newsId: string | Types.ObjectId,
) {
  return await this.findOne({ news: newsId });
};

// Instance methods
workflowSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Workflow = mongoose.model<TWorkflowDocument, TWorkflowModel>(
  'Workflow',
  workflowSchema,
);
