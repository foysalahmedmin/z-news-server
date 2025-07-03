import { Document, Model } from 'mongoose';

export type TRole =
  | 'super-admin'
  | 'admin'
  | 'editor'
  | 'author'
  | 'contributor'
  | 'subscriber'
  | 'user';

export type TStatus = 'in-progress' | 'blocked';

export type TUser = {
  name: string;
  email: string;
  password: string;
  password_changed_at?: Date;
  role: TRole;
  status: TStatus;
  is_verified: boolean;
  is_deleted: boolean;
};

export interface TUserDocument extends TUser, Document {
  softDelete(): Promise<TUserDocument | null>;
  isPasswordChanged(jwtTimestamp: number): boolean;
}

export type TUserModel = Model<TUserDocument> & {
  isUserExist(_id: string): Promise<TUserDocument | null>;
  isUserExistByEmail(email: string): Promise<TUserDocument | null>;
};
