export type Environment = {
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  HOST: string;
  SERVICE_NAME: string;
  CORS_ORIGIN: string;
  API_PREFIX: string;
  API_VERSION: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
};

const configuration = (): Environment => ({
  NODE_ENV: (process.env.NODE_ENV as Environment['NODE_ENV']) ?? 'development',
  PORT: Number.parseInt(process.env.PORT ?? '3000', 10),
  HOST: process.env.HOST ?? 'localhost',
  SERVICE_NAME: process.env.SERVICE_NAME ?? 'P2P-Exchange API',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:8081',
  API_PREFIX: process.env.API_PREFIX ?? '',
  API_VERSION: process.env.API_VERSION ?? '',
  SUPABASE_URL: process.env.SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? '',
});

export default configuration;