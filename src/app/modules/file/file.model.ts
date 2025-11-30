import mongoose, { Query, Schema } from 'mongoose';
import { TFile, TFileDocument, TFileModel } from './file.type';

const fileSchema = new Schema<TFileDocument>(
  {
    file_name: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    path: {
      type: String,
      required: [true, 'Path is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['image', 'video', 'audio', 'file', 'pdf', 'doc', 'txt'],
      required: [true, 'Type is required'],
    },
    mime_type: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
    },
    size: {
      type: Number,
      required: [true, 'Size is required'],
      min: [0, 'Size must be non-negative'],
    },
    extension: {
      type: String,
      required: [true, 'Extension is required'],
      trim: true,
      lowercase: true,
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
fileSchema.index({ author: 1 });
fileSchema.index({ category: 1 });
fileSchema.index({ type: 1 });
fileSchema.index({ status: 1 });
fileSchema.index({ created_at: -1 });

// toJSON override to remove sensitive fields from output
fileSchema.methods.toJSON = function () {
  const file = this.toObject();
  delete file.is_deleted;
  return file;
};

// Query middleware to exclude deleted files
fileSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TFile, TFile>;
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
fileSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
fileSchema.statics.isFileExist = async function (_id: string) {
  return await this.findById(_id);
};

// Instance methods
fileSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const File = mongoose.model<TFileDocument, TFileModel>(
  'File',
  fileSchema,
);

