import crypto from 'crypto';
import { Request } from 'express';
import { TGuest } from '../types/express-session.type';

const processGuest = async (req: Request): Promise<TGuest> => {
  if (!req.session.guest) {
    const guestId = await generateId(req);
    req.session.guest = {
      _id: guestId,
      session_id: req.sessionID,
      ip_address: await getIpAddress(req),
      user_agent: req.get('User-Agent') || '',
      fingerprint: await generateFingerprint(req),
      preferences: {},
      created_at: new Date(),
    };
  } else {
    req.session.guest.updated_at = new Date();
  }

  await enrichGuestFromRequest(req.session.guest, req);

  return req.session.guest;
};

// ⬇️ These are async to keep signature consistent
const generateId = async (req: Request): Promise<string> => {
  const timestamp = Date.now().toString();
  const sessionId = req.sessionID;
  const randomBytes = crypto.randomBytes(16).toString('hex');

  return crypto
    .createHash('sha256')
    .update(`${sessionId}-${timestamp}-${randomBytes}`)
    .digest('hex')
    .substring(0, 24);
};

const getIpAddress = async (req: Request): Promise<string | undefined> => {
  const forwarded = req.get('X-Forwarded-For');
  const realIp = req.get('X-Real-IP');
  const cfConnectingIp = req.get('CF-Connecting-IP');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return realIp || cfConnectingIp || req.socket.remoteAddress;
};

const generateFingerprint = async (req: Request): Promise<string> => {
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

const enrichGuestFromRequest = async (
  guest: TGuest,
  req: Request,
): Promise<void> => {
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

export default processGuest;
