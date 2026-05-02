import { Document, Model, Types } from 'mongoose';

export type TDiff = {
  added?: string[];
  removed?: string[];
  modified?: string[];
};

export type TMetadataSnapshot = {
  title: string;
  sub_title?: string;
  description?: string;
  tags?: string[];
  category?: Types.ObjectId;
  categories?: Types.ObjectId[];
  thumbnail?: Types.ObjectId;
  video?: Types.ObjectId;
  youtube?: string;
};

export type TArticleVersion = {
  news: Types.ObjectId;
  version_number: number;
  content_snapshot: string;
  metadata_snapshot: TMetadataSnapshot;
  changed_by: Types.ObjectId;
  change_summary?: string;
  diff?: TDiff;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
};

export type TArticleVersionMethods = {
  softDelete(): Promise<TArticleVersionDocument>;
};

export interface TArticleVersionDocument
  extends Document,
    TArticleVersion,
    TArticleVersionMethods {}

export interface TArticleVersionModel extends Model<TArticleVersionDocument> {
  isVersionExist(id: string): Promise<TArticleVersionDocument | null>;
  getVersionsByNewsId(newsId: string): Promise<TArticleVersionDocument[]>;
}
