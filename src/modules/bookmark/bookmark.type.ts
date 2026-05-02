import { Document, Model, Types } from 'mongoose';

export type TBookmark = {
  user: Types.ObjectId;
  news: Types.ObjectId;
  reading_list?: Types.ObjectId;
  notes?: string;
  is_read: boolean;
  read_at?: Date;
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export type TReadingList = {
  user: Types.ObjectId;
  name: string;
  description?: string;
  is_public: boolean;
  bookmarks: Types.ObjectId[];
  followers: Types.ObjectId[];
  is_deleted: boolean;
  created_at?: Date;
  updated_at?: Date;
};

export type TBookmarkDocument = TBookmark &
  Document & {
    softDelete(): Promise<TBookmarkDocument>;
  };
export type TReadingListDocument = TReadingList &
  Document & {
    softDelete(): Promise<TReadingListDocument>;
  };

export type TBookmarkModel = Model<TBookmarkDocument> & {
  isBookmarkExist(_id: string): Promise<TBookmarkDocument | null>;
  getBookmarksByUserId(userId: string): Promise<TBookmarkDocument[] | null>;
  isAlreadyBookmarked(
    userId: string,
    newsId: string,
  ): Promise<TBookmarkDocument | null>;
};

export type TReadingListModel = Model<TReadingListDocument> & {
  isReadingListExist(_id: string): Promise<TReadingListDocument | null>;
  getReadingListsByUserId(
    userId: string,
  ): Promise<TReadingListDocument[] | null>;
};
