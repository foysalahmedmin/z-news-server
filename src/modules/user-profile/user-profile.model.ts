import mongoose, { Query, Schema } from 'mongoose';
import {
  TUserProfile,
  TUserProfileDocument,
  TUserProfileModel,
} from './user-profile.type';

const userProfileSchema = new Schema<TUserProfileDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot exceed 100 characters'],
    },
    website: {
      type: String,
      trim: true,
      maxlength: [200, 'Website URL cannot exceed 200 characters'],
    },
    social_links: {
      twitter: {
        type: String,
        trim: true,
      },
      facebook: {
        type: String,
        trim: true,
      },
      linkedin: {
        type: String,
        trim: true,
      },
      instagram: {
        type: String,
        trim: true,
      },
    },

    // Reputation System
    reputation_score: {
      type: Number,
      default: 0,
      min: [0, 'Reputation score cannot be negative'],
    },
    badges: [
      {
        badge_id: {
          type: Schema.Types.ObjectId,
          ref: 'Badge',
        },
        earned_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Activity Stats
    total_comments: {
      type: Number,
      default: 0,
      min: [0, 'Total comments cannot be negative'],
    },
    total_reactions: {
      type: Number,
      default: 0,
      min: [0, 'Total reactions cannot be negative'],
    },
    articles_read: {
      type: Number,
      default: 0,
      min: [0, 'Articles read cannot be negative'],
    },
    reading_streak: {
      type: Number,
      default: 0,
      min: [0, 'Reading streak cannot be negative'],
    },
    last_read_at: {
      type: Date,
    },

    // Preferences
    notification_preferences: {
      email_notifications: {
        type: Boolean,
        default: true,
      },
      push_notifications: {
        type: Boolean,
        default: true,
      },
      comment_replies: {
        type: Boolean,
        default: true,
      },
      article_updates: {
        type: Boolean,
        default: true,
      },
      newsletter: {
        type: Boolean,
        default: true,
      },
    },
    email_frequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly', 'never'],
      default: 'daily',
    },

    // Following
    following_authors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following_categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    following_topics: [
      {
        type: String,
        trim: true,
      },
    ],

    is_verified_reader: {
      type: Boolean,
      default: false,
    },
    is_premium: {
      type: Boolean,
      default: false,
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
userProfileSchema.index({ user: 1 }, { unique: true });
userProfileSchema.index({ reputation_score: -1 });
userProfileSchema.index({ is_verified_reader: 1 });
userProfileSchema.index({ is_premium: 1 });
userProfileSchema.index({ created_at: -1 });

// Virtual for follower count
userProfileSchema.virtual('follower_count', {
  ref: 'Follow',
  localField: 'user',
  foreignField: 'following_id',
  count: true,
  match: { following_type: 'user', is_deleted: { $ne: true } },
});

// toJSON override
userProfileSchema.methods.toJSON = function () {
  const profile = this.toObject();
  delete profile.is_deleted;
  return profile;
};

// Query middleware to exclude deleted profiles
userProfileSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TUserProfile, TUserProfile>;
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
userProfileSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
userProfileSchema.statics.isProfileExist = async function (_id: string) {
  return await this.findById(_id);
};

userProfileSchema.statics.getProfileByUserId = async function (userId: string) {
  return await this.findOne({ user: userId })
    .populate('user', 'name email image role')
    .populate('following_authors', 'name email image')
    .populate('following_categories', 'name slug icon')
    .populate('badges.badge_id', 'name description icon');
};

userProfileSchema.statics.updateReputationScore = async function (
  userId: string,
  points: number,
) {
  return await this.findOneAndUpdate(
    { user: userId },
    { $inc: { reputation_score: points } },
    { new: true, upsert: true },
  );
};

userProfileSchema.statics.incrementActivityStat = async function (
  userId: string,
  stat: 'total_comments' | 'total_reactions' | 'articles_read',
) {
  return await this.findOneAndUpdate(
    { user: userId },
    { $inc: { [stat]: 1 } },
    { new: true, upsert: true },
  );
};

// Instance methods
userProfileSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const UserProfile = mongoose.model<
  TUserProfileDocument,
  TUserProfileModel
>('UserProfile', userProfileSchema);
