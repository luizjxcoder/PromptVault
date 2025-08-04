// Em um novo arquivo, por exemplo: src/env.d.ts

export {};

declare global {
  interface Env {
    // Adicione aqui as suas variáveis de ambiente da Vercel
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