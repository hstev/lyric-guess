import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { prepareSqlWasmBrowser } from './prepare-sql-wasm';

describe('prepareSqlWasmBrowser', () => {
  it('drops the CommonJS footer and the bare module assignment', () => {
    const prepared = prepareSqlWasmBrowser(`
var initSqlJs = function () {
        module = undefined;
        return 1;
};
if (typeof exports === 'object' && typeof module === 'object'){
    module.exports = initSqlJs;
}
`);

    expect(prepared).toContain('export default initSqlJs');
    expect(prepared).not.toContain('module.exports');
    expect(prepared).not.toMatch(/^\s*module = undefined;\s*$/m);
  });

  it('opens sql.js from the browser build as an ES module', async () => {
    const source = readFileSync('node_modules/sql.js/dist/sql-wasm-browser.js', 'utf8');
    const prepared = prepareSqlWasmBrowser(source);
    const dir = mkdtempSync(join(tmpdir(), 'sql-wasm-'));
    const file = join(dir, 'sql-wasm-browser.mjs');
    writeFileSync(file, prepared);

    const mod = (await import(pathToFileURL(file).href)) as {
      default: (config?: { wasmBinary?: Uint8Array }) => Promise<{
        Database: new () => { run: (sql: string) => void; close: () => void };
      }>;
    };
    const wasmBinary = new Uint8Array(
      readFileSync('node_modules/sql.js/dist/sql-wasm-browser.wasm'),
    );
    const SQL = await mod.default({ wasmBinary });
    const db = new SQL.Database();
    db.run('CREATE TABLE songs (id TEXT)');
    db.close();
  });
});
