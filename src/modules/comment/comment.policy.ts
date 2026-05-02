import { TRole } from '../../types/jsonwebtoken.type';

export const COMMENT_WRITE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const COMMENT_MODERATE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const COMMENT_DELETE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const COMMENT_PIN_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const COMMENT_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
