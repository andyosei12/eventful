import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import fs from 'node:fs';
import { API_PREFIX } from './constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app
    .enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    })
    .setGlobalPrefix(API_PREFIX);

  const config = new DocumentBuilder()
    .setTitle('Eventful')
    .setDescription('Events Management System Api Description')
    .setVersion('1.0')
    .addTag('events')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(app, config, options);
  SwaggerModule.setup(`${API_PREFIX}/:version/docs`, app, document);
  await app.listen(3000);
}
bootstrap();
