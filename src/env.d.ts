// Em um novo arquivo, por exemplo: src/env.d.ts

export {};

declare global {
  interface Env {
       GOOGLE_APPS_SCRIPT_WEBHOOK_URL: string;
       MOCHA_USERS_SERVICE_API_KEY: string;
       MOCHA_USERS_SERVICE_API_URL: string;

    // Exemplo:
    DATABASE_URL: string;
    API_KEY: string;
    NODE_ENV: 'development' | 'production';

    // Se você estiver usando bindings da Vercel (como KV, Blob, etc.),
    // declare-os aqui também.
    // Exemplo para Vercel KV:
    // MY_KV_STORE: KVNamespace;
  }
}