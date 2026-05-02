import { Document, Model, Types } from 'mongoose';

export type TMediaType = 'image' | 'video' | 'audio' | 'document';
export type TMediaStatus = 'active' | 'inactive' | 'archived';
export type TMediaProvider = 'local' | 'gcs';

export type TMedia = {
  title: string;
  description?: string;
  alt_text?: string;
  file: Types.ObjectId;
  type: TMediaType;
  url: string;
  thumbnail_url?: string;
  status: TMediaStatus;
  tags: string[];
  uploaded_by: Types.ObjectId;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export interface TMediaDocument extends TMedia, Document {
  softDelete(): Promise<TMediaDocument | null>;
}

export type TMediaModel = Model<TMediaDocument>;
