import type { SqlJsStatic } from 'sql.js';

type InitSqlJs = (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;

export function unwrapInitSqlJs(module: unknown): InitSqlJs {
  const record = module as Record<string, unknown> | null;
  const candidates: unknown[] = [module, record?.['default'], record?.['Module']];

  for (const candidate of candidates) {
    if (typeof candidate === 'function') {
      return candidate as InitSqlJs;
    }

    if (candidate && typeof candidate === 'object') {
      const nested = (candidate as { default?: unknown }).default;
      if (typeof nested === 'function') {
        return nested as InitSqlJs;
      }
    }
  }

  throw new Error('sql.js did not export an initializer');
}

export async function loadSqlModule(): Promise<SqlJsStatic> {
  if (typeof window === 'undefined') {
    const sqlModule = await import('sql.js');
    return unwrapInitSqlJs(sqlModule)();
  }

  const [{ default: wasmUrl }, sqlModule] = await Promise.all([
    import('sql.js/dist/sql-wasm-browser.wasm?url'),
    import('sql.js/dist/sql-wasm-browser.js'),
  ]);

  return unwrapInitSqlJs(sqlModule)({
    locateFile: () => wasmUrl,
  });
}
