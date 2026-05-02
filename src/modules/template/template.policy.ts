import { TRole } from '../../types/jsonwebtoken.type';

export const TEMPLATE_WRITE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const TEMPLATE_UPDATE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const TEMPLATE_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
export const TEMPLATE_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
];
export const TEMPLATE_MANAGE_ROLES: TRole[] = ['super-admin', 'admin'];
