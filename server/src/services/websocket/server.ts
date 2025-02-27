import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage, Server } from 'http';
import { parse } from 'url';
import { StatusUpdate } from '../../types';

// Simple connection store - replace with Redis for production
const connections = new Map<string, WebSocket>();
const connectionTimers = new Map<string, NodeJS.Timeout>();

export interface StatusServerInterface {
  sendStatusUpdate(fileId: string, status: StatusUpdate['status'], metadata?: Record<string, any>): void;
}

export function setupWebSocketServer(httpServer: Server): StatusServerInterface {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request: IncomingMessage, socket, head) => {
    const { pathname } = parse(request.url || '', true);
    
    if (pathname?.startsWith('/status/')) {
      const fileId = pathname.split('/')[2];
      
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        console.log(`handleUpgrade! fileId: ${fileId}`);
        connections.set(fileId, ws);
        console.log(`Connections map now has ${connections.size} connections`);
        
        // Set up event handlers
        ws.on('message', (message) => {
          console.log(`Received message from ${fileId}:`, message.toString());
        });
        
        ws.on('close', (code, reason) => {
            console.log(`WebSocket closed for ${fileId}: Code ${code}, Reason: ${reason}`);
            // Clear any existing timer
            if (connectionTimers.has(fileId)) {
              clearTimeout(connectionTimers.get(fileId)!);
              connectionTimers.delete(fileId);
            }
            
            // Set a timer to remove this connection after a delay
            // This gives time for pending notifications to be sent
            const timer = setTimeout(() => {
              console.log(`Removing stale connection for ${fileId}`);
              connections.delete(fileId);
              connectionTimers.delete(fileId);
            }, 60000); 
            
            connectionTimers.set(fileId, timer);
        });
        
        ws.on('error', (error) => {
          console.error(`WebSocket error for ${fileId}:`, error);
        });
      });
    }
  });
  
  return {
    sendStatusUpdate: (fileId: string, status: StatusUpdate['status'], metadata: Record<string, any> = {}) => {
      console.log(`Trying to send status update for ${fileId}. Connections: ${connections.size}`);
      
      // Log all connection keys for debugging
      console.log(`Available connections: ${Array.from(connections.keys()).join(', ')}`);
      
      const connection = connections.get(fileId);
      if (connection) {
        try {
          // Check if the connection is truly open
          if (connection.readyState === WebSocket.OPEN) {
            console.log(`Sending update to ${fileId}: ${status}`);
            connection.send(JSON.stringify({
              type: 'status_update',
              fileId,
              status,
              metadata,
              timestamp: Date.now()
            }));
          } else {
            console.log(`Connection for ${fileId} exists but is not open (state: ${connection.readyState})`);
          }
        } catch (err) {
          console.error(`Error sending status update:`, err);
        }
      } else {
        console.log(`No connection found for ${fileId}`);
      }
    }
  };
}
