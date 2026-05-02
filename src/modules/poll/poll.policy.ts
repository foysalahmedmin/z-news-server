import { TRole } from '../../types/jsonwebtoken.type';

export const POLL_WRITE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const POLL_UPDATE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const POLL_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
export const POLL_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const POLL_VOTE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const POLL_FEATURE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
