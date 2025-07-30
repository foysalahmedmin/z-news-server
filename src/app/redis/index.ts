import { createClient } from 'redis';
import config from '../config';

const redisUrl = config.redis_url || 'redis://localhost:6379';

// For caching
const cacheClient = createClient({ url: redisUrl });

// For Socket.io adapter
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();

cacheClient.on('error', (err) =>
  console.warn('⚠️ CacheClient Redis error:', err),
);
pubClient.on('error', (err) => console.warn('⚠️ PubClient Redis error:', err));
subClient.on('error', (err) => console.warn('⚠️ SubClient Redis error:', err));

export { cacheClient, pubClient, subClient };
