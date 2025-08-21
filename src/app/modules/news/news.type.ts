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
  layout?: string;
  views?: number;
  is_deleted: boolean;
  is_news_headline?: boolean;
  is_news_break?: boolean;
  // news_headline?: TNewsHeadline;
  // news_break?: TNewsBreak;
};

export interface TNewsDocument extends TNews, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TNewsDocument | null>;
}

export type TNewsModel = Model<TNewsDocument> & {
  isNewsExist(_id: string): Promise<TNewsDocument | null>;
};
