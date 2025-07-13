import mongoose, { Query, Schema } from 'mongoose';
import {
  TNotification,
  TNotificationDocument,
  TNotificationModel,
} from './category.type';

const categorySchema = new Schema<TNotificationDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
      enum: [
        'news-request',
        'news-request-approval',
        'news-headline-request',
        'news-headline-request-approval',
        'news-break-request',
        'news-break-request-approval',
        'reaction',
        'comment',
        'reply',
      ],
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    channels: {
      type: [String],
      enum: ['web', 'push', 'email'],
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },

    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },

    is_deleted: {
      type: Boolean,
      default: false,
      select: false,
    },
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

// toJSON override to remove sensitive fields from output
categorySchema.methods.toJSON = function () {
  const category = this.toObject();
  delete category.is_deleted;
  return category;
};

// Query middleware to exclude deleted categories
categorySchema.pre(
  /^find/,
  function (this: Query<TNotification, TNotification>, next) {
    this.setQuery({
      ...this.getQuery(),
      is_deleted: { $ne: true },
    });
    next();
  },
);

categorySchema.pre(
  /^update/,
  function (this: Query<TNotification, TNotification>, next) {
    this.setQuery({
      ...this.getQuery(),
      is_deleted: { $ne: true },
    });
    next();
  },
);

// Aggregation pipeline
categorySchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
categorySchema.statics.isCategoryExist = async function (_id: string) {
  return await this.findById(_id);
};

// Instance methods
categorySchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Category = mongoose.model<
  TNotificationDocument,
  TNotificationModel
>('Category', categorySchema);
