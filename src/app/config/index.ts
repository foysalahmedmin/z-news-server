import dotenv from 'dotenv';
import path from 'path';

export type ExpiresIn = `${number}${'s' | 'm' | 'h' | 'd'}`;

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  NODE_ENV: process.env.NODE_ENV as string,
  port: process.env.PORT as string,
  database_url: process.env.DATABASE_URL as string,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS as string,
  default_password: process.env.DEFAULT_PASSWORD as string,
  jwt_access_secret: process.env.JWT_ACCESS_SECRET as string,
  jwt_access_secret_expires_in: process.env
    .JWT_ACCESS_SECRET_EXPIRES_IN as ExpiresIn,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET as string,
  jwt_refresh_secret_expires_in: process.env
    .JWT_REFRESH_SECRET_EXPIRES_IN as ExpiresIn,
  session_secret: process.env.SESSION_SECRET as string,
  reset_password_ui_link: process.env.RESET_PASSWORD_UI_LINK as string,
  auth_user_email: process.env.AUTH_USER_EMAIL as string,
  auth_user_email_password: process.env.AUTH_USER_EMAIL_PASSWORD as string,
};

// console.log(require('crypto').randomBytes(32).toString('hex'))
