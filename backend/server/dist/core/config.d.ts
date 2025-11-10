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
declare const configuration: () => Environment;
export default configuration;
