import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { Environment } from './core/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { bufferLogs: true },
  );

  app.useLogger(app.get(Logger));
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const configService = app.get(ConfigService<Environment, true>);
  const logger = app.get(Logger);

  const isDev = process.env.NODE_ENV !== 'production';
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", ...(isDev ? ["https:"] : [])],
        imgSrc: ["'self'", 'data:', ...(isDev ? ["https:"] : [])],
        scriptSrc: ["'self'", ...(isDev ? ["'unsafe-inline'", "https:"] : [])],
      },
    },
  });

  const corsOrigin = configService.get('CORS_ORIGIN', { infer: true });
  const allowCredentials = corsOrigin !== '*';
  app.enableCors({
    origin: corsOrigin,
    credentials: allowCredentials,
  });

  const sanitize = (val: string) => (val || '').replace(/^\/+|\/+$/g, '');
  const rawPrefix = configService.get('API_PREFIX', { infer: true });
  const rawVersion = configService.get('API_VERSION', { infer: true });
  const prefix = sanitize(rawPrefix);
  const version = sanitize(rawVersion);
  const combinedPrefix = [prefix, version]
    .filter(Boolean)
    .reduce((acc, part) => {
      if (!acc) return part;
      return acc.endsWith(part) ? acc : `${acc}/${part}`;
    }, '');
  if (combinedPrefix) {
    app.setGlobalPrefix(combinedPrefix);
  }

  const port = configService.get('PORT', { infer: true });
  const host = configService.get('HOST', { infer: true });
  const serviceName = configService.get('SERVICE_NAME', { infer: true });

  await app.listen(port, host);

  const baseUrl = combinedPrefix
    ? `http://${host}:${port}/${combinedPrefix}`
    : `http://${host}:${port}`;
  logger.log(`🚀 ${serviceName} is running on: ${baseUrl}`);
  logger.log(`📝 Logger: Pino (${process.env.NODE_ENV || 'development'} mode)`);

 process.on('SIGTERM', async () => {
    logger.warn('⚠️  SIGTERM signal received: closing HTTP server');
    await app.close();
    logger.log('✅ HTTP server closed');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.warn('⚠️  SIGINT signal received: closing HTTP server');
    await app.close();
    logger.log('✅ HTTP server closed');
    process.exit(0);
  });
}

bootstrap().catch((err) => {
  if (err.message?.includes('❌')) {
    console.error(`\n${err.message}\n`);
  } else {
    console.error('Failed to start application:', err);
  }
  process.exit(1);
});