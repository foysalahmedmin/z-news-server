import mongoose, { Query, Schema } from 'mongoose';
import { TBadge, TBadgeDocument, TBadgeModel } from './badge.type';

const badgeSchema = new Schema<TBadgeDocument>(
  {
    name: {
      type: String,
      required: [true, 'Badge name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Badge name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Badge description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    icon: {
      type: String,
      required: [true, 'Badge icon is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Badge category is required'],
      enum: {
        values: [
          'reader',
          'engagement',
          'loyalty',
          'contribution',
          'achievement',
        ],
        message: '{VALUE} is not a valid badge category',
      },
    },
    criteria: {
      type: {
        type: String,
        required: [true, 'Criteria type is required'],
        enum: {
          values: [
            'articles_read',
            'comments_posted',
            'reading_streak',
            'reputation_score',
            'years_member',
            'custom',
          ],
          message: '{VALUE} is not a valid criteria type',
        },
      },
      threshold: {
        type: Number,
        required: [true, 'Criteria threshold is required'],
        min: [0, 'Threshold cannot be negative'],
      },
      description: {
        type: String,
        required: [true, 'Criteria description is required'],
        trim: true,
      },
    },
    rarity: {
      type: String,
      required: [true, 'Badge rarity is required'],
      enum: {
        values: ['common', 'rare', 'epic', 'legendary'],
        message: '{VALUE} is not a valid rarity level',
      },
      default: 'common',
    },
    points: {
      type: Number,
      required: [true, 'Reputation points are required'],
      min: [0, 'Points cannot be negative'],
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
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
badgeSchema.index({ name: 1 }, { unique: true });
badgeSchema.index({ category: 1 });
badgeSchema.index({ rarity: 1 });
badgeSchema.index({ is_active: 1 });
badgeSchema.index({ created_at: -1 });

// Virtual for users who earned this badge
badgeSchema.virtual('earned_count', {
  ref: 'UserProfile',
  localField: '_id',
  foreignField: 'badges.badge_id',
  count: true,
});

// toJSON override
badgeSchema.methods.toJSON = function () {
  const badge = this.toObject();
  delete badge.is_deleted;
  return badge;
};

// Query middleware
badgeSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TBadge, TBadge>;
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
badgeSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
badgeSchema.statics.isBadgeExist = async function (_id: string) {
  return await this.findById(_id);
};

badgeSchema.statics.getActiveBadges = async function () {
  return await this.find({ is_active: true }).sort({ category: 1, rarity: 1 });
};

badgeSchema.statics.getBadgesByCategory = async function (
  category: TBadge['category'],
) {
  return await this.find({ category, is_active: true }).sort({ rarity: 1 });
};

// Instance methods
badgeSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Badge = mongoose.model<TBadgeDocument, TBadgeModel>(
  'Badge',
  badgeSchema,
);
