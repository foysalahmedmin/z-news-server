import { Document, Model, Types } from 'mongoose';

export type TStorageStatus = 'active' | 'inactive' | 'archived';

export type TStorage = {
  field_name: string;
  original_name: string;
  file_name: string;
  bucket: string;
  url: string;
  mimetype: string;
  size: number;
  author: Types.ObjectId;
  category?: string;
  description?: string;
  caption?: string;
  status: TStorageStatus;
  is_deleted: boolean;
};

export type TStorageInput = {
  name?: string;
  category?: string;
  description?: string;
  caption?: string;
  status?: TStorageStatus;
};

export interface TStorageDocument extends TStorage, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TStorageDocument | null>;
}

export type TStorageModel = Model<TStorageDocument> & {
  isStorageExist(_id: string): Promise<TStorageDocument | null>;
};
