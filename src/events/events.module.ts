import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaService } from './kafka.service';
import { RabbitMQService } from './rabbitmq.service';
import { EventsController } from './events.controller';

@Module({})
export class EventsModule {
  static forRoot(kafkaEnabled: boolean, rabbitEnabled: boolean): DynamicModule {
    const providers = [];
    const controllers = [];

    if (kafkaEnabled) {
      providers.push(KafkaService);
    }

    if (rabbitEnabled) {
      providers.push(RabbitMQService);
    }

    if (providers.length > 0) {
      controllers.push(EventsController);
    }

    return {
      module: EventsModule,
      imports: [ConfigModule],
      providers,
      controllers,
      exports: providers,
    };
  }
}
