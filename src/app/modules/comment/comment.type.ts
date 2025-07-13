import { Document, Model, Types } from 'mongoose';

export type TStatus = 'pending' | 'approved' | 'rejected';

export type TComment = {
  news: Types.ObjectId;
  comment?: Types.ObjectId;
  user?: Types.ObjectId;
  guest?: string;
  name: string;
  email: string;
  content: string;
  status?: TStatus;
  is_edited?: boolean;
  edited_at?: Date;
  is_deleted?: boolean;
};

export interface TCommentDocument extends TComment, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TCommentDocument | null>;
}

export type TCommentModel = Model<TCommentDocument> & {
  isCommentExist(_id: string): Promise<TCommentDocument | null>;
};
