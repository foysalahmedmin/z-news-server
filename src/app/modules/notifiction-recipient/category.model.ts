import mongoose, { Query, Schema, Types } from 'mongoose';
import { TCategory, TCategoryDocument, TCategoryModel } from './category.type';

const notificationActionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const metadataSchema = new Schema(
  {
    url: { type: String, trim: true },
    image: { type: String, trim: true },
    source: { type: String, trim: true },
    reference: { type: String, trim: true },
    actions: { type: [notificationActionSchema], default: [] },
  },
  { _id: false },
);

const notificationRecipientSchema = new Schema(
  {
    notification: {
      type: Types.ObjectId,
      ref: 'Notification',
      required: true,
    },

    metadata: {
      type: metadataSchema,
      default: {},
    },

    is_read: {
      type: Boolean,
      default: false,
    },

    read_at: {
      type: Date,
      default: null,
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

// toJSON override to remove sensitive fields from output
notificationRecipientSchema.methods.toJSON = function () {
  const category = this.toObject();
  delete category.is_deleted;
  return category;
};

// Query middleware to exclude deleted categories
notificationRecipientSchema.pre(
  /^find/,
  function (this: Query<TCategory, TCategory>, next) {
    this.setQuery({
      ...this.getQuery(),
      is_deleted: { $ne: true },
    });
    next();
  },
);

notificationRecipientSchema.pre(
  /^update/,
  function (this: Query<TCategory, TCategory>, next) {
    this.setQuery({
      ...this.getQuery(),
      is_deleted: { $ne: true },
    });
    next();
  },
);

// Aggregation pipeline
notificationRecipientSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
notificationRecipientSchema.statics.isCategoryExist = async function (
  _id: string,
) {
  return await this.findById(_id);
};

// Instance methods
notificationRecipientSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Category = mongoose.model<TCategoryDocument, TCategoryModel>(
  'Category',
  notificationRecipientSchema,
);
