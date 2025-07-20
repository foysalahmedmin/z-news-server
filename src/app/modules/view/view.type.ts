import { Document, Model, Types } from 'mongoose';

export type TStatus = 'pending' | 'approved' | 'rejected';

export type TView = {
  news: Types.ObjectId;
  user?: Types.ObjectId;
  guest?: string;
  is_deleted?: boolean;
};

export interface TViewDocument extends TView, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TViewDocument | null>;
}

export type TViewModel = Model<TViewDocument> & {
  isViewExist(_id: string): Promise<TViewDocument | null>;
};
