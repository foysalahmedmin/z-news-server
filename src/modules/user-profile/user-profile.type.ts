import { Document, Model, Types } from 'mongoose';

export type TUserProfile = {
  user: Types.ObjectId;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };

  // Reputation System
  reputation_score: number;
  badges: Array<{
    badge_id: Types.ObjectId;
    earned_at: Date;
  }>;

  // Activity Stats
  total_comments: number;
  total_reactions: number;
  articles_read: number;
  reading_streak: number; // Days
  last_read_at?: Date;

  // Preferences
  notification_preferences: {
    email_notifications: boolean;
    push_notifications: boolean;
    comment_replies: boolean;
    article_updates: boolean;
    newsletter: boolean;
  };
  email_frequency: 'instant' | 'daily' | 'weekly' | 'never';

  // Following
  following_authors: Types.ObjectId[];
  following_categories: Types.ObjectId[];
  following_topics: string[];

  is_verified_reader: boolean;
  is_premium: boolean;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export type TUserProfileDocument = TUserProfile & Document;

export type TUserProfileModel = Model<TUserProfileDocument> & {
  isProfileExist(_id: string): Promise<TUserProfileDocument | null>;
  getProfileByUserId(userId: string): Promise<TUserProfileDocument | null>;
  updateReputationScore(
    userId: string,
    points: number,
  ): Promise<TUserProfileDocument | null>;
  incrementActivityStat(
    userId: string,
    stat: 'total_comments' | 'total_reactions' | 'articles_read',
  ): Promise<TUserProfileDocument | null>;
};
