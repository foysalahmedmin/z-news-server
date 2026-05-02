import { TRole } from '../../types/jsonwebtoken.type';

export const VIEW_RECORD_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const VIEW_ANALYTICS_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
];
export const VIEW_MANAGE_ROLES: TRole[] = ['super-admin', 'admin'];
