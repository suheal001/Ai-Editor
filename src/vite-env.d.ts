/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SERPER_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}