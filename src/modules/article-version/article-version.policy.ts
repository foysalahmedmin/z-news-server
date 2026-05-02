import { TRole } from '../../types/jsonwebtoken.type';

export const ARTICLE_VERSION_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
];
export const ARTICLE_VERSION_CREATE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
];
export const ARTICLE_VERSION_RESTORE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const ARTICLE_VERSION_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
