import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import config from './app/config';
import error from './app/middlewares/error.middleware';
import notfound from './app/middlewares/not-found.middleware';
import router from './app/routes';

dotenv.config();
const app: Application = express();

app.set('trust proxy', 1);

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60,
    },
  }),
);
app.use('/api/v1', router);

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to z-news server!');
});

// Error handle;
app.use(error);

// Not found handle;
app.use(notfound);

export default app;
