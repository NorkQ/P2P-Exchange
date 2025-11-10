"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const platform_fastify_1 = require("@nestjs/platform-fastify");
const config_1 = require("@nestjs/config");
const nestjs_pino_1 = require("nestjs-pino");
const helmet_1 = __importDefault(require("@fastify/helmet"));
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, new platform_fastify_1.FastifyAdapter(), { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.enableShutdownHooks();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const configService = app.get((config_1.ConfigService));
    const logger = app.get(nestjs_pino_1.Logger);
    const isDev = process.env.NODE_ENV !== 'production';
    await app.register(helmet_1.default, {
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
    const sanitize = (val) => (val || '').replace(/^\/+|\/+$/g, '');
    const rawPrefix = configService.get('API_PREFIX', { infer: true });
    const rawVersion = configService.get('API_VERSION', { infer: true });
    const prefix = sanitize(rawPrefix);
    const version = sanitize(rawVersion);
    const combinedPrefix = [prefix, version]
        .filter(Boolean)
        .reduce((acc, part) => {
        if (!acc)
            return part;
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
    }
    else {
        console.error('Failed to start application:', err);
    }
    process.exit(1);
});
//# sourceMappingURL=main.js.map