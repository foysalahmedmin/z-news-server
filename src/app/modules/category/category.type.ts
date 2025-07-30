import mongoose, { Document, Model, Types } from 'mongoose';

export type TStatus = 'active' | 'inactive';

export type TCategory = {
  name: string;
  slug: string;
  sequence: number;
  status: TStatus;
  category?: mongoose.Types.ObjectId | null;
  is_deleted?: boolean;
};

export type TCategoryTree = TCategory & {
  _id: string;
  children?: TCategoryTree[];
};

export interface TCategoryDocument extends TCategory, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TCategoryDocument | null>;
}

export type TCategoryModel = Model<TCategoryDocument> & {
  isCategoryExist(_id: string): Promise<TCategoryDocument | null>;
};
