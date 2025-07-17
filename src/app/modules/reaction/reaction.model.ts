import mongoose, { Query, Schema } from 'mongoose';
import { TReaction, TReactionDocument, TReactionModel } from './reaction.type';

const reactionSchema = new Schema<TReactionDocument>(
  {
    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
      required: true,
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

    type: {
      type: String,
      required: true,
      enum: ['like', 'dislike'],
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
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

reactionSchema.index({ user: 1, news: 1 }, { unique: true });

// toJSON override to remove sensitive fields from output
reactionSchema.methods.toJSON = function () {
  const comment = this.toObject();
  delete comment.is_deleted;
  return comment;
};

// Query middleware to exclude deleted categories
reactionSchema.pre(/^find/, function (this: Query<TReaction, TReaction>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

reactionSchema.pre(
  /^update/,
  function (this: Query<TReaction, TReaction>, next) {
    this.setQuery({
      ...this.getQuery(),
      is_deleted: { $ne: true },
    });
    next();
  },
);

// Aggregation pipeline
reactionSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
reactionSchema.statics.isCommentExist = async function (_id: string) {
  return await this.findById(_id);
};

// Instance methods
reactionSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Reaction = mongoose.model<TReactionDocument, TReactionModel>(
  'Reaction',
  reactionSchema,
);
