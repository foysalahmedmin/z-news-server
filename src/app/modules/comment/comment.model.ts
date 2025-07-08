import mongoose, { Query, Schema } from 'mongoose';
import { TComment, TCommentDocument, TCommentModel } from './comment.type';

const commentSchema = new Schema<TCommentDocument>(
  {
    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
      required: true,
    },

    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return !this.guest;
      },
    },

    guest: {
      type: String,
      required: function () {
        return !this.author;
      },
      default: null,
    },

    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
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
commentSchema.methods.toJSON = function () {
  const comment = this.toObject();
  delete comment.is_deleted;
  return comment;
};

// Query middleware to exclude deleted categories
commentSchema.pre(/^find/, function (this: Query<TComment, TComment>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

commentSchema.pre(/^update/, function (this: Query<TComment, TComment>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

// Aggregation pipeline
commentSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
commentSchema.statics.isCommentExist = async function (_id: string) {
  return await this.findById(_id);
};

// Instance methods
commentSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Comment = mongoose.model<TCommentDocument, TCommentModel>(
  'Comment',
  commentSchema,
);
