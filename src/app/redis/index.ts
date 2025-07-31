import { createClient } from 'redis';
import config from '../config';

const redisUrl = config.redis_url || 'redis://localhost:6379';
const redisEnabled = config.redis_enabled !== false; // Default true, unless explicitly disabled

// Redis client options with timeout and retry settings
const redisOptions = {
  url: redisUrl,
  socket: {
    connectTimeout: 5000, // 5 seconds timeout
    lazyConnect: true, // Don't auto-connect
    reconnectStrategy: (retries: number) => {
      console.log(`🔄 Redis reconnection attempt: ${retries + 1}`);
      if (retries > 5) {
        console.error('❌ Max Redis reconnection attempts reached');
        return false; // Stop retrying
      }
      return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
    },
  },
};

// Create clients with improved error handling
const cacheClient = createClient(redisOptions);
const pubClient = createClient(redisOptions);
const subClient = pubClient.duplicate();

// Enhanced error handling
cacheClient.on('error', (err) => {
  console.warn('⚠️ CacheClient Redis error:', err.message);
});

cacheClient.on('connect', () => {
  console.log('✅ CacheClient Redis connected');
});

cacheClient.on('ready', () => {
  console.log('🟢 CacheClient Redis ready');
});

cacheClient.on('end', () => {
  console.log('🔴 CacheClient Redis connection ended');
});

pubClient.on('error', (err) => {
  console.warn('⚠️ PubClient Redis error:', err.message);
});

pubClient.on('connect', () => {
  console.log('✅ PubClient Redis connected');
});

subClient.on('error', (err) => {
  console.warn('⚠️ SubClient Redis error:', err.message);
});

subClient.on('connect', () => {
  console.log('✅ SubClient Redis connected');
});

// Helper function to safely connect Redis
export const connectRedis = async () => {
  if (!redisEnabled) {
    console.log('🔕 Redis disabled by configuration');
    return false;
  }

  try {
    if (!cacheClient.isOpen) {
      await cacheClient.connect();
    }
    return true;
  } catch (error) {
    console.warn('⚠️ Redis cache connection failed:', error);
    return false;
  }
};

// Helper function to check Redis connectivity
export const checkRedis = async (): Promise<boolean> => {
  if (!redisEnabled) {
    return false;
  }

  try {
    await cacheClient.ping();
    return true;
  } catch (error) {
    console.warn('⚠️ Redis ping failed:', error);
    return false;
  }
};

export const initializeRedis = async () => {
  if (!redisEnabled) {
    console.log('🔕 Redis disabled by configuration');
    return;
  }

  const redisConnected = await connectRedis();
  if (redisConnected) {
    const isHealthy = await checkRedis();
    if (isHealthy) {
      console.log(
        `✅ Redis (cache) connected and healthy - PID: ${process.pid}`,
      );
    } else {
      console.warn(
        `⚠️ Redis connected but not responding - PID: ${process.pid}`,
      );
    }
  } else {
    console.warn(
      `⚠️ Redis not available, running without cache - PID: ${process.pid}`,
    );
  }
};

export { cacheClient, pubClient, subClient };
