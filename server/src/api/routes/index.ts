import { Express } from 'express';
import { setupPdfRoutes } from './pdfRoutes';

export const setupRoutes = (app: Express) => {
  setupPdfRoutes(app);
}; 