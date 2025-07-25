import { Document, Model, Types } from 'mongoose';

export type TStatus = 'active' | 'inactive' | 'archived';
export type TPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TChannel = 'web' | 'push' | 'email';
export type TType =
  | 'news-request'
  | 'news-request-approval'
  | 'news-headline-request'
  | 'news-headline-request-approval'
  | 'news-break-request'
  | 'news-break-request-approval'
  | 'reaction'
  | 'comment'
  | 'reply';

export type TNotification = {
  title: string;
  message: string;
  type: TType;
  priority?: TPriority;
  channels: TChannel[];
  sender: Types.ObjectId;
  expires_at?: Date;
  status?: TStatus;
  is_deleted?: boolean;
};

export interface TNotificationDocument extends TNotification, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TNotificationDocument | null>;
}

export type TNotificationModel = Model<TNotificationDocument> & {
  isCategoryExist(_id: string): Promise<TNotificationDocument | null>;
};
