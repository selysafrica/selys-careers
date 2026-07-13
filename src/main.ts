import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { AbortExceptionFilter } from './abort-exception.filter';
import * as express from 'express';
import session = require('express-session');
import { mkdirSync } from 'fs';

const UPLOAD_ROUTES = ['/api/apply', '/api/mixed', '/api/many', '/api/single'];

function isUploadRoute(path: string): boolean {
  return UPLOAD_ROUTES.some((route) => path.startsWith(route));
}

async function bootstrap() {
  mkdirSync('data', { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'selys-careers-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 24 * 60 * 60 * 1000 },
    }),
  );

  app.use((req, res, next) => {
    if (isUploadRoute(req.path)) return next();
    express.json({ limit: '50mb' })(req, res, next);
  });

  app.use((req, res, next) => {
    if (isUploadRoute(req.path)) return next();
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
  });

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.useGlobalFilters(new AbortExceptionFilter());

  await app.listen(6100);
  console.log('Application running on http://localhost:6100');
}
bootstrap();
