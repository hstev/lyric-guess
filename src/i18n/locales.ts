export const locales = ['es', 'en'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const LOCALE_STORAGE_KEY = 'lyric-guess.locale';

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function htmlLang(locale: Locale): string {
  return locale;
}

export function ogLocale(locale: Locale): string {
  return locale === 'es' ? 'es_419' : 'en_US';
}

export function ogLocaleAlternate(locale: Locale): string {
  return locale === 'es' ? 'en_US' : 'es_419';
}
