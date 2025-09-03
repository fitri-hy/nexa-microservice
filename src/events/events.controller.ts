import { Controller, Post, Body } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { RabbitMQService } from './rabbitmq.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly kafkaService: KafkaService,
    private readonly rabbitService: RabbitMQService,
  ) {}

  @Post('kafka')
  async sendKafka(@Body() body: { topic: string; message: any }) {
    const result = await this.kafkaService.sendMessage(body.topic, body.message);
    return { status: 'sent-to-kafka', ...result };
  }

  @Post('rabbitmq')
  async sendRabbit(@Body() body: { queue: string; message: any }) {
    const result = await this.rabbitService.sendMessage(body.queue, body.message);
    return { status: 'sent-to-rabbitmq', ...result };
  }
}
