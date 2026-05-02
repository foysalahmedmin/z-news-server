export enum UserStatus {
  IN_PROGRESS = 'in-progress',
  BLOCKED = 'blocked',
}

export enum UserAuthSource {
  EMAIL = 'email',
  GOOGLE = 'google',
}

export enum UserRole {
  SUPER_ADMIN = 'super-admin',
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  CONTRIBUTOR = 'contributor',
  SUBSCRIBER = 'subscriber',
  USER = 'user',
}
