import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import session from 'express-session';
import path from 'path';
import config from './app/config';
import error from './app/middlewares/error.middleware';
import log from './app/middlewares/log.middleware';
import notfound from './app/middlewares/not-found.middleware';
import router from './app/routes';

dotenv.config();
const app: Application = express();

app.set('trust proxy', true);

app.use(express.json({ limit: '1mb' }));

app.use(cookieParser());

app.use(
  cors({
    origin: [
      'http://localhost:8080',
      'http://localhost:3000',
      'http://localhost:3001',
      'https://z-news.vercel.app',
      'https://z-news-server.vercel.app',
      'https://z-news-adminpanel.netlify.app',
    ],
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
    store: MongoStore.create({
      mongoUrl: config.database_url,
      ttl: 60 * 60 * 24 * 30,
    }),
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

// Static file serving for frontend (SPA)
app.use(express.static(path.join(__dirname, '../public/dist')));

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist/index.html'));
});

// Health check endpoint for Vercel
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback for SPA routing - serves index.html for all unmatched routes
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist', 'index.html'));
});

// Error handling middleware
app.use(error);
app.use(notfound);

export default app;
