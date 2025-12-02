import { Document, Model, Types } from 'mongoose';

export type TStatus = 'draft' | 'pending' | 'published' | 'archived';

export type TNews = {
  title: string;
  sub_title?: string;
  slug: string;
  description?: string;
  content: string;
  thumbnail?: Types.ObjectId;
  video?: Types.ObjectId;
  youtube?: string;
  tags?: string[];
  event?: Types.ObjectId;
  category: Types.ObjectId;
  categories: Types.ObjectId[];
  author: Types.ObjectId;
  writer?: string;
  collaborators?: Types.ObjectId[];
  status: TStatus;
  is_featured?: boolean;
  published_at?: Date;
  expired_at?: Date;
  is_edited?: boolean;
  edited_at?: Date;
  editor?: Types.ObjectId;
  layout?: string;
  views?: number;
  is_deleted: boolean;
};

export type TNewsInput = {
  post_id: string;
  post_date: string;
  post_content: string;
  post_title: string;
  post_status: 'publish' | string;
  post_modified_gmt: string;
  post_author: string;
  post_slug_bn: string;
  category_ids: string;
  image_url: string;
  image_caption: string;
};

export interface TNewsDocument extends TNews, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TNewsDocument | null>;
}

export type TNewsModel = Model<TNewsDocument> & {
  isNewsExist(_id: string): Promise<TNewsDocument | null>;
};
