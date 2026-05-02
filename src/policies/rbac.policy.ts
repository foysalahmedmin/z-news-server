import { UserRole } from '../enums/user-role.enum';

type TPermission =
  | 'read'
  | 'write'
  | 'update'
  | 'delete'
  | 'publish'
  | 'manage';
type TResource =
  | 'news'
  | 'category'
  | 'user'
  | 'comment'
  | 'file'
  | 'media'
  | 'workflow'
  | 'notification'
  | 'template';

type TRolePermissions = {
  [role in UserRole]: {
    [resource in TResource]?: TPermission[];
  };
};

export const ROLE_PERMISSIONS: TRolePermissions = {
  [UserRole.SUPER_ADMIN]: {
    news: ['read', 'write', 'update', 'delete', 'publish', 'manage'],
    category: ['read', 'write', 'update', 'delete', 'manage'],
    user: ['read', 'write', 'update', 'delete', 'manage'],
    comment: ['read', 'write', 'update', 'delete', 'manage'],
    file: ['read', 'write', 'update', 'delete', 'manage'],
    media: ['read', 'write', 'update', 'delete', 'manage'],
    workflow: ['read', 'write', 'update', 'delete', 'manage'],
    notification: ['read', 'write', 'manage'],
    template: ['read', 'write', 'update', 'delete', 'manage'],
  },
  [UserRole.ADMIN]: {
    news: ['read', 'write', 'update', 'delete', 'publish'],
    category: ['read', 'write', 'update', 'delete'],
    user: ['read', 'write', 'update', 'delete'],
    comment: ['read', 'update', 'delete'],
    file: ['read', 'write', 'update', 'delete'],
    media: ['read', 'write', 'update', 'delete'],
    workflow: ['read', 'write', 'update'],
    notification: ['read', 'write'],
    template: ['read', 'write', 'update'],
  },
  [UserRole.EDITOR]: {
    news: ['read', 'write', 'update', 'publish'],
    category: ['read', 'write', 'update'],
    comment: ['read', 'update', 'delete'],
    file: ['read', 'write', 'update'],
    media: ['read', 'write', 'update'],
    workflow: ['read', 'write', 'update'],
    template: ['read', 'write'],
  },
  [UserRole.AUTHOR]: {
    news: ['read', 'write', 'update'],
    category: ['read'],
    comment: ['read', 'write'],
    file: ['read', 'write'],
    media: ['read', 'write'],
    workflow: ['read'],
  },
  [UserRole.CONTRIBUTOR]: {
    news: ['read', 'write'],
    category: ['read'],
    comment: ['read', 'write'],
    file: ['read', 'write'],
    media: ['read'],
  },
  [UserRole.SUBSCRIBER]: {
    news: ['read'],
    category: ['read'],
    comment: ['read', 'write'],
    media: ['read'],
  },
  [UserRole.USER]: {
    news: ['read'],
    category: ['read'],
    comment: ['read', 'write'],
    media: ['read'],
  },
};

export const hasPermission = (
  role: UserRole,
  resource: TResource,
  permission: TPermission,
): boolean => {
  const permissions = ROLE_PERMISSIONS[role]?.[resource];
  return permissions?.includes(permission) ?? false;
};
