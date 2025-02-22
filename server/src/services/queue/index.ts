import amqp, { Connection, Channel } from 'amqplib';
import { QUEUE_CONFIG } from '../../config/queue';

export class QueueService {
  private connection: Connection | null = null;
  private channel: Channel | null = null;

  async initialize() {
    try {
      this.connection = await amqp.connect(QUEUE_CONFIG.url);
      this.channel = await this.connection.createChannel();
      
      // Ensure queue exists
      await this.channel.assertQueue(QUEUE_CONFIG.documentQueue, QUEUE_CONFIG.options);
      
      console.log('Successfully connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async sendToQueue(data: any) {
    if (!this.channel) {
      throw new Error('Queue channel not initialized');
    }

    const message = Buffer.from(JSON.stringify(data));
    return this.channel.sendToQueue(
      QUEUE_CONFIG.documentQueue,
      message,
      { persistent: true }
    );
  }

  async closeConnection() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}

// Export singleton instance
export const queueService = new QueueService();