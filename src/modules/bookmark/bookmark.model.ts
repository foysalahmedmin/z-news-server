import mongoose, { Query, Schema } from 'mongoose';
import {
  TBookmark,
  TBookmarkDocument,
  TBookmarkModel,
  TReadingList,
  TReadingListDocument,
  TReadingListModel,
} from './bookmark.type';

// Bookmark Schema
const bookmarkSchema = new Schema<TBookmarkDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
      required: [true, 'News reference is required'],
      index: true,
    },
    reading_list: {
      type: Schema.Types.ObjectId,
      ref: 'ReadingList',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    read_at: {
      type: Date,
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

// Indexes
bookmarkSchema.index({ user: 1, news: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, is_read: 1 });
bookmarkSchema.index({ reading_list: 1 });
bookmarkSchema.index({ created_at: -1 });

// toJSON override
bookmarkSchema.methods.toJSON = function () {
  const bookmark = this.toObject();
  delete bookmark.is_deleted;
  return bookmark;
};

// Query middleware
bookmarkSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TBookmark, TBookmark>;
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
bookmarkSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
bookmarkSchema.statics.isBookmarkExist = async function (_id: string) {
  return await this.findById(_id);
};

bookmarkSchema.statics.getBookmarksByUserId = async function (userId: string) {
  return await this.find({ user: userId })
    .sort({ created_at: -1 })
    .populate('news', 'title slug thumbnail description published_at')
    .populate('reading_list', 'name')
    .exec();
};

bookmarkSchema.statics.isAlreadyBookmarked = async function (
  userId: string,
  newsId: string,
) {
  return await this.findOne({ user: userId, news: newsId });
};

// Instance methods
bookmarkSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

// Reading List Schema
const readingListSchema = new Schema<TReadingListDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    is_public: {
      type: Boolean,
      default: false,
    },
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Bookmark',
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

// Indexes
readingListSchema.index({ user: 1 });
readingListSchema.index({ is_public: 1 });
readingListSchema.index({ created_at: -1 });

// Virtual for bookmark count
readingListSchema.virtual('bookmark_count', {
  ref: 'Bookmark',
  localField: '_id',
  foreignField: 'reading_list',
  count: true,
  match: { is_deleted: { $ne: true } },
});

// toJSON override
readingListSchema.methods.toJSON = function () {
  const list = this.toObject();
  delete list.is_deleted;
  return list;
};

// Query middleware
readingListSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TReadingList, TReadingList>;
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
readingListSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
readingListSchema.statics.isReadingListExist = async function (_id: string) {
  return await this.findById(_id);
};

readingListSchema.statics.getReadingListsByUserId = async function (
  userId: string,
) {
  return await this.find({ user: userId })
    .sort({ created_at: -1 })
    .populate('bookmarks')
    .exec();
};

// Instance methods
readingListSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Bookmark = mongoose.model<TBookmarkDocument, TBookmarkModel>(
  'Bookmark',
  bookmarkSchema,
);

export const ReadingList = mongoose.model<
  TReadingListDocument,
  TReadingListModel
>('ReadingList', readingListSchema);
