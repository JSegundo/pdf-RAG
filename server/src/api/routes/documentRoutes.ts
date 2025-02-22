import { Router } from 'express';
import { Express } from 'express';
import { 
  uploadDocument, 
  handleUpload,
  getDocumentProgress, 
  getDocumentSummary 
} from '../controllers/documentController';

const router = Router();

router.post('/upload', uploadDocument, handleUpload);
router.get('/summary/:id', getDocumentSummary);
router.get('/progress/:id', getDocumentProgress);

export const setupDocumentRoutes = (app: Express) => {
  app.use('/api/document', router);
}; 
