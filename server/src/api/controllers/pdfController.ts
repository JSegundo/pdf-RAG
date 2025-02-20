import { Request, Response } from 'express';

export const uploadPdf = (req: Request, res: Response) => {
  res.status(200).json({ message: 'PDF uploaded successfully' });
};

export const getPdfSummary = (req: Request, res: Response) => {
  res.status(200).json({ message: 'PDF summary fetched successfully' });
};

export const getPdfProgress = (req: Request, res: Response) => {
  res.status(200).json({ message: 'PDF progress fetched successfully' });
};
