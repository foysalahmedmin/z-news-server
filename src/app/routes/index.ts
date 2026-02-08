import express from 'express';
import ArticleVersionRoutes from '../modules/article-version/article-version.route';
import authRoutes from '../modules/auth/auth.route';
import BadgeRoutes from '../modules/badge/badge.route';
import BookmarkRoutes from '../modules/bookmark/bookmark.route';
import categoryRoutes from '../modules/category/category.route';
import CommentRoutes from '../modules/comment/comment.route';
import eventRoutes from '../modules/event/event.route';
import fileRoutes from '../modules/file/file.route';
import guestRoutes from '../modules/guest/guest.route';
import mediaRoutes from '../modules/media/media.route';
import NewsBreakRoutes from '../modules/news-break/news-break.route';
import NewsHeadlineRoutes from '../modules/news-headline/news-headline.route';
import NewsRoutes from '../modules/news/news.route';
import NotificationRecipientRoutes from '../modules/notification-recipient/notification-recipient.route';
import notificationRoutes from '../modules/notification/notification.route';
import PollRoutes from '../modules/poll/poll.route';
import ReactionRoutes from '../modules/reaction/reaction.route';
import storageRoutes from '../modules/storage/storage.route';
import UserProfileRoutes from '../modules/user-profile/user-profile.route';
import userRoutes from '../modules/user/user.route';
import ViewRoutes from '../modules/view/view.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/user',
    route: userRoutes,
  },
  {
    path: '/guest',
    route: guestRoutes,
  },
  {
    path: '/notification',
    route: notificationRoutes,
  },
  {
    path: '/notification-recipient',
    route: NotificationRecipientRoutes,
  },
  {
    path: '/event',
    route: eventRoutes,
  },
  {
    path: '/file',
    route: fileRoutes,
  },
  {
    path: '/category',
    route: categoryRoutes,
  },
  {
    path: '/news',
    route: NewsRoutes,
  },
  {
    path: '/news-headline',
    route: NewsHeadlineRoutes,
  },
  {
    path: '/news-break',
    route: NewsBreakRoutes,
  },
  {
    path: '/comment',
    route: CommentRoutes,
  },
  {
    path: '/reaction',
    route: ReactionRoutes,
  },
  {
    path: '/view',
    route: ViewRoutes,
  },
  {
    path: '/media',
    route: mediaRoutes,
  },
  {
    path: '/storage',
    route: storageRoutes,
  },
  {
    path: '/user-profile',
    route: UserProfileRoutes,
  },
  {
    path: '/badge',
    route: BadgeRoutes,
  },
  {
    path: '/bookmark',
    route: BookmarkRoutes,
  },
  {
    path: '/poll',
    route: PollRoutes,
  },
  {
    path: '/article-version',
    route: ArticleVersionRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
