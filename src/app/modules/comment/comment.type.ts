import { Document, Model, Types } from 'mongoose';

// TCommentReaction removed as we use Reaction module now

export type TCommentMention = {
  user: Types.ObjectId;
  position: number; // Position in content where mention occurs
};

export type TStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export type TComment = {
  news: Types.ObjectId;
  parent_comment?: Types.ObjectId; // For threading
  reply_to_user?: Types.ObjectId; // Direct reply to specific user
  thread_level: number; // 0 = top level, 1-5 = nested replies
  user?: Types.ObjectId;
  guest?: string;
  name: string;
  email: string;
  content: string;

  // Enhanced features
  mentions: TCommentMention[]; // @user mentions
  // reactions: TCommentReaction[]; // Removed in favor of Reaction module
  is_pinned: boolean; // Editors can pin important comments
  is_edited: boolean;
  edited_at?: Date;
  edit_history?: Array<{
    content: string;
    edited_at: Date;
  }>;

  // Moderation
  status: TStatus;
  flagged_count: number;
  flagged_by: Types.ObjectId[];
  moderated_by?: Types.ObjectId;
  moderated_at?: Date;
  moderation_reason?: string;

  is_deleted: boolean;
  deleted_at?: Date;
  created_at?: Date;
  updated_at?: Date;
};

export interface TCommentDocument extends TComment, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TCommentDocument | null>;
  reaction_counts: {
    like: number;
    dislike: number;
    total: number;
  };
  reactions?: any[];
  reply_count?: number;
}

export type TCommentModel = Model<TCommentDocument> & {
  isCommentExist(_id: string): Promise<TCommentDocument | null>;
  getThreadedComments(newsId: string): Promise<TCommentDocument[] | null>;
  getCommentReplies(comment_id: string): Promise<TCommentDocument[] | null>;
};
