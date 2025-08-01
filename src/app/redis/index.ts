import { createClient, RedisClientOptions } from 'redis';
import config from '../config';

const redisUrl = config.redis_url || 'redis://localhost:6379';
const redisEnabled = config.redis_enabled !== false;

// Redis client options with timeout and retry settings
const redisOptions: RedisClientOptions = {
  url: redisUrl,
  socket: {
    connectTimeout: 5000, // 5 seconds timeout
    reconnectStrategy: (retries: number) => {
      console.log(`🔄 Redis reconnection attempt: ${retries}`);
      if (retries > 0) {
        console.error('❌ Max Redis reconnection attempts reached');
        return false; // Stop retrying
      }
      return Math.min(retries * 100, 3000); // Exponential backoff, max 3s
    },
  },
};

if (config.redis_password) {
  redisOptions.password = config.redis_password;
}

// Create clients with improved error handling
const cacheClient = createClient(redisOptions);
const pubClient = createClient(redisOptions);
const subClient = pubClient.duplicate();

// Redis client event listeners
(function () {
  if (!redisEnabled) {
    console.log('🔕 Redis disabled by configuration');
    return;
  }

  const clients = [
    { client: cacheClient, name: 'CacheClient' },
    { client: pubClient, name: 'PubClient' },
    { client: subClient, name: 'SubClient' },
  ];

  clients.forEach(({ client, name }) => {
    client.on('error', (err) => {
      console.warn(`⚠️ ${name} Redis error:`, err.message);
    });

    client.on('connect', () => {
      console.log(`✅ ${name} Redis connected`);
    });

    client.on('ready', () => {
      console.log(`🟢 ${name} Redis ready`);
    });

    client.on('end', () => {
      console.log(`🔴 ${name} Redis connection ended`);
    });
  });
})();

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
    console.log('🔕 Redis disabled by configuration');
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
