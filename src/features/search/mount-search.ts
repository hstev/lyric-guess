import type { Locale } from '../../i18n';
import { persistLocale, useTranslations } from '../../i18n';
import { withLocale } from '../../utils/paths';
import { formatArtistNames } from '../../utils/text';

export async function mountSearch(root: HTMLElement, locale: Locale): Promise<void> {
  const t = useTranslations(locale);
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('q') ?? '';
  persistLocale(locale);

  root.innerHTML = `
    <label class="kicker" for="song-search">${t('search.label')}</label>
    <input id="song-search" class="search-box" type="search" placeholder="${t('search.placeholder')}" value="" autocomplete="off" />
    <p class="meta" data-ref="status">${t('search.opening')}</p>
    <ul class="song-list" data-ref="results"></ul>
  `;

  const input = root.querySelector('input');
  const status = root.querySelector('[data-ref="status"]');
  const results = root.querySelector('[data-ref="results"]');
  if (
    !(input instanceof HTMLInputElement) ||
    !(status instanceof HTMLElement) ||
    !(results instanceof HTMLElement)
  ) {
    return;
  }

  input.value = initial;

  try {
    const { getBrowserCatalog } = await import('../../lib/repositories/create-catalog');
    const catalog = await getBrowserCatalog();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const run = async (): Promise<void> => {
      const query = input.value.trim();
      const url = new URL(window.location.href);
      if (query) {
        url.searchParams.set('q', query);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url);

      if (!query) {
        results.replaceChildren();
        status.textContent = t('search.hint');
        return;
      }

      const songs = await catalog.songs.searchSongs(query);
      results.replaceChildren();
      if (songs.length === 0) {
        status.textContent = t('search.noMatches', { query });
        return;
      }

      status.textContent = t(songs.length === 1 ? 'search.songCount' : 'search.songCountPlural', {
        count: songs.length,
      });
      for (const song of songs) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = withLocale(locale, `/songs/${song.slug}`);
        const title = document.createElement('span');
        title.className = 'song-list__title';
        title.textContent = song.title;
        const meta = document.createElement('span');
        meta.className = 'song-list__meta';
        meta.textContent = formatArtistNames(song.artists.map((artist) => artist.name));
        link.append(title, meta);
        item.append(link);
        results.append(item);
      }
    };

    input.addEventListener('input', () => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        void run();
      }, 120);
    });

    await run();
    input.focus();
  } catch {
    status.textContent = t('search.unavailable');
  }
}
