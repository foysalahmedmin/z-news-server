import { Document, Model, Types } from 'mongoose';

export type TStatus = 'active' | 'inactive';

export type TCategory = {
  name: string;
  slug: string;
  sequence: number;
  status: TStatus;
  is_deleted: boolean;
};

export interface TCategoryDocument extends TCategory, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TCategoryDocument | null>;
}

export type TCategoryModel = Model<TCategoryDocument> & {
  isCategoryExist(_id: string): Promise<TCategoryDocument | null>;
};
