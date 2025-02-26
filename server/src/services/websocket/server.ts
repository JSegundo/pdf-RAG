import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage, Server } from 'http';
import { parse } from 'url';
import { StatusUpdate } from '../../types';


// Simple connection store - replace with Redis for production
const connections = new Map<string, WebSocket>();

export interface StatusServerInterface {
  sendStatusUpdate(fileId: string, status: StatusUpdate['status'], metadata?: Record<string, any>): void;
}

export function setupWebSocketServer(httpServer: Server): StatusServerInterface {
  const wss = new WebSocketServer({ noServer: true });
  console.log('setupWebSocketServer')
  httpServer.on('upgrade', (request:IncomingMessage, socket, head) => {
    console.log('upgrade!')
    const { pathname } = parse(request.url || '', true);
    
    if (pathname?.startsWith('/status/')) {
      // Extract fileId from URL
      const fileId = pathname.split('/')[2];
      
      // In a real auth system, verify token here
      // For now, accept connections with a fileId
      wss.handleUpgrade(request, socket, head, (ws: WebSocket, req: IncomingMessage) => {
        connections.set(fileId, ws);
        
        ws.on('close', () => {
          connections.delete(fileId);
        });
      });
    }
  });
  
  return {
    sendStatusUpdate: (fileId: string, status: StatusUpdate['status'], metadata: Record<string, any> = {}) => {
      console.log('sendStatusUpdate!')
      const connection = connections.get(fileId);
      if (connection && connection.readyState === WebSocket.OPEN) {
        const update: StatusUpdate = {
          fileId,
          status,
          metadata,
          timestamp: Date.now()
        };
        connection.send(JSON.stringify({
          type: 'status_update',
          ...update
        }));
      }
    }
  };
}
