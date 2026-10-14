import type { Song } from '../../types/catalog';
import type { Locale } from '../../i18n';
import { t } from '../../i18n';
import { absoluteLocaleUrl } from '../../utils/paths';
import { lyricLanguage } from '../../utils/seo';

export function musicRecordingJsonLd(
  song: Song,
  locale: Locale,
  site: URL | string | undefined,
): Record<string, unknown> {
  const language = lyricLanguage(song.lyrics);
  return {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    url: absoluteLocaleUrl(locale, `/songs/${song.slug}`, site),
    byArtist: song.artists.map((artist) => ({
      '@type': artistType(artist.name),
      name: artist.name,
      url: absoluteLocaleUrl(locale, `/artists/${artist.slug}`, site),
    })),
    genre: song.categories.map((category) => category.name),
    lyrics: {
      '@type': 'CreativeWork',
      inLanguage: language,
      text: song.lyrics,
    },
    inLanguage: language,
    isFamilyFriendly: true,
  };
}

export function songPageJsonLd(
  song: Song,
  locale: Locale,
  site: URL | string | undefined,
): Record<string, unknown>[] {
  return [musicRecordingJsonLd(song, locale, site), songBreadcrumbJsonLd(song, locale, site)];
}

export function songBreadcrumbJsonLd(
  song: Song,
  locale: Locale,
  site: URL | string | undefined,
): Record<string, unknown> {
  const category = song.categories[0];
  const items = [
    { name: 'Lyric-Guess', path: '/' },
    ...(category ? [{ name: category.name, path: `/categories/${category.slug}` }] : []),
    { name: song.title, path: `/songs/${song.slug}` },
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteLocaleUrl(locale, item.path, site),
    })),
  };
}

export function musicGroupJsonLd(
  name: string,
  slug: string,
  songNames: string[],
  locale: Locale,
  site: URL | string | undefined,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': artistType(name),
    name,
    url: absoluteLocaleUrl(locale, `/artists/${slug}`, site),
    ...(songNames.length > 0
      ? {
          track: songNames.map((title) => ({
            '@type': 'MusicRecording',
            name: title,
          })),
        }
      : {}),
  };
}

export function webSiteJsonLd(
  locale: Locale,
  site: URL | string | undefined,
): Record<string, unknown> {
  const origin = absoluteLocaleUrl(locale, '/', site);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lyric-Guess',
    url: origin,
    description: t(locale, 'seo.siteDescription'),
    inLanguage: locale,
    availableLanguage: ['es', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteLocaleUrl(locale, '/search', site)}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

function artistType(name: string): 'MusicGroup' | 'Person' {
  if (/^the\s/i.test(name) || name.includes('&') || /\bband\b/i.test(name)) {
    return 'MusicGroup';
  }
  return 'Person';
}
