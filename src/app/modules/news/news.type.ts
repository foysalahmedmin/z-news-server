import { Document, Model, Types } from 'mongoose';

export type TStatus =
  | 'draft'
  | 'pending'
  | 'scheduled'
  | 'published'
  | 'archived';

export type TContentType =
  | 'article'
  | 'video'
  | 'podcast'
  | 'live-blog'
  | 'photo-essay';

export type TSensitivityLevel = 'public' | 'sensitive' | 'restricted';

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
  category?: Types.ObjectId;
  categories?: Types.ObjectId[];
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

  // SEO Enhancement
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  structured_data?: Record<string, unknown>;

  // Content Classification
  content_type: TContentType;
  reading_time?: number;
  word_count?: number;

  // Editorial Metadata
  sensitivity_level: TSensitivityLevel;
  fact_checked?: boolean;
  fact_checker?: Types.ObjectId;
  sources?: { name: string; url?: string; credibility?: number }[];

  // Engagement Optimization
  push_notification_sent?: boolean;
  newsletter_included?: boolean;
  social_media_posts?: { platform: string; post_id: string; posted_at: Date }[];

  // Geographic Targeting
  geo_targeting?: {
    countries?: string[];
    regions?: string[];
    cities?: string[];
  };

  // Multimedia
  gallery?: Types.ObjectId[];
  audio?: Types.ObjectId;
  podcast_episode?: Types.ObjectId;
  infographics?: Types.ObjectId[];

  // Related Content
  related_articles?: Types.ObjectId[];
  series?: Types.ObjectId;

  // Performance Metrics
  avg_time_on_page?: number;
  bounce_rate?: number;
  scroll_depth?: number;
  share_count?: number;

  views?: number;
  likes?: number;
  dislikes?: number;
  comments?: number;
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
