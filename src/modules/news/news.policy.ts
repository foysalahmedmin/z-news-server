import { TRole } from '../../types/jsonwebtoken.type';

export const NEWS_WRITE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
];
export const NEWS_PUBLISH_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const NEWS_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
export const NEWS_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const NEWS_FEATURE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const NEWS_FACT_CHECK_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const NEWS_SCHEDULE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
