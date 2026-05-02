import { TRole } from '../../types/jsonwebtoken.type';

export const WORKFLOW_WRITE_ROLES: TRole[] = ['super-admin', 'admin', 'editor'];
export const WORKFLOW_REVIEW_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const WORKFLOW_APPROVE_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
];
export const WORKFLOW_READ_ROLES: TRole[] = [
  'super-admin',
  'admin',
  'editor',
  'author',
];
export const WORKFLOW_DELETE_ROLES: TRole[] = ['super-admin', 'admin'];
export const WORKFLOW_MANAGE_ROLES: TRole[] = ['super-admin', 'admin'];
