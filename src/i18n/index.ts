import { en } from './en';
import { es } from './es';
import { defaultLocale, isLocale, type Locale, locales, LOCALE_STORAGE_KEY } from './locales';

export type Messages = typeof es;

type NestedString<T> = {
  [K in keyof T]: T[K] extends string ? string : NestedString<T[K]>;
};

export type MessageKey = {
  [K in keyof Messages]: {
    [P in keyof Messages[K]]: `${K & string}.${P & string}`;
  }[keyof Messages[K]];
}[keyof Messages];

const dictionaries: Record<Locale, NestedString<Messages>> = { es, en };

export type TranslateFn = (key: MessageKey, vars?: Record<string, string | number>) => string;

export function t(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  const messages = dictionaries[locale] ?? dictionaries[defaultLocale];
  const value = lookup(messages, key) ?? lookup(dictionaries[defaultLocale], key) ?? key;
  if (!vars) {
    return value;
  }
  return value.replace(/\{(\w+)\}/g, (_, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : `{${name}}`,
  );
}

export function useTranslations(locale: Locale): TranslateFn {
  return (key, vars) => t(locale, key, vars);
}

export function getLangFromUrl(url: URL): Locale {
  const found = pathSegments(url.pathname).find((segment) => isLocale(segment));
  return found ?? defaultLocale;
}

export function localePath(locale: Locale, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const suffix = normalized === '/' ? '' : normalized.replace(/\/$/, '');
  return `/${locale}${suffix}`;
}

export function switchLocalePath(url: URL, target: Locale): string {
  const segments = pathSegments(url.pathname);
  const localeIndex = segments.findIndex((segment) => isLocale(segment));
  if (localeIndex >= 0) {
    segments[localeIndex] = target;
  } else {
    segments.unshift(target);
  }
  const next = `/${segments.join('/')}`;
  return `${withSiteBase(next)}${url.search}`;
}

export function persistLocale(locale: Locale): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export function readStoredLocale(): Locale | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return raw && isLocale(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function detectPreferredLocale(): Locale {
  const stored = readStoredLocale();
  if (stored) {
    return stored;
  }
  if (typeof navigator === 'undefined') {
    return defaultLocale;
  }
  const language = navigator.language.slice(0, 2).toLowerCase();
  return language === 'es' ? 'es' : 'en';
}

export function localeParams(): { params: { lang: Locale } }[] {
  return locales.map((lang) => ({ params: { lang } }));
}

export function localeSlugParams(slugs: string[]): { params: { lang: Locale; slug: string } }[] {
  return locales.flatMap((lang) => slugs.map((slug) => ({ params: { lang, slug } })));
}

export function requireLocale(value: string | undefined): Locale {
  if (value && isLocale(value)) {
    return value;
  }
  throw new Error(`Unknown locale: ${value ?? ''}`);
}

export function hydrateI18n(root: ParentNode, locale: Locale): void {
  const translate = useTranslations(locale);
  if (root instanceof Document) {
    root.documentElement.lang = locale;
  }
  for (const node of root.querySelectorAll('[data-i18n]')) {
    const key = node.getAttribute('data-i18n');
    if (key) {
      node.textContent = translate(key as MessageKey);
    }
  }
  for (const node of root.querySelectorAll('[data-i18n-aria]')) {
    const key = node.getAttribute('data-i18n-aria');
    if (key) {
      node.setAttribute('aria-label', translate(key as MessageKey));
    }
  }
  for (const node of root.querySelectorAll('[data-locale-path]')) {
    const path = node.getAttribute('data-locale-path');
    if (path && node instanceof HTMLAnchorElement) {
      node.href = withSiteBase(localePath(locale, path));
    }
  }
}

function lookup(messages: NestedString<Messages>, key: MessageKey): string | undefined {
  const [group, name] = key.split('.') as [keyof Messages, string];
  const section = messages[group];
  if (!section || !(name in section)) {
    return undefined;
  }
  const value = section[name as keyof typeof section];
  return typeof value === 'string' ? value : undefined;
}

function pathSegments(pathname: string): string[] {
  const base = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
  let path = pathname;
  if (base) {
    if (path === base || path === `${base}/`) {
      path = '/';
    } else if (path.startsWith(`${base}/`)) {
      path = path.slice(base.length);
    }
  }
  return path.split('/').filter(Boolean);
}

function withSiteBase(path: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
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

export {
  defaultLocale,
  htmlLang,
  isLocale,
  locales,
  LOCALE_STORAGE_KEY,
  ogLocale,
  ogLocaleAlternate,
} from './locales';
export type { Locale } from './locales';
