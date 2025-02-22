import { Express } from 'express';
import { setupDocumentRoutes } from './documentRoutes';

export const setupRoutes = (app: Express) => {
  setupDocumentRoutes(app);
}; 
