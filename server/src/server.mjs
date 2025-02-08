// src/server.js
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import config from './config/env.js';
import { handleSockets } from './socket.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './config/logger.js';
import driverRoutes from './routes/driverRoutes.js';
import rideRoutes from './routes/rideRoutes.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';

// Database and configuration

const app = express();

// Security Middleware
// Connect to MongoDB (make sure connectDB() handles errors as needed)
connectDB();

// Apply middlewares
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Database Connection
connectDB().catch(error => {
  logger.error(`Database connection failed: ${error.message}`);
  process.exit(1);
});

// API Routes
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/rides', rideRoutes);
app.use('/api/v1/users', userRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Error Handling
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});
app.use(errorHandler);

// WebSocket Server
const server = http.createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    // skipMiddlewares: true
  }
});

// Socket.io Configuration
io.engine.on("connection_error", (err) => {
  logger.error(`WebSocket connection error: ${err.message}`, {
    code: err.code,
    context: err.context
  });
});

handleSockets(io);

// Server Startup
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`);
});

// Graceful Shutdown
const shutdown = async () => {
  logger.info('Shutting down server...');
  server.close(() => {
    logger.info('Server terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);