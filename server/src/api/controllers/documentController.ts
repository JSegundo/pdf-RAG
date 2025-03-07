import { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOAD_CONFIG } from '../../config/queue';
import { queueService } from '../../services/queue';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, UPLOAD_CONFIG.tempDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const jobId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${jobId}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (UPLOAD_CONFIG.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF files are allowed.'));
    }
  }
});

export const uploadDocument = upload.single('file');

export const handleUpload = async (req: Request, res: Response) => {
  console.log('handleUpload');
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const jobId = req.file?.filename.split('.')[0]; // file id
    const filePath = req.file?.path;

    console.log('=== File Upload Handler ===');
    console.log(`File saved to: ${filePath}`);
    console.log(`Original name: ${req.file?.originalname}`);
    console.log(`Job ID: ${jobId}`);

    // Send message to processing queue
    await queueService.sendToQueue({
      jobId,
      filePath,
      originalName: req.file?.originalname,
      timestamp: new Date().toISOString()
    });

    res.json({
      jobId,
      message: 'File uploaded successfully and queued for processing',
      originalName: req.file?.originalname
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Failed to process upload',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getDocumentSummary = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Document summary fetched successfully' });
};

export const getDocumentProgress = (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(200).json({ 
    jobId: id,
    status: 'processing' // TODO: Implement actual status checking
  });
};
