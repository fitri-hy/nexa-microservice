import { registerAs } from '@nestjs/config';

export const rabbitmqConfig = registerAs('rabbitmq', () => ({
  uri: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
  queue: process.env.RABBITMQ_QUEUE || 'default_queue',
}));
