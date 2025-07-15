import { TRole } from '../modules/user/user.type';
import { getIO } from '../socket';

export const notificationToUser = (
  _id: string,
  payload: Record<string, unknown>,
) => {
  if (!_id) return;
  const io = getIO();
  io.to(_id).emit('notification-recipient-created', payload);
};

export const notificationToRole = (
  role: TRole,
  payload: Record<string, unknown>,
) => {
  if (!role) return;
  const io = getIO();
  io.to(`role:${role}`).emit('notification-recipient-created', payload);
};
