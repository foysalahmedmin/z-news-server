import express from 'express';
import authRoutes from '../modules/auth/auth.route';
import categoryRoutes from '../modules/category/category.route';
import CommentRoutes from '../modules/comment/comment.route';
import NewsBreakRoutes from '../modules/news-break/news-break.route';
import NewsHeadlineRoutes from '../modules/news-headline/news-headline.route';
import NewsRoutes from '../modules/news/news.route';
import NotificationRecipientRoutes from '../modules/notification-recipient/notification-recipient.route';
import notificationRoutes from '../modules/notification/notification.route';
import ReactionRoutes from '../modules/reaction/reaction.route';
import userRoutes from '../modules/user/user.route';
import ViewRoutes from '../modules/view/view.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: 'notification',
    route: notificationRoutes,
  },
  {
    path: 'notification-recipient',
    route: NotificationRecipientRoutes,
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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
