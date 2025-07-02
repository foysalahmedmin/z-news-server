import bcrypt from 'bcrypt';
import mongoose, { Query, Schema } from 'mongoose';
import config from '../../config';
import { TUser, TUserModel } from './user.type';

const userSchema = new Schema<TUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: {
      type: String,
      required: true,
      minlength: [6, 'the password should minimum 6 character'],
      maxlength: [12, 'the password should maximum 12 character'],
      select: false,
    },
    password_changed_at: { type: Date, default: Date.now, select: false },
    role: {
      type: String,
      enum: [
        'supper-admin',
        'admin',
        'editor',
        'author',
        'contributor',
        'subscriber',
        'user',
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'blocked'],
      default: 'in-progress',
    },
    is_verified: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);

userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false } },
);

// Post save middleware/ hook
userSchema.post('save', function (document, next) {
  document.password = '';
  next();
});

// Pre save middleware/ hook
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );

  if (!this.isNew) {
    this.password_changed_at = new Date();
  }

  next();
});

// All find operations: find, findOne, findById, findOneAndUpdate, etc.
userSchema.pre(/^find/, function (this: Query<TUser, TUser>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

// All update operations: update, updateOne, updateMany
userSchema.pre(/^update/, function (this: Query<TUser, TUser>, next) {
  this.setQuery({
    ...this.getQuery(),
    is_deleted: { $ne: true },
  });
  next();
});

// Aggregation pipeline
userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Methods
userSchema.statics.isUserExist = async function (_id: string) {
  return await User.findById(_id).select('+password +password_changed_at');
};

userSchema.statics.isUserExistByEmail = async function (email: string) {
  return await User.findOne({ email: email }).select(
    '+password +password_changed_at',
  );
};

export const User = mongoose.model<TUser, TUserModel>('User', userSchema);
