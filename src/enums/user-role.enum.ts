export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  CONTRIBUTOR = 'contributor',
  SUBSCRIBER = 'subscriber',
  USER = 'user',
}

export type TUserRole = `${UserRole}`;

export const USER_ROLES = Object.values(UserRole) as TUserRole[];
