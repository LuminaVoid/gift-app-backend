declare namespace NodeJS {
  interface ProcessEnv {
    DB_URL: string;
    TG_BOT_TOKEN: string;
    BUCKET_ENDPOINT: string;
    BUCKET_CDN_ENDPOINT: string;
    BUCKET_REGION: string;
    BUCKET_NAME: string;
    BUCKET_ACCESS_KEY: string;
    BUCKET_SECRET_KEY: string;
    ADMIN_AUTH: string;
    CP_TOKEN: string;
  }
}
