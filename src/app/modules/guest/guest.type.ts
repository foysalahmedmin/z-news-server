import { Document, Model, Types } from 'mongoose';

export type TRole =
  | 'super-admin'
  | 'admin'
  | 'editor'
  | 'author'
  | 'contributor'
  | 'subscriber'
  | 'Guest';

export type TStatus = 'in-progress' | 'blocked';

export type TGuest = {
  _id: Types.ObjectId;
  name?: string;
  email?: string;
  guest_token: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
  fingerprint?: string;
  preferences: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    timezone?: string;
  };
  status: TStatus;
  is_deleted?: boolean;
};

export interface TGuestDocument extends TGuest, Document {
  _id: Types.ObjectId;
  softDelete(): Promise<TGuestDocument | null>;
  isPasswordChanged(jwtTimestamp: number): boolean;
}

export type TGuestModel = Model<TGuestDocument> & {
  isGuestExist(_id: string): Promise<TGuestDocument | null>;
  isGuestExistByEmail(email: string): Promise<TGuestDocument | null>;
};
