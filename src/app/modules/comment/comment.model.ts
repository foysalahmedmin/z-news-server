import mongoose, { Query, Schema } from 'mongoose';
import { TComment, TCommentDocument, TCommentModel } from './comment.type';

const commentSchema = new Schema<TCommentDocument>(
  {
    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
      required: true,
      index: true,
    },

    // Threading support
    parent_comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },

    reply_to_user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    thread_level: {
      type: Number,
      default: 0,
      min: 0,
      max: 5, // Max 5 levels of nesting
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return !this.guest;
      },
    },

    guest: {
      type: String,
      required: function () {
        return !this.user;
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
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000, // Increased from 300
    },

    // Mentions
    mentions: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        position: Number,
      },
    ],

    // Pinning
    is_pinned: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Edit tracking
    is_edited: {
      type: Boolean,
      default: false,
    },

    edited_at: {
      type: Date,
    },

    edit_history: [
      {
        content: String,
        edited_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Moderation
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'flagged'],
      default: 'approved',
      index: true,
    },

    flagged_count: {
      type: Number,
      default: 0,
    },

    flagged_by: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    moderated_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    moderated_at: {
      type: Date,
    },

    moderation_reason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    is_deleted: {
      type: Boolean,
      default: false,
      select: false,
    },

    deleted_at: {
      type: Date,
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
commentSchema.index({ news: 1, parent_comment: 1 });
commentSchema.index({ news: 1, created_at: -1 });
commentSchema.index({ parent_comment: 1 });
commentSchema.index({ user: 1 });
commentSchema.index({ guest: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ is_pinned: 1, created_at: -1 });
commentSchema.index({ created_at: -1 });

// Virtual for reply count
commentSchema.virtual('reply_count', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent_comment',
  count: true,
  match: { is_deleted: { $ne: true } },
});

// Virtual for reactions
commentSchema.virtual('reactions', {
  ref: 'Reaction',
  localField: '_id',
  foreignField: 'comment',
  match: { is_deleted: { $ne: true } },
});

// Virtual for reaction counts
commentSchema.virtual('reaction_counts').get(function () {
  const counts = {
    like: 0,
    dislike: 0,
    total: 0,
  };

  if (this.reactions && Array.isArray(this.reactions)) {
    this.reactions.forEach((reaction: any) => {
      if (reaction.type === 'like' || reaction.type === 'dislike') {
        counts[reaction.type as 'like' | 'dislike']++;
        counts.total++;
      }
    });
  }

  return counts;
});

// toJSON override to remove sensitive fields from output
commentSchema.methods.toJSON = function () {
  const comment = this.toObject();
  delete comment.is_deleted;
  return comment;
};

// Query middleware to exclude deleted categories
commentSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TComment, TComment>;
  const opts = query.getOptions();

  if (!opts?.bypassDeleted && query.getQuery().is_deleted === undefined) {
    query.setQuery({
      ...query.getQuery(),
      is_deleted: { $ne: true },
    });
  }

  next();
});

// commentSchema.pre(/^update/, function (this: Query<TComment, TComment>, next) {
//   this.setQuery({
//     ...this.getQuery(),
//     is_deleted: { $ne: true },
//   });
//   next();
// });

// Aggregation pipeline
commentSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
commentSchema.statics.isCommentExist = async function (_id: string) {
  return await this.findById(_id);
};

commentSchema.statics.getThreadedComments = async function (newsId: string) {
  return await this.find({ news: newsId, parent_comment: null })
    .sort({ is_pinned: -1, created_at: -1 })
    .populate('user', 'name email image')
    .populate('mentions.user', 'name')
    .populate('reactions', 'user type created_at')
    .exec();
};

commentSchema.statics.getCommentReplies = async function (comment_id: string) {
  return await this.find({ parent_comment: comment_id })
    .sort({ created_at: 1 })
    .populate('user', 'name email image')
    .populate('reply_to_user', 'name')
    .populate('mentions.user', 'name')
    .populate('reactions', 'user type created_at')
    .exec();
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
