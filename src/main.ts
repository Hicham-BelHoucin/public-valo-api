import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import * as express from 'express';
import { RequestIdMiddleware } from './core/middlewares/request-id.middleware';
import { RequestLoggerMiddleware } from './core/middlewares/request-logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });
  const configService = app.get(ConfigService);

  // Configure request size limits
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Security middleware
  app.use(helmet());

  // Compression middleware
  // app.use(compression()); // This should work now

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3001',
      'http://localhost:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global prefix (optional)
  app.setGlobalPrefix('api');

  // Apply custom middlewares
  app.use(new RequestIdMiddleware().use);
  // app.use(new RequestLoggerMiddleware().use);

  // Get port from configuration

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
