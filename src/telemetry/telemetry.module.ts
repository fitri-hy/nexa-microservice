// src/telemetry/telemetry.module.ts
import * as client from 'prom-client';
import { Response } from 'express';
import { Controller, Get, Res, DynamicModule, Global, Module } from '@nestjs/common';
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
const TRACE_FILE = path.join(LOG_DIR, 'otel-log.txt');
const METRIC_FILE = path.join(LOG_DIR, 'metric-log.txt');
const MAX_LINES = process.env.TRACING_LINES ? parseInt(process.env.TRACING_LINES, 10) : 100;

class RollingFileExporter implements SpanExporter {
  export(spans: ReadableSpan[], resultCallback: (result: any) => void): void {
    try {
      let existing: any[] = [];
      if (fs.existsSync(TRACE_FILE)) {
        const content = fs.readFileSync(TRACE_FILE, 'utf-8').trim();
        if (content) existing = JSON.parse(content);
      }

      const newSpans = spans.map((span) => {
        const { traceId, spanId } = span.spanContext();
        return {
          traceId,
          spanId,
          name: span.name,
          kind: span.kind,
          attributes: span.attributes,
          status: span.status,
          startTime: new Date(span.startTime[0] * 1000 + span.startTime[1] / 1e6).toISOString(),
          endTime: new Date(span.endTime[0] * 1000 + span.endTime[1] / 1e6).toISOString(),
        };
      });

      const combined = [...existing, ...newSpans];
      const sliced = combined.slice(-MAX_LINES);
      fs.writeFileSync(TRACE_FILE, JSON.stringify(sliced, null, 2), 'utf-8');
      resultCallback({ code: 0 });
    } catch (err: unknown) {
      resultCallback({ code: 1, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const loginSuccessCounter = new client.Counter({
  name: 'login_success_total',
  help: 'Total login success',
});
export const loginFailCounter = new client.Counter({
  name: 'login_fail_total',
  help: 'Total login failed',
});
export const userCreatedCounter = new client.Counter({
  name: 'user_created_total',
  help: 'Total users created',
});

register.registerMetric(loginSuccessCounter);
register.registerMetric(loginFailCounter);
register.registerMetric(userCreatedCounter);

@Controller('metrics')
class MetricsController {
  @Get()
  async getMetrics(@Res() res: Response) {
    try {
      const metrics = await register.metrics();
      res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(metrics);

      if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
      fs.writeFileSync(METRIC_FILE, metrics, 'utf-8');
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send('Unknown error');
      }
    }
  }
}

@Global()
@Module({})
export class TelemetryModule {
  static forRoot(enabled: boolean): DynamicModule {
    if (!enabled) return { module: TelemetryModule };

    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    if (!fs.existsSync(TRACE_FILE)) fs.writeFileSync(TRACE_FILE, '[]', 'utf-8');
    if (!fs.existsSync(METRIC_FILE)) fs.writeFileSync(METRIC_FILE, '', 'utf-8');

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
      } catch (error: unknown) {
        console.error('Error starting OpenTelemetry SDK', error instanceof Error ? error.message : error);
      }
    })();

    return {
      module: TelemetryModule,
      imports: [OpenTelemetryModule.forRoot()],
      controllers: [MetricsController],
      exports: [OpenTelemetryModule],
    };
  }
}
