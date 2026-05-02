import mongoose, { Query, Schema } from 'mongoose';
import { TView, TViewDocument, TViewModel } from './view.type';

const viewSchema = new Schema<TViewDocument>(
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

viewSchema.index(
  { user: 1, news: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } },
);

viewSchema.index(
  { guest: 1, news: 1 },
  { unique: true, partialFilterExpression: { guest: { $type: 'string' } } },
);

// toJSON override to remove sensitive fields from output
viewSchema.methods.toJSON = function () {
  const comment = this.toObject();
  delete comment.is_deleted;
  return comment;
};

// Query middleware to exclude deleted categories
viewSchema.pre(/^find/, function (this: Query<TView, TView>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

viewSchema.pre(/^update/, function (this: Query<TView, TView>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

// Aggregation pipeline
viewSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
viewSchema.statics.isViewExist = async function (_id: string) {
  return await this.findById(_id);
};

// Instance methods
viewSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const View = mongoose.model<TViewDocument, TViewModel>(
  'View',
  viewSchema,
);
