import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { TJwtPayload } from '../auth/auth.type';
import { NotificationRecipient } from './notification-recipient.model';
import { TNotificationRecipient } from './notification-recipient.type';

export const createNotificationRecipient = async (
  data: TNotificationRecipient,
): Promise<TNotificationRecipient> => {
  const result = await NotificationRecipient.create(data);
  return result.toObject();
};

export const getSelfNotificationRecipient = async (
  user: TJwtPayload,
  id: string,
): Promise<TNotificationRecipient> => {
  const result = await NotificationRecipient.findOne({
    _id: id,
    author: user._id,
  }).lean();

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification recipient not found',
    );
  }
  return result;
};

export const getNotificationRecipient = async (
  id: string,
): Promise<TNotificationRecipient> => {
  const result = await NotificationRecipient.findById(id).lean();

  if (!result) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification recipient not found',
    );
  }
  return result;
};

export const getSelfNotificationRecipients = async (
  user: TJwtPayload,
  query: Record<string, unknown>,
): Promise<{
  data: TNotificationRecipient[];
  meta: { total: number; page: number; limit: number };
}> => {
  const notificationQuery = new AppQuery<TNotificationRecipient>(
    NotificationRecipient.find({ author: user._id }).populate([
      { path: 'recipient', select: '_id name email image' },
      { path: 'notification', select: '_id title type sender' },
    ]),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  return await notificationQuery.execute([
    {
      key: 'unread',
      filter: { is_read: false },
    },
  ]);
};

export const getNotificationRecipients = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNotificationRecipient[];
  meta: { total: number; page: number; limit: number };
}> => {
  const notificationQuery = new AppQuery<TNotificationRecipient>(
    NotificationRecipient.find().populate([
      { path: 'recipient', select: '_id name email image' },
      { path: 'notification', select: '_id title type sender' },
    ]),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  return await notificationQuery.execute([
    {
      key: 'unread',
      filter: { is_read: false },
    },
  ]);
};

export const updateSelfNotificationRecipient = async (
  user: TJwtPayload,
  id: string,
  payload: Partial<Pick<TNotificationRecipient, 'is_read' | 'read_at'>>,
): Promise<TNotificationRecipient> => {
  const data = await NotificationRecipient.findOne({
    _id: id,
    author: user._id,
  }).lean();

  if (!data) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification recipient not found',
    );
  }

  const result = await NotificationRecipient.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateNotificationRecipient = async (
  id: string,
  payload: Partial<Pick<TNotificationRecipient, 'is_read' | 'read_at'>>,
): Promise<TNotificationRecipient> => {
  const data = await NotificationRecipient.findById(id).lean();

  if (!data) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification recipient not found',
    );
  }

  const result = await NotificationRecipient.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  return result!;
};

export const updateSelfNotificationRecipients = async (
  user: TJwtPayload,
  ids: string[],
  payload: Partial<Pick<TNotificationRecipient, 'is_read' | 'read_at'>>,
): Promise<{ count: number; not_found_ids: string[] }> => {
  const recipients = await NotificationRecipient.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();

  const foundIds = recipients.map((r) => r._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NotificationRecipient.updateMany(
    { _id: { $in: foundIds }, author: user._id },
    { ...payload },
  );

  return { count: result.modifiedCount, not_found_ids: notFoundIds };
};

export const updateNotificationRecipients = async (
  ids: string[],
  payload: Partial<Pick<TNotificationRecipient, 'is_read' | 'read_at'>>,
): Promise<{ count: number; not_found_ids: string[] }> => {
  const recipients = await NotificationRecipient.find({
    _id: { $in: ids },
  }).lean();

  const foundIds = recipients.map((r) => r._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NotificationRecipient.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return { count: result.modifiedCount, not_found_ids: notFoundIds };
};

export const deleteSelfNotificationRecipient = async (
  user: TJwtPayload,
  id: string,
): Promise<void> => {
  const data = await NotificationRecipient.findOne({
    _id: id,
    author: user._id,
  });
  if (!data)
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification recipient not found',
    );

  await data.softDelete();
};

export const deleteNotificationRecipient = async (
  id: string,
): Promise<void> => {
  const data = await NotificationRecipient.findById(id);
  if (!data)
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification recipient not found',
    );

  await data.softDelete();
};

export const deleteNotificationRecipientPermanent = async (
  id: string,
): Promise<void> => {
  const data = await NotificationRecipient.findById(id).lean();
  if (!data)
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification recipient not found',
    );

  await NotificationRecipient.findByIdAndDelete(id);
};

export const deleteSelfNotificationRecipients = async (
  user: TJwtPayload,
  ids: string[],
): Promise<{ count: number; not_found_ids: string[] }> => {
  const data = await NotificationRecipient.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();

  const foundIds = data.map((d) => d._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NotificationRecipient.updateMany(
    { _id: { $in: foundIds }, author: user._id },
    { is_deleted: true },
  );

  return { count: foundIds.length, not_found_ids: notFoundIds };
};

export const deleteNotificationRecipients = async (
  ids: string[],
): Promise<{ count: number; not_found_ids: string[] }> => {
  const data = await NotificationRecipient.find({ _id: { $in: ids } }).lean();
  const foundIds = data.map((d) => d._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NotificationRecipient.updateMany(
    { _id: { $in: foundIds } },
    { is_deleted: true },
  );

  return { count: foundIds.length, not_found_ids: notFoundIds };
};

export const deleteNotificationRecipientsPermanent = async (
  ids: string[],
): Promise<{ count: number; not_found_ids: string[] }> => {
  const data = await NotificationRecipient.find({ _id: { $in: ids } }).lean();
  const foundIds = data.map((d) => d._id.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NotificationRecipient.deleteMany({ _id: { $in: foundIds } });

  return { count: foundIds.length, not_found_ids: notFoundIds };
};

export const restoreSelfNotificationRecipient = async (
  user: TJwtPayload,
  id: string,
): Promise<TNotificationRecipient> => {
  const data = await NotificationRecipient.findOneAndUpdate(
    { _id: id, is_deleted: true, author: user._id },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!data) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification recipient not found or not deleted',
    );
  }

  return data;
};

export const restoreNotificationRecipient = async (
  id: string,
): Promise<TNotificationRecipient> => {
  const data = await NotificationRecipient.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  ).lean();

  if (!data) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification recipient not found or not deleted',
    );
  }

  return data;
};

export const restoreSelfNotificationRecipients = async (
  user: TJwtPayload,
  ids: string[],
): Promise<{ count: number; not_found_ids: string[] }> => {
  const result = await NotificationRecipient.updateMany(
    { _id: { $in: ids }, is_deleted: true, author: user._id },
    { is_deleted: false },
  );

  const restored = await NotificationRecipient.find({
    _id: { $in: ids },
    author: user._id,
  }).lean();

  const restoredIds = restored.map((r) => r._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return { count: result.modifiedCount, not_found_ids: notFoundIds };
};

export const restoreNotificationRecipients = async (
  ids: string[],
): Promise<{ count: number; not_found_ids: string[] }> => {
  const result = await NotificationRecipient.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restored = await NotificationRecipient.find({
    _id: { $in: ids },
  }).lean();

  const restoredIds = restored.map((r) => r._id.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return { count: result.modifiedCount, not_found_ids: notFoundIds };
};
