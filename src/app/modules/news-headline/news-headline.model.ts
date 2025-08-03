import mongoose, { Query, Schema } from 'mongoose';
import {
  TNewsHeadline,
  TNewsHeadlineDocument,
  TNewsHeadlineModel,
} from './news-headline.type';

const newsHeadlineSchema = new Schema<TNewsHeadlineDocument>(
  {
    sequence: {
      type: Number,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    tags: {
      type: [String],
      default: [],
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
    },

    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
    },

    published_at: {
      type: Date,
      required: function () {
        return this.status === 'published';
      },
      default: function (this: TNewsHeadlineDocument) {
        return this.status === 'published' ? new Date() : undefined;
      },
      validate: {
        validator: function (value: Date) {
          if (this.expired_at && value) {
            return value <= this.expired_at;
          }
          return true;
        },
        message: 'published_at cannot be after expired_at',
      },
    },

    expired_at: {
      type: Date,
      default: function (this: TNewsHeadlineDocument) {
        if (this.status === 'published') {
          const publishedAt = this.published_at || new Date();
          return new Date(publishedAt.getTime() + 1 * 24 * 60 * 60 * 1000);
        }
        return undefined;
      },
      validate: {
        validator: function (value: Date) {
          if (this.published_at && value) {
            return value >= this.published_at;
          }
          return true;
        },
        message: 'expired_at cannot be before published_at',
      },
    },

    is_edited: {
      type: Boolean,
      default: false,
    },

    edited_at: {
      type: Date,
    },

    is_deleted: {
      type: Boolean,
      default: false,
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

newsHeadlineSchema.index(
  { news: 1 },
  {
    unique: true,
    partialFilterExpression: { news: { $exists: true, $ne: null } },
  },
);

// toJSON override to remove sensitive fields from output
newsHeadlineSchema.methods.toJSON = function () {
  const News = this.toObject();
  delete News.is_deleted;
  return News;
};

// Query middleware to exclude deleted categories
newsHeadlineSchema.pre(
  /^find/,
  function (this: Query<TNewsHeadline, TNewsHeadline>, next) {
    this.setQuery({
      ...this.getQuery(),
      is_deleted: { $ne: true },
    });
    next();
  },
);

newsHeadlineSchema.pre(
  /^update/,
  function (this: Query<TNewsHeadline, TNewsHeadline>, next) {
    this.setQuery({
      ...this.getQuery(),
      is_deleted: { $ne: true },
    });
    next();
  },
);

// Aggregation pipeline
newsHeadlineSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
newsHeadlineSchema.statics.isNewsHeadlineExist = async function (_id: string) {
  return await this.findById(_id);
};

// Instance methods
newsHeadlineSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const NewsHeadline = mongoose.model<
  TNewsHeadlineDocument,
  TNewsHeadlineModel
>('NewsHeadline', newsHeadlineSchema);
