/* eslint-disable no-console */
import httpStatus from 'http-status';
import AppError from '../../builder/app-error';
import { emitToUser } from '../../config/socket';
import {
  generateCacheKey,
  invalidateCacheByPattern,
  withCache,
} from '../../utils/cache.utils';
import { sendEmail } from '../../utils/send-email';
import { News } from '../news/news.model';
import { NotificationRecipient } from '../notification-recipient/notification-recipient.model';
import { User } from '../user/user.model';
import * as NotificationRepository from './notification.repository';
import { TNotification, TType } from './notification.type';

const CACHE_PREFIX = 'notification';
const CACHE_TTL = 300; // 5 minutes

export const createNotification = async (
  data: TNotification,
): Promise<TNotification> => {
  const result = await NotificationRepository.create(data);
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  return result;
};

export const sendNewsNotification = async (payload: {
  news: string;
  sender: string;
  type: TType;
}) => {
  try {
    const news = await News.findById(payload.news).populate('author').lean();
    const sender = await User.findById(payload.sender).lean();
    const type = payload.type;

    if (type === 'news-request' && news && sender) {
      const notificationPayload: TNotification = {
        title: 'New News Request',
        message: `${sender?.name || 'Author'} has submitted a news request: "${news.title}"`,
        type: 'news-request',
        priority: 'medium',
        channels: ['web', 'push'],
        sender: sender?._id.toString(),
      };

      const notification =
        await NotificationRepository.create(notificationPayload);

      const admins = await User.find({
        role: 'admin',
      });

      const recipients = admins.map((admin) => ({
        notification: notification._id,
        recipient: admin._id,
        metadata: {
          url: `/admin/news-requests/${news?._id.toString()}`,
          source: 'news-management',
          reference: news._id.toString(),
          actions: [
            {
              title: 'Review',
              type: 'news-view',
              url: `/news-articles/${news._id.toString()}`,
            },
            {
              title: 'Published',
              type: 'news-published',
            },
          ],
        },
      }));

      await NotificationRecipient.insertMany(recipients);

      // Emit to each admin individually
      const populatedRecipients = await NotificationRecipient.find({
        notification: notification._id,
      })
        .populate([
          {
            path: 'notification',
            select:
              '_id title message type sender priority channels created_at',
          },
          { path: 'recipient', select: '_id name email image role' },
        ])
        .lean();

      // Send to each admin individually for better targeting
      for (const recipient of populatedRecipients) {
        if (
          recipient.recipient &&
          typeof recipient.recipient === 'object' &&
          '_id' in recipient.recipient
        ) {
          emitToUser(
            recipient.recipient._id.toString(),
            'notification-recipient-created',
            recipient,
          );
        }
      }
    }
    if (type === 'news-request-response' && news && sender) {
      const notificationPayload: TNotification = {
        title: 'New News Request Response',
        message: `${sender?.name || 'Admin'} has ${news.status} your news request: "${news.title}"`,
        type: 'news-request-response',
        priority: 'medium',
        channels: ['web', 'push'],
        sender: sender?._id.toString(),
      };

      const notification =
        await NotificationRepository.create(notificationPayload);

      const recipient = {
        notification: notification._id,
        recipient: news.author.toString(),
        metadata: {
          url: `/admin/news-requests/${news?._id.toString()}`,
          source: 'news-management',
          reference: news._id.toString(),
          actions: [
            {
              title: 'Review',
              type: 'news-view',
              url: `/news-articles/${news._id.toString()}`,
            },
          ],
        },
      };

      const createdRecipient = await NotificationRecipient.create(recipient);

      const result = await NotificationRecipient.findOne({
        _id: createdRecipient._id,
      })
        .populate([
          {
            path: 'notification',
            select:
              '_id title message type sender priority channels created_at',
          },
          { path: 'recipient', select: '_id name email image role' },
        ])
        .lean();

      // Send to the news author
      if (result && news.author) {
        let authorId: string;
        let authorEmail: string | null = null;
        if (
          typeof news.author === 'object' &&
          news.author !== null &&
          '_id' in news.author
        ) {
          const authorObj = news.author as {
            _id: { toString(): string };
            email?: string;
          };
          authorId = authorObj._id.toString();
          authorEmail = authorObj.email ?? null;
        } else {
          authorId = String(news.author);
        }

        emitToUser(authorId, 'notification-recipient-created', result);

        if (authorEmail) {
          sendEmail({
            to: authorEmail,
            subject: notificationPayload.title,
            text: notificationPayload.message,
            html: `<p>${notificationPayload.message}</p><p><a href="${recipient.metadata.url}">View article</a></p>`,
          }).catch((err) =>
            console.error('Failed to send notification email:', err),
          );
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to send news request notification:', error);
  }
};

export const getNotification = async (id: string): Promise<TNotification> => {
  return await withCache(
    generateCacheKey(CACHE_PREFIX, ['id', id]),
    CACHE_TTL,
    async () => {
      const result = await NotificationRepository.findByIdLean(id);
      if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
      }
      return result;
    },
  );
};

export const getNotifications = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNotification[];
  meta: { total: number; page: number; limit: number };
}> => {
  const cacheKey = generateCacheKey(CACHE_PREFIX, ['list', query]);
  return await withCache(cacheKey, CACHE_TTL, () =>
    NotificationRepository.findPaginated(query),
  );
};

export const updateNotification = async (
  id: string,
  payload: Partial<
    Pick<TNotification, 'title' | 'message' | 'type' | 'priority'>
  >,
): Promise<TNotification> => {
  const exists = await NotificationRepository.findByIdLean(id);
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  const result = await NotificationRepository.updateById(id, payload);
  if (result) {
    await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
  }

  return result!;
};

export const updateNotifications = async (
  ids: string[],
  payload: Partial<Pick<TNotification, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const notifications = await NotificationRepository.findManyByIds(ids);
  const foundIds = notifications.map((n) => n._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await NotificationRepository.updateManyByIds(
    foundIds,
    payload,
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteNotification = async (id: string): Promise<void> => {
  const notification = await NotificationRepository.findById(id);
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  await notification.softDelete();
  await invalidateCacheByPattern(`${CACHE_PREFIX}:*`);
};

export const deleteNotificationPermanent = async (
  id: string,
): Promise<void> => {
  const notification = await NotificationRepository.findByIdWithBypass(id);
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  await NotificationRepository.hardDeleteById(id);
};

export const deleteNotifications = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const notifications = await NotificationRepository.findManyByIds(ids);
  const foundIds = notifications.map((n) => n._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NotificationRepository.softDeleteManyByIds(foundIds);

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const deleteNotificationsPermanent = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const notifications = await NotificationRepository.findManyByIdsBypass(ids, {
    is_deleted: true,
  });
  const foundIds = notifications.map((n) => n._id!.toString());
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await NotificationRepository.hardDeleteManyByIds(foundIds);

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreNotification = async (
  id: string,
): Promise<TNotification> => {
  const notification = await NotificationRepository.restoreById(id);

  if (!notification) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Notification not found or not deleted',
    );
  }

  return notification;
};

export const restoreNotifications = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const result = await NotificationRepository.restoreManyByIds(ids);

  const restoredNotifications = await NotificationRepository.findManyByIds(ids);
  const restoredIds = restoredNotifications.map((n) => n._id!.toString());
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
