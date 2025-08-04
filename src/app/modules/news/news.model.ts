import mongoose, { Query, Schema } from 'mongoose';
import { TNews, TNewsDocument, TNewsModel } from './news.type';

const newsSchema = new Schema<TNewsDocument>(
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

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    content: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
    },

    images: {
      type: [String],
      default: [],
    },

    tags: {
      type: [String],
      default: [],
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'archived'],
      default: 'draft',
    },

    is_featured: {
      type: Boolean,
      default: false,
    },

    is_premium: {
      type: Boolean,
      default: false,
    },

    seo: {
      title: String,
      description: String,
      keywords: [String],
    },

    published_at: {
      type: Date,
      required: function () {
        return this.status === 'published';
      },
      default: function (this: TNewsDocument) {
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
      default: function (this: TNewsDocument) {
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

    layout: {
      type: String,
      default: 'default',
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

newsSchema.virtual('news_headline', {
  ref: 'NewsHeadline',
  localField: '_id',
  foreignField: 'news',
  justOne: true,
});

newsSchema.virtual('news_break', {
  ref: 'NewsBreak',
  localField: '_id',
  foreignField: 'news',
  justOne: true,
});

newsSchema.virtual('like_count', {
  ref: 'Reaction',
  localField: '_id',
  foreignField: 'news',
  count: true,
  match: { type: 'like', is_deleted: { $ne: true } },
});

newsSchema.virtual('dislike_count', {
  ref: 'Reaction',
  localField: '_id',
  foreignField: 'news',
  count: true,
  match: { type: 'dislike', is_deleted: { $ne: true } },
});

newsSchema.virtual('comment_count', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'news',
  count: true,
  match: { is_deleted: { $ne: true } },
});

// toJSON override to remove sensitive fields from output
newsSchema.methods.toJSON = function () {
  const News = this.toObject();
  delete News.is_deleted;
  return News;
};

// Query middleware to exclude deleted categories
newsSchema.pre(/^find/, function (this: Query<TNews, TNews>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

newsSchema.pre(/^update/, function (this: Query<TNews, TNews>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

// Aggregation pipeline
newsSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
newsSchema.statics.isNewsExist = async function (_id: string) {
  return await this.findById(_id);
};

// Instance methods
newsSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const News = mongoose.model<TNewsDocument, TNewsModel>(
  'News',
  newsSchema,
);
