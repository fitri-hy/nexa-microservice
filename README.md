<p align="center">
  <img src="./public/images/logo.png" alt="Nexa" width="150"/>
</p>

# Nexa (Starter Kit)

Nexa is a modern NestJS microservice starter kit designed for rapid backend development.
It comes with built-in features like JWT authentication, user management, health checks, caching, and messaging support with RabbitMQ and Kafka.

With flexible database support (MySQL or PostgreSQL) and ready-to-use Docker configuration, Nexa lets you focus on building your application instead of boilerplate setup.

---

## Features & Technologies

### Runtime & Frameworks

* Node.js
* NestJS
* Express
* TypeScript
* RxJS

### Authentication & Authorization

* JWT
* Passport

### Database & ORM

* MySQL
* PostgreSQL
* TypeORM

### Caching

* Redis

### Messaging & Event Streaming

* RabbitMQ
* Kafka

### Configuration & Validation

* Joi

### Security

* Helmet
* XSS Sanitization (SanitizeInterceptor)
* Global Input Validation

### Observability & Monitoring

* Tracing (OpenTelemetry)

### Testing

* Jest
* Supertest

### Containerization

* Docker

---

## Run Locally

```bash
npm install
npm run start:dev
```

Server runs on:

```
http://localhost:3000
```

---

## Run with Docker

```bash
docker-compose up --build
```

## Run Tests

Unit Test

```
npm run test
```

E2E Test (End-to-End)

```
npm run test:e2e
```

---

## Environment Variables

```env
PORT=3000
LOGGER=true
CORS_ORIGIN=http://localhost:3000,http://localhost:4200
CORS_METHODS=GET,POST,PUT,DELETE
CORS_CREDENTIALS=true

DB_TYPE=postgres						# postgres or mysql
DB_HOST=localhost
DB_PORT=5432						    # 5432 Postgres or 3306 MySQL
DB_USER=postgres_username
DB_PASS=postgres_password
DB_NAME=postgres_dbname

STATIC_ROOT=/

REDIS_ENABLED=false
REDIS_DUMMY=true
REDIS_HOST=localhost
REDIS_PORT=6379

RABBITMQ_ENABLED=false
RABBITMQ_DUMMY=true
RABBITMQ_URI=amqp://localhost:5672
RABBITMQ_QUEUE=default_queue

KAFKA_ENABLED=false
KAFKA_DUMMY=true
KAFKA_CLIENTID=nexa-client
KAFKA_BROKERS=localhost:9092
KAFKA_GROUPID=nexa-group
KAFKAJS_NO_PARTITIONER_WARNING=1

JWT_SECRET=mysecret
JWT_EXPIRES_IN=3600s

TRACING=true
TRACING_LINES=200
```

---

## API Endpoints

| Module | Endpoint      | Method |
| ------ | ------------- | ------ |
| Auth   | `/auth/login` | POST   |
| Users  | `/users`      | GET    |
| Users  | `/users`      | POST   |
| Health | `/health`     | GET    |

---

## Folder Stucture

```
microservice-backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   ├── rabbitmq.config.ts
│   │   ├── kafka.config.ts
│   │   ├── jwt.config.ts
│   │   └── env.validation.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── jwt.strategy.ts
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.controller.ts
│   │   │   └── users.entity.ts
│   │   └── health/
│   │       ├── health.module.ts
│   │       └── health.controller.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   └── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   └── interceptors/
│   │       ├── response-time.interceptor.ts
│   │       └── sanitize.interceptor.ts.ts
│   └── events/
│       ├── rabbitmq.service.ts
│       └── kafka.service.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── app.xss-spec.ts
├── .env
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## Testing

Health Check:

```bash
curl http://localhost:3000/health
```

Create User:

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

Login User:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'
```

Access Protected Endpoint:

```bash
curl http://localhost:3000/users \
  -H "Authorization: Bearer JWT_TOKEN_HERE"
```

---