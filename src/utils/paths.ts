import { isLocale, localePath, type Locale } from '../i18n';

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

export function withLocale(locale: Locale, path = '/'): string {
  return withBase(localePath(locale, path));
}

export function absoluteLocaleUrl(
  locale: Locale,
  path: string,
  site: URL | string | undefined,
): string {
  return absoluteUrl(localePath(locale, path), site);
}

export function alternateLocalePath(canonicalPath: string, target: Locale): string {
  const segments = canonicalPath.split('/').filter(Boolean);
  if (segments[0] && isLocale(segments[0])) {
    segments[0] = target;
    return `/${segments.join('/')}`;
  }
  return localePath(target, canonicalPath === '/' ? '/' : canonicalPath);
}
