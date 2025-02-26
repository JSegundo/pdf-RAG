import { Express } from 'express';
import { setupDocumentRoutes } from './documentRoutes';
// import { setupChatRoutes } from './chat';
import { StatusServerInterface } from '../../services/websocket/server';
import { setupNotificationRoutes } from './notifications';

export const setupRoutes = (app: Express,httpServer:StatusServerInterface) => {
  setupDocumentRoutes(app);
  setupNotificationRoutes(app, httpServer) 
}; 
