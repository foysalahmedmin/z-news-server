import { Document, Model, Types } from 'mongoose';

export type TStatus = 'pending' | 'approved' | 'rejected';

export type TReaction = {
  news: Types.ObjectId;
  user?: Types.ObjectId;
  guest?: string;
  type: 'like' | 'dislike';
  status?: TStatus;
  is_deleted?: boolean;
};

export interface TReactionDocument extends TReaction, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TReactionDocument | null>;
}

export type TReactionModel = Model<TReactionDocument> & {
  isCommentExist(_id: string): Promise<TReactionDocument | null>;
};
