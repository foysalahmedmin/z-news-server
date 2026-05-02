import { TRole } from '../../types/jsonwebtoken.type';

export const REACTION_WRITE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const REACTION_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];
export const REACTION_MODERATE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const REACTION_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
