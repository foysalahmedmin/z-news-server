import { TRole } from '../../types/jsonwebtoken.type';

export const NEWS_BREAK_WRITE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const NEWS_BREAK_PUBLISH_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const NEWS_BREAK_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
export const NEWS_BREAK_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
