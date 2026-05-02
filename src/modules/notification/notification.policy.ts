import { TRole } from '../../types/jsonwebtoken.type';

export const NOTIFICATION_SEND_ROLES: TRole[] = ['super-admin', 'admin'];
export const NOTIFICATION_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const NOTIFICATION_MANAGE_ROLES: TRole[] = ['super-admin', 'admin'];
export const NOTIFICATION_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
