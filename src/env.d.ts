/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_BASE_PATH?: string;
  readonly PUBLIC_DEFAULT_TIMER_SECONDS?: string;
}

declare module '*.wasm?url' {
  const asset: string;
  export default asset;
}

declare module 'sql.js/dist/sql-wasm-browser.js' {
  const initSqlJs: (config?: { locateFile?: (file: string) => string }) => Promise<unknown>;
  export default initSqlJs;
}
