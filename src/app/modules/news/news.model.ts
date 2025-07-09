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

    summary: {
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
  },
);

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
