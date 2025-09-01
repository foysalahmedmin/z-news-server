import httpStatus from 'http-status';
import AppError from '../../builder/AppError';
import AppQuery from '../../builder/AppQuery';
import { emitToRole, emitToUser } from '../../socket';
import { News } from '../news/news.model';
import { NotificationRecipient } from '../notification-recipient/notification-recipient.model';
import { User } from '../user/user.model';
import { Notification } from './notification.model';
import { TNotification, TType } from './notification.type';

export const createNotification = async (
  data: TNotification,
): Promise<TNotification> => {
  const result = await Notification.create(data);
  return result.toObject();
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

      const notification = await Notification.create(notificationPayload);

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

      const result = await NotificationRecipient.findOne({
        notification: notification._id,
      })
        .populate('notification')
        .populate('recipient', 'name email role');

      // Send to admin role room
      emitToRole('admin', 'notification-recipient-created', result);
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

      const notification = await Notification.create(notificationPayload);

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

      await NotificationRecipient.create(recipient);

      const result = await NotificationRecipient.findOne({
        notification: notification._id,
      })
        .populate('notification')
        .populate('recipient', 'name email role');

      // Send to admin role room
      emitToUser(
        news.author.toString(),
        'notification-recipient-created',
        result,
      );
    }
  } catch (error) {
    console.error('❌ Failed to send news request notification:', error);
  }
};

export const getNotification = async (id: string): Promise<TNotification> => {
  const result = await Notification.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  return result;
};

export const getNotifications = async (
  query: Record<string, unknown>,
): Promise<{
  data: TNotification[];
  meta: { total: number; page: number; limit: number };
}> => {
  const notificationQuery = new AppQuery<TNotification>(
    Notification.find(),
    query,
  )
    .search(['title', 'message', 'type', 'priority'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .tap((q) => q.lean());

  const result = await notificationQuery.execute();

  return result;
};

export const updateNotification = async (
  id: string,
  payload: Partial<
    Pick<TNotification, 'title' | 'message' | 'type' | 'priority'>
  >,
): Promise<TNotification> => {
  const data = await Notification.findById(id).lean();
  if (!data) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  const result = await Notification.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  return result!;
};

export const updateNotifications = async (
  ids: string[],
  payload: Partial<Pick<TNotification, 'status'>>,
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const notifications = await Notification.find({ _id: { $in: ids } }).lean();
  const foundIds = notifications.map((notification) =>
    notification._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  const result = await Notification.updateMany(
    { _id: { $in: foundIds } },
    { ...payload },
  );

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};

export const deleteNotification = async (id: string): Promise<void> => {
  const notification = await Notification.findById(id);
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  await notification.softDelete();
};

export const deleteNotificationPermanent = async (
  id: string,
): Promise<void> => {
  const notification = await Notification.findById(id).lean();
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, 'Notification not found');
  }

  await Notification.findByIdAndDelete(id);
};

export const deleteNotifications = async (
  ids: string[],
): Promise<{
  count: number;
  not_found_ids: string[];
}> => {
  const notifications = await Notification.find({ _id: { $in: ids } }).lean();
  const foundIds = notifications.map((notification) =>
    notification._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Notification.updateMany(
    { _id: { $in: foundIds } },
    { is_deleted: true },
  );

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
  const notifications = await Notification.find({ _id: { $in: ids } }).lean();
  const foundIds = notifications.map((notification) =>
    notification._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !foundIds.includes(id));

  await Notification.deleteMany({ _id: { $in: foundIds } });

  return {
    count: foundIds.length,
    not_found_ids: notFoundIds,
  };
};

export const restoreNotification = async (
  id: string,
): Promise<TNotification> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: id, is_deleted: true },
    { is_deleted: false },
    { new: true },
  );

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
  const result = await Notification.updateMany(
    { _id: { $in: ids }, is_deleted: true },
    { is_deleted: false },
  );

  const restoredNotifications = await Notification.find({
    _id: { $in: ids },
  }).lean();
  const restoredIds = restoredNotifications.map((notification) =>
    notification._id.toString(),
  );
  const notFoundIds = ids.filter((id) => !restoredIds.includes(id));

  return {
    count: result.modifiedCount,
    not_found_ids: notFoundIds,
  };
};
