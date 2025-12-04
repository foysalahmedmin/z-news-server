import { Document, Model, Types } from 'mongoose';

export type TStatus = 'draft' | 'pending' | 'published' | 'archived';

export type TNewsBreak = {
  news: Types.ObjectId;
  status: TStatus;
  published_at?: Date;
  expired_at?: Date;
  is_deleted: boolean;
};

export interface TNewsBreakDocument extends TNewsBreak, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TNewsBreakDocument | null>;
}

export type TNewsBreakModel = Model<TNewsBreakDocument> & {
  isNewsBreakExist(_id: string): Promise<TNewsBreakDocument | null>;
};
