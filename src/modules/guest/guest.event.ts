import { publish } from '../../events/event-publisher';

export const emitGuestSessionCreated = (guestId: string, sessionId: string) =>
  publish('user.registered', { guestId, sessionId, type: 'guest_session' });

export const emitGuestBlocked = (guestId: string, blockedBy: string) =>
  publish('user.verified', { guestId, blockedBy, type: 'guest_blocked' });
