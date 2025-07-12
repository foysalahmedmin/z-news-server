import { Document, Model, Types } from 'mongoose';

export type TStatus = 'draft' | 'pending' | 'published' | 'archived';

export type TNewsHeadline = {
  sequence: number;
  title: string;
  summary?: string;
  tags?: string[];
  category: Types.ObjectId;
  author: Types.ObjectId;
  news?: Types.ObjectId;
  status: TStatus;
  published_at?: Date;
  expired_at?: Date;
  is_edited?: boolean;
  edited_at?: Date;
  is_deleted: boolean;
};

export interface TNewsHeadlineDocument extends TNewsHeadline, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TNewsHeadlineDocument | null>;
}

export type TNewsHeadlineModel = Model<TNewsHeadlineDocument> & {
  isNewsExist(_id: string): Promise<TNewsHeadlineDocument | null>;
};
