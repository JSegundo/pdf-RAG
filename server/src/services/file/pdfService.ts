import { Readable } from 'stream';

export class PdfService {
  async extractText(fileStream: Readable): Promise<string> {
    // PDF text extraction implementation
    throw new Error('Not implemented');
  }

  async processLargeFile(filePath: string): Promise<void> {
    // Large file processing implementation
    throw new Error('Not implemented');
  }
} 