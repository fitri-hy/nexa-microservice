import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: any;
  private channel: any;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('rabbitmq.uri') || 'amqp://localhost:5672';
    const queue = this.configService.get<string>('rabbitmq.queue') || 'default_queue';

    this.connection = await amqp.connect(uri);
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue(queue);
  }

  async sendMessage(queue: string, message: any) {
    if (!this.channel) throw new Error('RabbitMQ channel is not initialized');
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
  }
}
