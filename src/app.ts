import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application } from 'express';
import session from 'express-session';
import path from 'path';
import config from './app/config';
import error from './app/middlewares/error.middleware';
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

// ✅ static serve first
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', router);

app.use(express.static(path.join(__dirname, '../public/dist')));

// Fallback for SPA routing - serves index.html for all unmatched routes
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, '../public/dist', 'index.html'));
});

// Error handle;
app.use(error);

// Not found handle;
app.use(notfound);

export default app;
