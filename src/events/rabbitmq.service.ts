import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any = null;
  private channel: any = null;
  private queue!: string;
  private readonly logger = new Logger(RabbitMQService.name);
  private isDummy = false;

  constructor(private readonly configService: ConfigService) {
    this.isDummy = configService.get<boolean>('RABBITMQ_DUMMY') ?? false;
  }

  async onModuleInit() {
    if (this.isDummy) {
      this.logger.warn('RabbitMQService running in DUMMY mode');
      return;
    }

    try {
      const uri = this.configService.get<string>('RABBITMQ_URI') || 'amqp://localhost:5672';
      this.queue = this.configService.get<string>('RABBITMQ_QUEUE') || 'default_queue';

      const conn: any = await amqp.connect(uri);
      this.connection = conn;

      const ch: any = await this.connection.createChannel();
      this.channel = ch;

      await this.channel.assertQueue(this.queue);
      this.logger.log(`Connected to RabbitMQ queue: ${this.queue}`);
    } catch (err: any) {
      this.logger.error(`RabbitMQ connection failed: ${(err as any)?.message ?? err}`);
      this.connection = null;
      this.channel = null;
    }
  }

  async sendMessage(queue: string, message: any) {
    if (this.isDummy) {
      this.logger.log(`[DUMMY] RabbitMQ message to ${queue}: ${JSON.stringify(message)}`);
      return { status: 'dummy-sent', queue, message };
    }

    if (!this.channel) throw new Error('RabbitMQ channel not initialized');
    const targetQueue = queue || this.queue;
    this.channel.sendToQueue(targetQueue, Buffer.from(JSON.stringify(message)));
  }

  async onModuleDestroy() {
    if (!this.isDummy) {
      if (this.channel) await this.channel.close().catch(() => null);
      if (this.connection) await this.connection.close().catch(() => null);
      this.logger.log('RabbitMQ connection closed');
    }
  }
}
