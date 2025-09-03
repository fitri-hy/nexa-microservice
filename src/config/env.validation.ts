import * as Joi from 'joi';

export const EnvValidationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  DB_NAME: Joi.string().required(),
  REDIS_HOST: Joi.string(),
  REDIS_PORT: Joi.number(),
  RABBITMQ_URI: Joi.string(),
  RABBITMQ_QUEUE: Joi.string(),
  KAFKA_BROKERS: Joi.string(),
  KAFKA_CLIENT_ID: Joi.string(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string(),
});
