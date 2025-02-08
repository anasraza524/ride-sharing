import dotenv from 'dotenv';
dotenv.config();

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  JWT_SECRET: process.env.JWT_SECRET || 'your_fallback_secret',
  PORT: process.env.PORT || 5000,
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};
