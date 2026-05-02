import { TRole } from '../../types/jsonwebtoken.type';

export const BADGE_WRITE_ROLES: TRole[] = ['super-admin', 'admin'];
export const BADGE_UPDATE_ROLES: TRole[] = ['super-admin', 'admin'];
export const BADGE_DELETE_ROLES: TRole[] = ['super-admin'];
export const BADGE_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const BADGE_AWARD_ROLES: TRole[] = ['super-admin', 'admin'];
