import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import config from './app/config';
import error from './app/middlewares/error.middleware';
import notfound from './app/middlewares/not-found.middleware';
import router from './app/routes';

dotenv.config();
const app: Application = express();

app.set('trust proxy', 1);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: '*', // or "*" for all origins
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
      ttl: (1000 * 60 * 60 * 24) / 1000,
    }),
    cookie: {
      secure: config.node_dev === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// ✅ static serve first
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', router);

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to z-news server!');
});

// Error handle;
app.use(error);

// Not found handle;
app.use(notfound);

export default app;
