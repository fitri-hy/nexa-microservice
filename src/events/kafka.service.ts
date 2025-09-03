import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, Consumer, Partitioners } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka!: Kafka;
  private producer!: Producer;
  private consumer!: Consumer;
  private readonly logger = new Logger(KafkaService.name);
  private isDummy = false;

  constructor(private readonly configService: ConfigService) {
    this.isDummy = configService.get<boolean>('KAFKA_DUMMY') ?? false;
  }

  async onModuleInit() {
    if (this.isDummy) {
      this.logger.warn('KafkaService running in DUMMY mode');
      return;
    }

    this.kafka = new Kafka({
      clientId: this.configService.get<string>('KAFKA_CLIENT_ID') || 'nestjs-client',
      brokers: this.configService.get<string[]>('KAFKA_BROKERS') || ['localhost:9092'],
    });

    this.producer = this.kafka.producer({
      createPartitioner: Partitioners.LegacyPartitioner,
    });
    await this.producer.connect();

    this.consumer = this.kafka.consumer({
      groupId: this.configService.get<string>('KAFKA_GROUP_ID') || 'nestjs-group',
    });
    await this.consumer.connect();

    this.logger.log('Kafka producer & consumer connected');
  }

  async sendMessage(topic: string, message: any) {
    if (this.isDummy) {
      this.logger.log(`[DUMMY] Kafka message to topic ${topic}: ${JSON.stringify(message)}`);
      return { status: 'dummy-sent', topic, message };
    }

    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async onModuleDestroy() {
    if (!this.isDummy) {
      if (this.producer) await this.producer.disconnect();
      if (this.consumer) await this.consumer.disconnect();
      this.logger.log('Kafka disconnected');
    }
  }
}
