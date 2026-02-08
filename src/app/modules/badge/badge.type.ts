import { Document, Model, Types } from 'mongoose';

export type TBadge = {
  name: string;
  description: string;
  icon: string;
  category:
    | 'reader'
    | 'engagement'
    | 'loyalty'
    | 'contribution'
    | 'achievement';
  criteria: {
    type:
      | 'articles_read'
      | 'comments_posted'
      | 'reading_streak'
      | 'reputation_score'
      | 'years_member'
      | 'custom';
    threshold: number;
    description: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number; // Reputation points awarded
  is_active: boolean;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export type TBadgeDocument = TBadge &
  Document & {
    _id: Types.ObjectId;
    softDelete(): Promise<TBadgeDocument>;
  };

export type TBadgeModel = Model<TBadgeDocument> & {
  isBadgeExist(_id: string): Promise<TBadgeDocument | null>;
  getActiveBadges(): Promise<TBadgeDocument[] | null>;
  getBadgesByCategory(
    category: TBadge['category'],
  ): Promise<TBadgeDocument[] | null>;
};
