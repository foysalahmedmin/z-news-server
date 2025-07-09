import { Document, Model, Types } from 'mongoose';

export type TStatus = 'draft' | 'pending' | 'published' | 'archived';

export type TNews = {
  sequence: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  thumbnail?: string;
  images: string[];
  tags: string[];
  category: Types.ObjectId;
  author: Types.ObjectId;
  status: TStatus;
  is_featured: boolean;
  is_premium: boolean;
  view_count: number;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  published_at?: Date;
  is_edited?: boolean;
  edited_at?: Date;
  is_deleted: boolean;
};

export interface TNewsDocument extends TNews, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TNewsDocument | null>;
}

export type TNewsModel = Model<TNewsDocument> & {
  isNewsExist(_id: string): Promise<TNewsDocument | null>;
};
