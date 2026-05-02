/* eslint-disable no-console */
import { News } from '../news/news.model';

const runScheduledJobs = async () => {
  const now = new Date();

  console.log(`[Scheduler] Checking for jobs at ${now.toISOString()}...`);

  try {
    // 1. Publish scheduled news that reached their publish time
    const newsToPublish = await News.updateMany(
      {
        status: 'scheduled',
        published_at: { $lte: now },
      },
      {
        $set: { status: 'published' },
      },
    );

    if (newsToPublish.modifiedCount > 0) {
      console.log(
        `[Scheduler] Published ${newsToPublish.modifiedCount} articles.`,
      );
    }

    // 2. Archive published news that reached their expiry time
    const newsToArchive = await News.updateMany(
      {
        status: 'published',
        expired_at: { $lt: now },
      },
      {
        $set: { status: 'archived' },
      },
    );

    if (newsToArchive.modifiedCount > 0) {
      console.log(
        `[Scheduler] Archived ${newsToArchive.modifiedCount} expired articles.`,
      );
    }
  } catch (error) {
    console.error('[Scheduler] Error running background jobs:', error);
  }
};

// Start the scheduler (running every minute)
// Only runs on cluster worker 0 (or non-cluster mode) to prevent race conditions
export const initScheduler = () => {
  const instanceId = process.env.NODE_APP_INSTANCE;
  if (instanceId !== undefined && instanceId !== '0') {
    return;
  }

  console.log('[Scheduler] Background jobs initialized.');

  runScheduledJobs();
  setInterval(runScheduledJobs, 60 * 1000);
};
