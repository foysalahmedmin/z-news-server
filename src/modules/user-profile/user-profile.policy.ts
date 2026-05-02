import { TRole } from '../../types/jsonwebtoken.type';

export const USER_PROFILE_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const USER_PROFILE_UPDATE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const USER_PROFILE_MANAGE_ROLES: TRole[] = ['super-admin', 'admin'];
export const USER_PROFILE_VERIFY_READER_ROLES: TRole[] = [
  'super-admin',
  'admin',
];
export const USER_PROFILE_GRANT_PREMIUM_ROLES: TRole[] = [
  'super-admin',
  'admin',
];
