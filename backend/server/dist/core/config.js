"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const configuration = () => ({
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: Number.parseInt(process.env.PORT ?? '3000', 10),
    HOST: process.env.HOST ?? 'localhost',
    SERVICE_NAME: process.env.SERVICE_NAME ?? 'P2P-Exchange API',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:8081',
    API_PREFIX: process.env.API_PREFIX ?? '',
    API_VERSION: process.env.API_VERSION ?? '',
    SUPABASE_URL: process.env.SUPABASE_URL ?? '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? '',
});
exports.default = configuration;
//# sourceMappingURL=config.js.map