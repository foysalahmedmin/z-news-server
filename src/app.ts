import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'path';
import config from './app/config';
import error from './app/middlewares/error.middleware';
import log from './app/middlewares/log.middleware';
import notfound from './app/middlewares/not-found.middleware';
import { globalRateLimiter } from './app/middlewares/rate-limit.middleware';
import sanitize from './app/middlewares/sanitize.middleware';
import router from './app/routes';

dotenv.config();
const app: Application = express();

app.use(helmet());

// Apply global rate limiting
app.use(globalRateLimiter);

app.set('trust proxy', true);

app.use(express.json({ limit: '1mb' }));

app.use(sanitize);

app.use(cookieParser());

app.use(
  cors({
    origin: [
      'https://z-news.vercel.app',
      'https://www.z-news.vercel.app',
      'https://z-news-website.vercel.app',
      'https://www.z-news-website.vercel.app',
      'https://z-news-server.vercel.app',
      'https://www.z-news-server.vercel.app',
      'https://admin.z-news.com',
      'https://www.admin.z-news.com',
      'https://z-news.com',
      'https://www.z-news.com',
      'https://test.z-news.com',
      'https://www.test.z-news.com',
      'http://admin.z-news.com',
      'http://www.admin.z-news.com',
      'http://z-news.com',
      'http://www.z-news.com',
      'http://test.z-news.com',
      'http://www.test.z-news.com',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      'http://localhost:5001',
      'http://localhost:8080',
      process.env.URL as string,
      process.env.ADMINPANEL_URL as string,
      process.env.WEBSITE_URL as string,
    ]?.filter(Boolean),
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);

app.use(
  session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    // store: MongoStore.create({
    //   mongoUrl: config.database_url,
    //   ttl: 60 * 60 * 24 * 30,
    // }),
    cookie: {
      secure: config.node_dev === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
    },
  }),
);

// Log request middleware
app.use(log);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api', router);

// Health check endpoint for Vercel
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static file serving for frontend (SPA)
app.use(express.static(path.join(__dirname, '../public/dist')));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/index.html'));
});

// Fallback for SPA routing - serves index.html for all unmatched routes
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist', 'index.html'));
});

// Error handling middleware
app.use(error);
app.use(notfound);

export default app;
