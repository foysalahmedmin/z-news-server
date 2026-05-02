import { TRole } from '../../types/jsonwebtoken.type';

export const EVENT_WRITE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const EVENT_UPDATE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const EVENT_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
export const EVENT_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const EVENT_FEATURE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
