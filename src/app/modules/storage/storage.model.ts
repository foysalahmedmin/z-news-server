import mongoose, { Query, Schema } from 'mongoose';
import { TStorage, TStorageDocument, TStorageModel } from './storage.type';

const storageSchema = new Schema<TStorageDocument>(
  {
    field_name: {
      type: String,
      required: [true, 'Field name is required'],
      trim: true,
    },
    original_name: {
      type: String,
      required: [true, 'Original name is required'],
      trim: true,
    },
    file_name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    bucket: {
      type: String,
      required: [true, 'Bucket name is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    mimetype: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'Size is required'],
      min: [0, 'Size must be non-negative'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    category: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, 'Caption cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'archived'],
      default: 'active',
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
storageSchema.index({ author: 1 });
storageSchema.index({ category: 1 });
storageSchema.index({ status: 1 });
storageSchema.index({ created_at: -1 });

// toJSON override to remove sensitive fields from output
storageSchema.methods.toJSON = function () {
  const storage = this.toObject();
  delete storage.is_deleted;
  return storage;
};

// Query middleware to exclude deleted items
storageSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TStorage, TStorage>;
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
storageSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
storageSchema.statics.isStorageExist = async function (_id: string) {
  return await this.findById(_id);
};

// Instance methods
storageSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const StorageModel = mongoose.model<TStorageDocument, TStorageModel>(
  'Storage',
  storageSchema,
);
