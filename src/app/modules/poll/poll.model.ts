import mongoose, { Query, Schema } from 'mongoose';
import { TPoll, TPollDocument, TPollModel } from './poll.type';

const pollSchema = new Schema<TPollDocument>(
  {
    news: {
      type: Schema.Types.ObjectId,
      ref: 'News',
      index: true,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Poll title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    options: [
      {
        text: {
          type: String,
          required: [true, 'Option text is required'],
          trim: true,
          maxlength: [200, 'Option text cannot exceed 200 characters'],
        },
        votes: {
          type: Number,
          default: 0,
          min: 0,
        },
        voters: [
          {
            type: Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],

    // Poll Settings
    allow_multiple_votes: {
      type: Boolean,
      default: false,
    },

    max_votes: {
      type: Number,
      default: 1,
      min: 1,
    },

    allow_anonymous: {
      type: Boolean,
      default: false,
    },

    show_results_before_vote: {
      type: Boolean,
      default: true,
    },

    randomize_options: {
      type: Boolean,
      default: false,
    },

    // Timing
    start_date: {
      type: Date,
      default: Date.now,
    },

    end_date: {
      type: Date,
    },

    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },

    // Tracking
    total_votes: {
      type: Number,
      default: 0,
      min: 0,
    },

    unique_voters: {
      type: Number,
      default: 0,
      min: 0,
    },

    votes: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        guest_id: {
          type: String,
        },
        option_index: {
          type: Number,
          required: true,
        },
        voted_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Metadata
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },

    is_featured: {
      type: Boolean,
      default: false,
      index: true,
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
pollSchema.index({ created_by: 1 });
pollSchema.index({ news: 1 });
pollSchema.index({ is_active: 1, end_date: 1 });
pollSchema.index({ is_featured: 1, created_at: -1 });
pollSchema.index({ tags: 1 });
pollSchema.index({ created_at: -1 });

// Virtual for poll status
pollSchema.virtual('status').get(function () {
  const now = new Date();

  if (!this.is_active) {
    return 'inactive';
  }

  if (this.start_date > now) {
    return 'scheduled';
  }

  if (this.end_date && this.end_date < now) {
    return 'ended';
  }

  return 'active';
});

// Virtual for results percentage
pollSchema.virtual('results').get(function () {
  if (this.total_votes === 0) {
    return this.options.map((option: any) => ({
      text: option.text,
      votes: 0,
      percentage: 0,
    }));
  }

  return this.options.map((option: any) => ({
    text: option.text,
    votes: option.votes,
    percentage: ((option.votes / this.total_votes) * 100).toFixed(2),
  }));
});

// toJSON override
pollSchema.methods.toJSON = function () {
  const poll = this.toObject();
  delete poll.is_deleted;

  // Hide voter details unless admin
  if (poll.options) {
    poll.options = poll.options.map((option: any) => ({
      text: option.text,
      votes: option.votes,
    }));
  }

  return poll;
};

// Query middleware
pollSchema.pre(/^find/, function (next) {
  const query = this as unknown as Query<TPoll, TPoll>;
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
pollSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { is_deleted: { $ne: true } } });
  next();
});

// Static methods
pollSchema.statics.isPollExist = async function (_id: string) {
  return await this.findById(_id);
};

pollSchema.statics.getActivePolls = async function () {
  const now = new Date();
  return await this.find({
    is_active: true,
    start_date: { $lte: now },
    $or: [{ end_date: null }, { end_date: { $gte: now } }],
  })
    .sort({ created_at: -1 })
    .populate('created_by', 'name email')
    .populate('category', 'name')
    .exec();
};

pollSchema.statics.getFeaturedPolls = async function (limit: number = 5) {
  const now = new Date();
  return await this.find({
    is_featured: true,
    is_active: true,
    start_date: { $lte: now },
    $or: [{ end_date: null }, { end_date: { $gte: now } }],
  })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate('created_by', 'name email')
    .populate('category', 'name')
    .exec();
};

pollSchema.statics.hasUserVoted = async function (
  pollId: string,
  userId: string,
) {
  const poll = await this.findOne({
    _id: pollId,
    'votes.user': userId,
  });
  return !!poll;
};

// Instance methods
pollSchema.methods.softDelete = async function () {
  this.is_deleted = true;
  return await this.save();
};

export const Poll = mongoose.model<TPollDocument, TPollModel>(
  'Poll',
  pollSchema,
);
