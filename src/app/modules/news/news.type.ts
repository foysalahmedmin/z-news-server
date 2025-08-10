import { Document, Model, Types } from 'mongoose';
import { TNewsBreak } from '../news-break/news-break.type';
import { TNewsHeadline } from '../news-headline/news-headline.type';

export type TStatus = 'draft' | 'pending' | 'published' | 'archived';

export type TNews = {
  sequence: number;
  title: string;
  slug: string;
  description?: string;
  content: string;
  thumbnail?: string;
  images?: string[];
  tags?: string[];
  category: Types.ObjectId;
  author: Types.ObjectId;
  collaborators?: Types.ObjectId[];
  status: TStatus;
  is_featured?: boolean;
  is_top_featured?: boolean;
  is_premium: boolean;
  seo?: {
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
  news_headline?: TNewsHeadline;
  news_break?: TNewsBreak;
};

export interface TNewsDocument extends TNews, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TNewsDocument | null>;
}

export type TNewsModel = Model<TNewsDocument> & {
  isNewsExist(_id: string): Promise<TNewsDocument | null>;
};
