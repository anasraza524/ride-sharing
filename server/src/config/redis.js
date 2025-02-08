import { createClient } from 'redis';
import config from './env.js';

const redisClient = createClient({
  socket: {
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  },
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

redisClient
  .connect()
  .then(() => console.log('Redis connected'))
  .catch((err) => console.error('Redis connection error:', err));

export default redisClient;
