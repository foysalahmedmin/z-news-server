// src/app/redis.ts
import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();
const cacheClient = pubClient.duplicate();

export { cacheClient, pubClient, subClient };
