import mongoose, { Query, Schema } from 'mongoose';
import { TGuest, TGuestDocument, TGuestModel } from './guest.type';

const guestSchema = new Schema<TGuestDocument>(
  {
    name: {
      type: String,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    token: { type: String, required: true, unique: true, index: true },
    session_id: { type: String, required: true },
    ip_address: String,
    user_agent: String,
    fingerprint: String,
    preferences: {
      theme: String,
      language: String,
      timezone: String,
    },
    status: {
      type: String,
      enum: ['in-progress', 'blocked'],
      default: 'in-progress',
    },
    is_deleted: { type: Boolean, default: false, select: false },
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

guestSchema.index(
  { updated_at: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 30 * 3,
  },
);

// toJSON override to remove sensitive fields from output
guestSchema.methods.toJSON = function () {
  const guest = this.toObject();
  delete guest.is_deleted;
  return guest;
};

// Query middleware to exclude deleted guests
guestSchema.pre(/^find/, function (this: Query<TGuest, TGuest>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

guestSchema.pre(/^update/, function (this: Query<TGuest, TGuest>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

// Aggregation pipeline
guestSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
guestSchema.statics.isGuestExist = async function (_id: string) {
  return await this.findById(_id).select('+password +password_changed_at');
};

guestSchema.statics.isGuestExistByEmail = async function (email: string) {
  return await this.findOne({ email: email }).select(
    '+password +password_changed_at',
  );
};

// Instance methods
guestSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

guestSchema.methods.isPasswordChanged = function (jwtTimestamp: number) {
  const passwordChangedTimestamp = Math.floor(
    this.password_changed_at.getTime() / 1000,
  );
  return jwtTimestamp < passwordChangedTimestamp;
};

export const Guest = mongoose.model<TGuestDocument, TGuestModel>(
  'Guest',
  guestSchema,
);
