import mongoose, { Query, Schema } from 'mongoose';
import { TMedia, TMediaDocument, TMediaModel } from './media.type';

const mediaSchema = new Schema<TMediaDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    alt_text: {
      type: String,
      trim: true,
    },
    file: {
      type: Schema.Types.ObjectId,
      ref: 'File',
      required: [true, 'File reference is required'],
    },
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'document'],
      required: [true, 'Media type is required'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    thumbnail_url: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
    },
    tags: {
      type: [String],
      default: [],
    },
    uploaded_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader is required'],
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

mediaSchema.index({ type: 1 });
mediaSchema.index({ status: 1 });
mediaSchema.index({ uploaded_by: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ created_at: -1 });

mediaSchema.methods.toJSON = function () {
  const media = this.toObject();
  delete media.is_deleted;
  return media;
};

mediaSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TMedia, TMedia>;
  const opts = query.getOptions();

  if (!opts?.bypassDeleted && query.getQuery().is_deleted === undefined) {
    query.setQuery({ ...query.getQuery(), is_deleted: { $ne: true } });
  }

  next();
});

mediaSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

mediaSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Media = mongoose.model<TMediaDocument, TMediaModel>(
  'Media',
  mediaSchema,
);
