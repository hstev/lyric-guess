export function prepareSqlWasmBrowser(code: string): string {
  const withoutCjsFooter = code.replace(
    /\nif \(typeof exports === 'object' && typeof module === 'object'\)\{[\s\S]*$/,
    '',
  );
  // sql.js clears the CommonJS `module` binding so Emscripten will not export
  // over it. An ES module has no such binding, and the assignment throws
  // `module is not defined` before the database can open.
  const withoutBareModule = withoutCjsFooter.replace(/^\s*module = undefined;\s*$/m, '');

  if (withoutBareModule.includes('export default initSqlJs')) {
    return withoutBareModule;
  }

  return `${withoutBareModule}\nexport default initSqlJs;\n`;
}
