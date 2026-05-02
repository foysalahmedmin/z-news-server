import { TRole } from '../../types/jsonwebtoken.type';

export const CATEGORY_WRITE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const CATEGORY_UPDATE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const CATEGORY_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
export const CATEGORY_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const CATEGORY_REORDER_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
