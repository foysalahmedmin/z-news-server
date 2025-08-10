import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import AppError from '../builder/AppError';
import { TGuest } from '../types/express-session.type';
import catchAsync from '../utils/catchAsync';

const COOKIE_NAME = 'guest';
const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 365; // 1 year

async function initialize(req: Request, res: Response): Promise<TGuest> {
  // Try get guest id from cookie, else generate new
  let guest_id = req.cookies[COOKIE_NAME];
  if (!guest_id) {
    guest_id = crypto.randomBytes(12).toString('hex'); // 24-char ID;
    res.cookie(COOKIE_NAME, guest_id, {
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  // Setup guest session object
  const now = new Date();
  const guest: TGuest = {
    _id: guest_id,
    fingerprint: await fingerprint(req),
    session_id: req.sessionID,
    user_agent: req.get('User-Agent') || '',
    ip_address:
      req.get('X-Forwarded-For')?.split(',')[0].trim() ||
      req.get('X-Real-IP') ||
      req.get('CF-Connecting-IP') ||
      req.socket.remoteAddress,
    preferences: {},
    created_at: now,
  };

  // Attach to session
  req.session.guest = guest;

  // Enrich preferences or other data from request
  await enrichGuestFromRequest(guest, req);

  return guest;
}

// Generate fingerprint
export const fingerprint = async (req: Request): Promise<string> => {
  const userAgent = req.get('User-Agent') || '';
  const acceptLanguage = req.get('Accept-Language') || '';
  const acceptEncoding = req.get('Accept-Encoding') || '';
  const dnt = req.get('DNT') || '';

  return crypto
    .createHash('md5')
    .update(`${userAgent}|${acceptLanguage}|${acceptEncoding}|${dnt}`)
    .digest('hex')
    .substring(0, 16);
};

// Enrich guest with preferences
export const enrichGuestFromRequest = async (
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

const guest = (status: 'mandatory' | 'optional') =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let guest: TGuest | undefined = req.session?.guest;

    // Initialize guest if missing or invalid
    if (!guest || !guest._id) {
      guest = await initialize(req, res);
    } else {
      req.session.guest = guest;
    }

    // Check mandatory status
    if ((!guest || !guest._id) && status === 'mandatory') {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        'Unable to establish guest session.',
      );
    }

    // Attach guest to req for downstream use
    if (guest && guest._id) {
      req.guest = guest;
    }

    next();
  });

export default guest;
