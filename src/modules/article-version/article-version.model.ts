import mongoose, { Query, Schema } from 'mongoose';
import {
  TArticleVersion,
  TArticleVersionDocument,
  TArticleVersionModel,
} from './article-version.type';

const articleVersionSchema = new Schema<TArticleVersionDocument>(
  {
    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
      required: [true, 'News reference is required'],
      index: true,
    },
    version_number: {
      type: Number,
      required: [true, 'Version number is required'],
      min: [1, 'Version number must be at least 1'],
    },
    content_snapshot: {
      type: String,
      required: [true, 'Content snapshot is required'],
    },
    metadata_snapshot: {
      title: {
        type: String,
        required: true,
      },
      sub_title: String,
      description: String,
      tags: [String],
      category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
      categories: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
      thumbnail: {
        type: Schema.Types.ObjectId,
        ref: 'File',
      },
      video: {
        type: Schema.Types.ObjectId,
        ref: 'File',
      },
      youtube: String,
    },
    changed_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Changed by user is required'],
    },
    change_summary: {
      type: String,
      trim: true,
      maxlength: [500, 'Change summary cannot exceed 500 characters'],
    },
    diff: {
      added: [String],
      removed: [String],
      modified: [String],
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

// Indexes for performance
articleVersionSchema.index({ news: 1, version_number: -1 });
articleVersionSchema.index({ created_at: -1 });
articleVersionSchema.index({ changed_by: 1 });

// Compound index for unique version per news
articleVersionSchema.index(
  { news: 1, version_number: 1 },
  { unique: true, name: 'unique_news_version' },
);

// toJSON override to remove sensitive fields
articleVersionSchema.methods.toJSON = function () {
  const version = this.toObject();
  delete version.is_deleted;
  return version;
};

// Query middleware to exclude deleted versions
articleVersionSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TArticleVersion, TArticleVersion>;
  const opts = query.getOptions();

  if (!opts?.bypassDeleted && query.getQuery().is_deleted === undefined) {
    query.setQuery({
      ...query.getQuery(),
      is_deleted: { $ne: true },
    });
  }

  next();
});

// Aggregation pipeline
articleVersionSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
articleVersionSchema.statics.isVersionExist = async function (_id: string) {
  return await this.findById(_id);
};

articleVersionSchema.statics.getVersionsByNewsId = async function (
  newsId: string,
) {
  return await this.find({ news: newsId })
    .sort({ version_number: -1 })
    .populate('changed_by', 'name email')
    .exec();
};

// Instance methods
articleVersionSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const ArticleVersion = mongoose.model<
  TArticleVersionDocument,
  TArticleVersionModel
>('ArticleVersion', articleVersionSchema);
