import { TRole } from '../../types/jsonwebtoken.type';

export const AUTH_CHANGE_PASSWORD_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
  'contributor',
  'subscriber',
  'user',
];

export const AUTH_MANAGE_SESSIONS_ROLES: TRole[] = ['super-admin', 'admin'];

export const AUTH_IMPERSONATE_ROLES: TRole[] = ['super-admin'];
