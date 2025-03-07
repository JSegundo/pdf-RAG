import { Express,Router, Request, Response } from 'express';
import { validateInternalRequest } from '../../middleware/internalAuth';
import { StatusServerInterface } from '../../services/websocket/server';
import { NotificationRequest } from '../../types';

export default function createNotificationRouter(statusServer: StatusServerInterface): Router {
  const router = Router();
  
  // Endpoint for Python service to send notifications
  router.post('/internal/notify', validateInternalRequest, (req: Request, res: Response) => {
    const { fileId, status, metadata } = req.body as NotificationRequest;    
    if (!fileId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    statusServer.sendStatusUpdate(fileId, status, metadata);
    res.status(200).json({ success: true });
  });
  
  return router;
}
// Setup the notification routes
export const setupNotificationRoutes = (app: Express, statusServer: StatusServerInterface) => {
  const notificationRouter = createNotificationRouter(statusServer);
  app.use('/api/notifications', notificationRouter);
};