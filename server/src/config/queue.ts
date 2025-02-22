import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

export const QUEUE_CONFIG = {
  url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
  user: process.env.RABBITMQ_USER || 'guest',
  password: process.env.RABBITMQ_PASSWORD || 'guest',
  documentQueue: process.env.RABBITMQ_QUEUE_NAME || 'document_processing',
  exchange: process.env.RABBITMQ_EXCHANGE || 'document_exchange',
  routingKey: process.env.RABBITMQ_ROUTING_KEY || 'document.process',
  options: {
    durable: true,
    persistent: true
  }
};

export const UPLOAD_CONFIG = {
  tempDir: process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads'),
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'application/pdf').split(','),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10) // 50MB default
};

// export const PROCESSING_CONFIG = {
//   serviceUrl: process.env.PROCESSING_SERVICE_URL || 'http://localhost:8000',
//   timeout: parseInt(process.env.PROCESSING_SERVICE_TIMEOUT || '30000', 10)
// };

// export const STORAGE_CONFIG = {
//   type: process.env.STORAGE_TYPE || 'local',
//   s3: {
//     bucket: process.env.AWS_S3_BUCKET,
//     region: process.env.AWS_S3_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
//   }
// };