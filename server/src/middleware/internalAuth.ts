import { Request, Response, NextFunction } from 'express';

export function validateInternalRequest(req: Request, res: Response, next: NextFunction): void {
  const apiKey = req.headers['x-internal-api-key'];
  
  // Simple API key check - replace with proper auth in production
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  
  next();
}