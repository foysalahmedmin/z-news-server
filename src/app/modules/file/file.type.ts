import { Document, Model, Types } from 'mongoose';

export type TFileType = 'image' | 'video' | 'audio' | 'file' | 'pdf' | 'doc' | 'txt';

export type TFileStatus = 'active' | 'inactive' | 'archived';

export type TFile = {
  file_name: string;
  name: string;
  url: string;
  path: string;
  type: TFileType;
  mime_type: string;
  size: number;
  extension: string;
  author: Types.ObjectId;
  category?: string;
  description?: string;
  caption?: string;
  status: TFileStatus;
  is_deleted: boolean;
};

export type TFileInput = {
  name: string;
  category?: string;
  description?: string;
  caption?: string;
  status?: TFileStatus;
};

export interface TFileDocument extends TFile, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TFileDocument | null>;
}

export type TFileModel = Model<TFileDocument> & {
  isFileExist(_id: string): Promise<TFileDocument | null>;
};

