import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import type { Plugin } from 'vite';

const site = process.env.PUBLIC_SITE_URL ?? 'https://hstev.github.io';
const base = process.env.PUBLIC_BASE_PATH ?? '/lyric-guess/';

function sqlJsDefaultExport(): Plugin {
  return {
    name: 'sql-js-default-export',
    enforce: 'pre',
    transform(code, id) {
      const file = id.replace(/\?.*$/, '');
      if (!file.endsWith('sql-wasm-browser.js')) {
        return null;
      }
      if (code.includes('export default initSqlJs')) {
        return null;
      }

      const withoutCjsFooter = code.replace(
        /\nif \(typeof exports === 'object' && typeof module === 'object'\)\{[\s\S]*$/,
        '',
      );

      return `${withoutCjsFooter}\nexport default initSqlJs;\n`;
    },
  };
}

export default defineConfig({
  site,
  base,
  trailingSlash: 'never',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/play') && /\/(es|en)(\/|$)/.test(page),
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-419',
          en: 'en-US',
        },
      },
    }),
  ],
  build: {
    format: 'directory',
  },
  vite: {
    plugins: [sqlJsDefaultExport()],
    optimizeDeps: {
      include: ['sql.js'],
    },
    assetsInclude: ['**/*.wasm'],
  },
});
