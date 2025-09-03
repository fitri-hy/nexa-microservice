import { DynamicModule, Global, Module } from '@nestjs/common';
import { OpenTelemetryModule } from 'nestjs-otel';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SpanExporter, ReadableSpan, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { TypeormInstrumentation } from '@opentelemetry/instrumentation-typeorm';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { KafkaJsInstrumentation } from '@opentelemetry/instrumentation-kafkajs';

import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'otel-log.txt');
const MAX_LINES = process.env.TRACING_LINES ? parseInt(process.env.TRACING_LINES, 10) : 100;

class RollingFileExporter implements SpanExporter {
  export(spans: ReadableSpan[], resultCallback: (result: any) => void): void {
    try {
      let lines: string[] = [];
      if (fs.existsSync(LOG_FILE)) {
        lines = fs.readFileSync(LOG_FILE, 'utf-8').split('\n').filter(Boolean);
      }

      spans.forEach((span) => {
        lines.push(JSON.stringify({
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
          name: span.name,
          kind: span.kind,
          attributes: span.attributes,
          status: span.status,
          startTime: span.startTime,
          endTime: span.endTime,
        }));
      });

      if (lines.length > MAX_LINES) {
        lines = lines.slice(lines.length - MAX_LINES);
      }

      fs.writeFileSync(LOG_FILE, lines.join('\n') + '\n', 'utf-8');
      resultCallback({ code: 0 });
    } catch (err) {
      resultCallback({ code: 1, error: err });
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

@Global()
@Module({})
export class TelemetryModule {
  static forRoot(enabled: boolean): DynamicModule {
    if (!enabled) {
      return { module: TelemetryModule };
    }

    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }

    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, '', 'utf-8');
    }

    const exporter = new RollingFileExporter();
    const sdk = new NodeSDK({
      spanProcessor: new SimpleSpanProcessor(exporter),
      instrumentations: [
        new HttpInstrumentation(),
        new IORedisInstrumentation(),
        new TypeormInstrumentation(),
        new AmqplibInstrumentation(),
        new KafkaJsInstrumentation(),
      ],
    });

    (async () => {
      try {
        await sdk.start();
      } catch (error: any) {
        console.error('Error starting OpenTelemetry SDK', error);
      }
    })();

    return {
      module: TelemetryModule,
      imports: [OpenTelemetryModule.forRoot()],
      exports: [OpenTelemetryModule],
    };
  }
}
