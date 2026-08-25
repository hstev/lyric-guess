export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (base === '/') {
    return normalized === '/' ? '/' : normalized.replace(/\/$/, '');
  }

  const prefix = base.replace(/\/$/, '');
  if (normalized === '/') {
    return prefix;
  }

  return `${prefix}${normalized.replace(/\/$/, '')}`;
}

export function absoluteUrl(path: string, site: URL | string | undefined): string {
  const origin = typeof site === 'string' ? site : (site?.origin ?? 'https://hstev.github.io');
  return new URL(withBase(path), origin.endsWith('/') ? origin : `${origin}/`).toString();
}
