export interface StatusUpdate {
  fileId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface NotificationRequest {
  fileId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}