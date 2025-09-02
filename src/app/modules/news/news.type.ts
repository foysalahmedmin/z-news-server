import { Document, Model, Types } from 'mongoose';

export type TStatus = 'draft' | 'pending' | 'published' | 'archived';

export type TNews = {
  sequence?: number;
  title: string;
  slug: string;
  caption?: string;
  description?: string;
  content: string;
  thumbnail?: string;
  images?: string[];
  video?: string;
  youtube?: string;
  tags?: string[];
  category: Types.ObjectId;
  categories: Types.ObjectId[];
  author: Types.ObjectId;
  writer?: string;
  collaborators?: Types.ObjectId[];
  status: TStatus;
  is_featured?: boolean;
  is_premium: boolean;
  seo?: {
    image?: string;
    title?: string;
    description?: string;
    keywords?: string[];
  };
  published_at?: Date;
  expired_at?: Date;
  is_edited?: boolean;
  edited_at?: Date;
  editor?: Types.ObjectId;
  layout?: string;
  views?: number;
  is_deleted: boolean;
  is_news_headline?: boolean;
  is_news_break?: boolean;
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
