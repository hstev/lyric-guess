import type { Database, Statement } from 'sql.js';

export type SqlParams = Array<string | number | null>;

export type SqlRow = Record<string, string | number | null>;

export function run(db: Database, sql: string, params: SqlParams = []): void {
  db.run(sql, params);
}

export function all(db: Database, sql: string, params: SqlParams = []): SqlRow[] {
  const statement = db.prepare(sql);
  try {
    bind(statement, params);
    const rows: SqlRow[] = [];
    while (statement.step()) {
      rows.push(statement.getAsObject() as SqlRow);
    }
    return rows;
  } finally {
    statement.free();
  }
}

export function get(db: Database, sql: string, params: SqlParams = []): SqlRow | null {
  const rows = all(db, sql, params);
  return rows[0] ?? null;
}

function bind(statement: Statement, params: SqlParams): void {
  if (params.length === 0) {
    return;
  }
  statement.bind(params);
}

export function asString(value: string | number | null | undefined, fallback = ''): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  return String(value);
}

export function asNumber(value: string | number | null | undefined, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

export function asNullableString(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value);
  return text.length > 0 ? text : null;
}

export function asNullableNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function asBoolean(value: string | number | null | undefined): boolean {
  return value === 1 || value === '1';
}
