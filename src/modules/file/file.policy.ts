import { TRole } from '../../types/jsonwebtoken.type';

export const FILE_UPLOAD_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
];
export const FILE_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const FILE_UPDATE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
];
export const FILE_DELETE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const FILE_MANAGE_ROLES: TRole[] = ['super-admin', 'admin'];
