// src/config/logger.js
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config   from './env.js';
import dayjs from 'dayjs';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Custom format for console logging
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  const ts = dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
  const log = `${ts} [${level}] ${stack || message}`;
  return log;
});

// Custom format for file logging
const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  return JSON.stringify({
    level,
    timestamp: dayjs(timestamp).format(),
    message: stack || message,
    meta
  });
});

// Configure transports based on configironment
const transports = [
  new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    format: combine(errors({ stack: true }), timestamp(), fileFormat)
  })
];

if (config.NODE_config !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      )
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level: config.LOG_LEVEL || 'info',
  defaultMeta: { service: 'ride-sharing-api' },
  transports,
  exceptionHandlers: [
    new DailyRotateFile({
      filename: 'logs/exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d'
    })
  ],
  rejectionHandlers: [
    new DailyRotateFile({
      filename: 'logs/rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
});

// Add HTTP request logging middleware
logger.expressMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
  });

  next();
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

export default logger;