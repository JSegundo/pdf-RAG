import { Router } from 'express';
import { Express } from 'express';
import { getPdfProgress, getPdfSummary, uploadPdf } from '../controllers/pdfController';

const router = Router();

router.post('/upload', uploadPdf);
router.get('/summary/:id', getPdfSummary);
router.get('/progress/:id', getPdfProgress);

export const setupPdfRoutes = (app: Express) => {
  app.use('/api/pdf', router);
}; 
