import crypto from 'crypto';
import { Request } from 'express';
import { TGuest } from '../types/express-session.type';

export const processGuest = (req: Request): TGuest => {
  if (!req.session.guest) {
    req.session.guest = {
      _id: generateId(req),
      session_id: req.sessionID,
      ip_address: getIpAddress(req),
      user_agent: req.get('User-Agent') || '',
      fingerprint: generateFingerprint(req),
      preferences: {},
      created_at: new Date(),
    };
  } else {
    req.session.guest.updated_at = new Date();
  }

  enrichGuestFromRequest(req.session.guest, req);

  return req.session.guest;
};

const generateId = (req: Request): string => {
  const timestamp = Date.now().toString();
  const sessionId = req.sessionID;
  const randomBytes = crypto.randomBytes(16).toString('hex');

  return crypto
    .createHash('sha256')
    .update(`${sessionId}-${timestamp}-${randomBytes}`)
    .digest('hex')
    .substring(0, 24);
};

const getIpAddress = (req: Request): string | undefined => {
  const forwarded = req.get('X-Forwarded-For');
  const realIp = req.get('X-Real-IP');
  const cfConnectingIp = req.get('CF-Connecting-IP');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return realIp || cfConnectingIp || req.socket.remoteAddress;
};

const generateFingerprint = (req: Request): string => {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  const dnt = req.get('DNT') || '';

  const fingerprintString = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${dnt}`;

  return crypto
    .createHash('md5')
    .update(fingerprintString)
    .digest('hex')
    .substring(0, 16);
};

const enrichGuestFromRequest = (guest: TGuest, req: Request): void => {
  const theme = (req.query.theme as string) || req.get('X-Theme');
  if (theme && ['light', 'dark', 'system'].includes(theme)) {
    guest.preferences.theme = theme as 'light' | 'dark' | 'system';
  }

  const timezone = (req.query.tz as string) || req.get('X-Timezone');
  if (timezone) {
    guest.preferences.timezone = timezone;
  }

  const language =
    (req.query.lang as string) || req.get('Accept-Language')?.split(',')[0];
  if (language) {
    guest.preferences.language = language;
  }
};
