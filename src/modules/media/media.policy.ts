import { TRole } from '../../types/jsonwebtoken.type';

export const MEDIA_UPLOAD_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
];
export const MEDIA_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const MEDIA_UPDATE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
];
export const MEDIA_DELETE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const MEDIA_MANAGE_ROLES: TRole[] = ['super-admin', 'admin'];
