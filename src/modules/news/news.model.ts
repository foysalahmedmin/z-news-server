import mongoose, { Query, Schema } from 'mongoose';
import { TNews, TNewsDocument, TNewsModel } from './news.type';

const newsSchema = new Schema<TNewsDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    sub_title: {
      type: String,
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
      maxlength: 3000,
    },

    content: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },

    video: {
      type: Schema.Types.ObjectId,
      ref: 'File',
    },

    youtube: {
      type: String,
    },

    tags: {
      type: [String],
      default: [],
    },

    event: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    categories: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      default: [],
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    writer: {
      type: String,
    },

    collaborators: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },

    status: {
      type: String,
      enum: ['draft', 'pending', 'scheduled', 'published', 'archived'],
      default: 'draft',
    },

    is_featured: {
      type: Boolean,
      default: false,
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

    editor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    layout: {
      type: String,
      default: 'default',
    },

    // SEO Enhancement
    meta_title: { type: String },
    meta_description: { type: String },
    canonical_url: { type: String },
    structured_data: { type: Schema.Types.Mixed },

    // Content Classification
    content_type: {
      type: String,
      enum: ['article', 'video', 'podcast', 'live-blog', 'photo-essay'],
      default: 'article',
    },
    reading_time: { type: Number, default: 0 },
    word_count: { type: Number, default: 0 },

    // Editorial Metadata
    sensitivity_level: {
      type: String,
      enum: ['public', 'sensitive', 'restricted'],
      default: 'public',
    },
    fact_checked: { type: Boolean, default: false },
    fact_checker: { type: Schema.Types.ObjectId, ref: 'User' },
    sources: [
      {
        name: { type: String },
        url: { type: String },
        credibility: { type: Number, min: 0, max: 100 },
      },
    ],

    // Engagement Optimization
    push_notification_sent: { type: Boolean, default: false },
    newsletter_included: { type: Boolean, default: false },
    social_media_posts: [
      {
        platform: { type: String },
        post_id: { type: String },
        posted_at: { type: Date },
      },
    ],

    // Geographic Targeting
    geo_targeting: {
      countries: [String],
      regions: [String],
      cities: [String],
    },

    // Multimedia
    gallery: [{ type: Schema.Types.ObjectId, ref: 'File' }],
    audio: { type: Schema.Types.ObjectId, ref: 'File' },
    podcast_episode: { type: Schema.Types.ObjectId },
    infographics: [{ type: Schema.Types.ObjectId, ref: 'File' }],

    // Related Content
    related_articles: [{ type: Schema.Types.ObjectId, ref: 'News' }],
    series: { type: Schema.Types.ObjectId },

    // Performance Metrics
    avg_time_on_page: { type: Number, default: 0 },
    bounce_rate: { type: Number, default: 0 },
    scroll_depth: { type: Number, default: 0 },
    share_count: { type: Number, default: 0 },

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

newsSchema.index({ slug: 1 }, { unique: true });
newsSchema.index({ title: 1 });
newsSchema.index({ status: 1 });
newsSchema.index({ author: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ categories: 1 });
newsSchema.index({ event: 1 });
newsSchema.index({ is_featured: 1 });

newsSchema.index({ created_at: -1 });
newsSchema.index({ published_at: -1 });

newsSchema.index({ title: 1, description: 1 });
newsSchema.index({ title: 'text', description: 'text', tags: 'text' });

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

newsSchema.virtual('views', {
  ref: 'View',
  localField: '_id',
  foreignField: 'news',
  count: true,
  match: { is_deleted: { $ne: true } },
});

newsSchema.virtual('likes', {
  ref: 'Reaction',
  localField: '_id',
  foreignField: 'news',
  count: true,
  match: { type: 'like', is_deleted: { $ne: true } },
});

newsSchema.virtual('dislikes', {
  ref: 'Reaction',
  localField: '_id',
  foreignField: 'news',
  count: true,
  match: { type: 'dislike', is_deleted: { $ne: true } },
});

newsSchema.virtual('comments', {
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

// Pre-save middleware to calculate word count and reading time
newsSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).length;
    this.word_count = words;
    // Average reading speed: 200 words per minute
    this.reading_time = Math.ceil(words / 200);
  }
  next();
});

// Query middleware to exclude deleted categories
newsSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TNews, TNews>;
  const opts = query.getOptions();

  if (!opts?.bypassDeleted && query.getQuery().is_deleted === undefined) {
    query.setQuery({
      ...query.getQuery(),
      is_deleted: { $ne: true },
    });
  }

  next();
});

// newsSchema.pre(/^update/, function (this: Query<TNews, TNews>, next) {
//   this.setQuery({
//     ...this.getQuery(),
//     is_deleted: { $ne: true },
//   });
//   next();
// });

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
