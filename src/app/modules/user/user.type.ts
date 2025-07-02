import { Model, Types } from 'mongoose';
import { TRole } from '../../types/role';

export type TUser = {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  password_changed_at?: Date;
  role: TRole;
  status: 'in-progress' | 'blocked';
  is_verified: boolean;
  is_deleted: boolean;
};

export interface TUserModel extends Model<TUser> {
  isUserExist(_id: string): Promise<TUser>;
  isUserExistByEmail(id: string): Promise<TUser>;
}
