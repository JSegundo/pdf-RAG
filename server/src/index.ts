import express from 'express';
import { config } from './config';
import { setupRoutes } from './api/routes';
import { errorHandler } from './middleware/errorHandler';
import { UPLOAD_CONFIG } from './config/queue';
import { queueService } from './services/queue';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { setupWebSocketServer } from './services/websocket/server';
import http from 'http';

const app = express();
const httpServer = http.createServer(app);
const statusServer = setupWebSocketServer(httpServer);

// Ensure uploads directory exists with proper permissions
const uploadsDir = path.resolve(UPLOAD_CONFIG.tempDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true, mode: 0o755 });
  console.log(`Created uploads directory: ${uploadsDir}`);
}
console.log(`Using uploads directory: ${uploadsDir}`);

// Middleware
app.use(cors()); // Add CORS middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup routes
setupRoutes(app, statusServer);

// Error handling
app.use(errorHandler);

// Initialize queue and start server
async function startServer() {
  try {
    await queueService.initialize();
    console.log('Queue service initialized successfully');
    
    httpServer.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to initialize queue service:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await queueService.closeConnection();
  process.exit(0);
});

startServer();

export default app;
