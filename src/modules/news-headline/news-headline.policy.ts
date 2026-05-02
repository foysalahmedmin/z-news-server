import { TRole } from '../../types/jsonwebtoken.type';

export const NEWS_HEADLINE_WRITE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const NEWS_HEADLINE_PUBLISH_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const NEWS_HEADLINE_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
export const NEWS_HEADLINE_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
