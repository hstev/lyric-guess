import { describe, expect, it } from 'vitest';
import { unwrapInitSqlJs } from './load-sql';

describe('unwrapInitSqlJs', () => {
  const init = async () => ({ Database: class {} });

  it('accepts a function module', () => {
    expect(unwrapInitSqlJs(init)).toBe(init);
  });

  it('accepts CommonJS default and UMD Module exports', () => {
    expect(unwrapInitSqlJs({ default: init })).toBe(init);
    expect(unwrapInitSqlJs({ Module: init })).toBe(init);
    expect(unwrapInitSqlJs({ default: { default: init } })).toBe(init);
  });

  it('rejects unknown shapes', () => {
    expect(() => unwrapInitSqlJs({})).toThrow(/initializer/);
  });
});
