import bcrypt from 'bcrypt';
import mongoose, { Schema } from 'mongoose';
import config from '../../config';
import { TUser, TUserModel } from './user.type';

const userSchema = new Schema<TUser>(
  {
    id: { type: String, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: {
      type: String,
      required: true,
      minlength: [6, 'the password should minimum 6 character'],
      maxlength: [12, 'the password should maximum 12 character'],
      select: false,
    },
    need_password_change: { type: Boolean, default: false },
    password_changed_at: { type: Date, select: false },
    role: {
      type: String,
      enum: ['admin', 'student', 'faculty'],
      required: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'blocked'],
      default: 'in-progress',
    },
    is_deleted: { type: Boolean, default: false, select: false },
  },
  {
    timestamps: true,
  },
);

// Pre save middleware/ hook
userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );
  next();
});

// Post save middleware/ hook
userSchema.post('save', function (document, next) {
  document.password = '';
  next();
});

// Query middleware/ hook
userSchema.pre('find', function (next) {
  this.find({ is_deleted: { $ne: true } });
  next();
});

userSchema.pre('findOne', function (next) {
  this.findOne({ is_deleted: { $ne: true } });
  next();
});

userSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Methods
userSchema.statics.isUserExist = async function (_id: string) {
  return await User.findById(_id).select('+password +passwordChangedAt');
};

userSchema.statics.isUserExistById = async function (id: string) {
  return await User.findOne({ id: id }).select('+password +passwordChangedAt');
};

userSchema.statics.isUserExistByUsername = async function (username: string) {
  return await User.findOne({ username: username }).select(
    '+password +passwordChangedAt',
  );
};

userSchema.statics.isPasswordMatched = async function (
  password: string,
  hashedPassword: string,
) {
  return await bcrypt.compare(password, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforeChangedPassword = async function (
  passwordChangedTimestamp: Date,
  JWTIssuedTimestamp: number,
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > JWTIssuedTimestamp;
};

export const User = mongoose.model<TUser, TUserModel>('User', userSchema);
