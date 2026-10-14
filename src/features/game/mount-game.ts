import type { GameSnapshot } from '../../types/game';
import type { Song } from '../../types/catalog';
import type { Locale } from '../../i18n';
import { locales, persistLocale, useTranslations } from '../../i18n';
import { YouTubePlayer, YouTubeUnavailableError } from '../../lib/player/youtube-player';
import { buildYouTubeWatchUrl, parseYouTubeUrl } from '../../lib/player/youtube-url';
import {
  getAllowedTimerSeconds,
  isTimerSeconds,
  readPreferences,
  writePreferences,
} from '../../lib/services/preferences';
import { padTwo } from '../../utils/format';
import { withLocale } from '../../utils/paths';
import { lyricLanguage } from '../../utils/seo';
import { formatArtistNames } from '../../utils/text';
import { atmosphereFromSeed, atmosphereStyle } from './atmosphere';
import { GameEngine } from './game-engine';
import { iconClose, iconPlay } from './icons';

export async function mountGame(root: HTMLElement, locale: Locale): Promise<void> {
  const t = useTranslations(locale);
  const params = new URLSearchParams(window.location.search);
  const categorySlug = params.get('category') ?? undefined;
  const songSlug = params.get('song') ?? undefined;
  const preferences = readPreferences();

  root.innerHTML = shellHtml(locale, t);
  const refs = bind(root);
  applyAtmosphere(refs.atmosphere, 'lyric-guess');
  persistLocale(locale);

  const { getBrowserCatalog } = await import('../../lib/repositories/create-catalog');
  let engine: GameEngine | null = null;

  const player = new YouTubePlayer(refs.playerMount);
  let renderedPhase: GameSnapshot['phase'] | null = null;
  let renderedSongId: string | null = null;

  refs.closePlayer.addEventListener('click', () => {
    void player.stop();
    refs.sheet.hidden = true;
  });

  refs.timerSelect.value = String(preferences.timerSeconds);
  refs.timerSelect.addEventListener('change', () => {
    const next = Number(refs.timerSelect.value);
    if (!isTimerSeconds(next)) {
      return;
    }
    writePreferences({ timerSeconds: next });
    void restart();
  });

  root.querySelectorAll('.lang-switch a[data-locale]').forEach((node) => {
    node.addEventListener('click', () => {
      const next = node.getAttribute('data-locale');
      if (next === 'es' || next === 'en') {
        persistLocale(next);
      }
    });
  });

  document.addEventListener('keydown', onKey);

  async function restart(): Promise<void> {
    engine?.dispose();
    await player.stop();
    refs.sheet.hidden = true;
    renderedPhase = null;
    renderedSongId = null;
    const prefs = readPreferences();
    try {
      const catalog = await getBrowserCatalog();
      engine = new GameEngine({
        songs: catalog.songs,
        durationMs: prefs.timerSeconds * 1000,
      });
      engine.subscribe(render);
      const filter =
        categorySlug || songSlug
          ? {
              ...(categorySlug ? { categorySlug } : {}),
              ...(songSlug ? { songSlug } : {}),
            }
          : {};
      await engine.start(filter);
    } catch {
      render({
        phase: 'error',
        song: null,
        remainingMs: 0,
        durationMs: prefs.timerSeconds * 1000,
        errorMessage: t('play.catalogError'),
        playedCount: 0,
      });
    }
  }

  function render(snapshot: GameSnapshot): void {
    const seconds = Math.ceil(snapshot.remainingMs / 1000);
    refs.timerValue.textContent = padTwo(seconds);
    refs.timerWrap.setAttribute('aria-label', t('play.remaining', { seconds }));
    root.classList.toggle('is-revealed', snapshot.phase === 'revealed');

    const sameRound = snapshot.phase === renderedPhase && snapshot.song?.id === renderedSongId;
    if (sameRound) {
      return;
    }

    renderedPhase = snapshot.phase;
    renderedSongId = snapshot.song?.id ?? null;

    if (snapshot.song) {
      applyAtmosphere(refs.atmosphere, snapshot.song.id);
    }

    if (snapshot.phase === 'loading') {
      setStatus(t('play.loading'));
      setActions('guessing', null);
      return;
    }

    if (snapshot.phase === 'error') {
      setStatus(snapshot.errorMessage ?? t('play.genericError'));
      setActions('error', null);
      return;
    }

    if (snapshot.phase === 'empty') {
      setStatus(t('play.empty'));
      setActions('empty', null);
      return;
    }

    if (!snapshot.song) {
      setStatus(t('play.loading'));
      return;
    }

    if (snapshot.phase === 'guessing') {
      setLyrics(snapshot.song.lyrics);
      setActions('guessing', snapshot.song);
      return;
    }

    setReveal(snapshot.song);
    setActions('revealed', snapshot.song);
  }

  function setStatus(message: string): void {
    hideReveal();
    hidePlayer();
    refs.lyrics.textContent = '';
    refs.lyrics.removeAttribute('lang');
    refs.status.hidden = false;
    refs.status.textContent = message;
  }

  function setLyrics(lyrics: string): void {
    hideReveal();
    hidePlayer();
    refs.status.hidden = true;
    refs.lyrics.lang = lyricLanguage(lyrics);
    refs.lyrics.textContent = lyrics;
    replayLyricsEntrance();
  }

  function setReveal(song: Song): void {
    refs.reveal.hidden = false;
    refs.revealKicker.textContent = t('play.answer');
    refs.revealTitle.textContent = song.title;
    refs.revealArtist.textContent = formatArtistNames(song.artists.map((artist) => artist.name));
    refs.revealCategory.textContent = song.categories.map((category) => category.name).join(' · ');
  }

  function hideReveal(): void {
    refs.reveal.hidden = true;
    refs.revealKicker.textContent = '';
    refs.revealTitle.textContent = '';
    refs.revealArtist.textContent = '';
    refs.revealCategory.textContent = '';
  }

  function hidePlayer(): void {
    refs.sheet.hidden = true;
    void player.stop();
  }

  function replayLyricsEntrance(): void {
    refs.lyrics.classList.remove('lyrics--enter');
    void refs.lyrics.offsetWidth;
    refs.lyrics.classList.add('lyrics--enter');
  }

  function setActions(mode: 'guessing' | 'revealed' | 'error' | 'empty', song: Song | null): void {
    refs.actions.replaceChildren();

    if (mode === 'guessing') {
      refs.actions.append(actionButton(t('play.reveal'), () => engine?.reveal(), 'reveal'));
      return;
    }

    if (mode === 'revealed' && song) {
      refs.actions.append(
        actionButton(t('play.playFragment'), () => void playSong(song), 'play', true),
        actionButton(t('play.next'), () => void engine?.next(), 'next'),
      );
      return;
    }

    refs.actions.append(linkButton(t('play.browse'), withLocale(locale, '/categories')));
  }

  async function playSong(song: Song): Promise<void> {
    try {
      refs.sheet.hidden = false;
      refs.playerNote.textContent = song.demoClip ? t('play.demoNote') : t('play.youtubeNote');
      await player.play(song);
    } catch (error) {
      refs.playerMount.replaceChildren();
      const message =
        error instanceof YouTubeUnavailableError
          ? t('play.youtubeUnavailable')
          : t('play.playerFailed');
      const note = document.createElement('p');
      note.textContent = message;
      refs.playerMount.append(note);
      const parsed = parseYouTubeUrl(song.youtubeUrl);
      const watch = parsed ? buildYouTubeWatchUrl(parsed.videoId, song.youtubeStartSeconds) : null;
      if (watch) {
        const link = document.createElement('a');
        link.href = watch;
        link.rel = 'noreferrer noopener';
        link.target = '_blank';
        link.className = 'ghost-link';
        link.textContent = t('play.openYoutube');
        refs.playerMount.append(link);
      }
      refs.sheet.hidden = false;
    }
  }

  function onKey(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
      return;
    }
    if (event.key === 'r' || event.key === 'R') {
      engine?.reveal();
    }
    if (event.key === 'n' || event.key === 'N') {
      void engine?.next();
    }
  }

  await restart();

  return undefined;
}

function applyAtmosphere(node: HTMLElement, seed: string): void {
  node.setAttribute('style', atmosphereStyle(atmosphereFromSeed(seed)));
}

function actionButton(
  label: string,
  onClick: () => void,
  name: string,
  withIcon = false,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'text-btn';
  button.dataset.action = name;
  if (withIcon) {
    button.innerHTML = `${iconPlay()}<span></span>`;
    const span = button.querySelector('span');
    if (span) {
      span.textContent = label;
    }
  } else {
    button.textContent = label;
  }
  button.addEventListener('click', onClick);
  return button;
}

function linkButton(label: string, href: string): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = 'ghost-link';
  link.href = href;
  link.textContent = label;
  return link;
}

function shellHtml(locale: Locale, t: ReturnType<typeof useTranslations>): string {
  const home = withLocale(locale, '/');
  const search = window.location.search;
  const options = getAllowedTimerSeconds()
    .map((value) => `<option value="${value}">${value}s</option>`)
    .join('');
  const langLinks = locales
    .map((code) => {
      const current = code === locale ? ' aria-current="true"' : '';
      return `<a href="${withLocale(code, '/play')}${search}" hreflang="${code}" lang="${code}" data-locale="${code}"${current}>${code.toUpperCase()}</a>`;
    })
    .join('');

  return `
    <div class="atmosphere" data-ref="atmosphere" aria-hidden="true">
      <div class="atmosphere__blob atmosphere__blob--a"></div>
      <div class="atmosphere__blob atmosphere__blob--b"></div>
      <div class="atmosphere__blob atmosphere__blob--c"></div>
      <div class="atmosphere__noise"></div>
      <div class="atmosphere__scrim"></div>
    </div>
    <header class="game-bar">
      <div class="game-bar__brand">
        <a class="wordmark" href="${home}">Lyric-Guess</a>
        <nav class="lang-switch" aria-label="${t('nav.language')}">${langLinks}</nav>
      </div>
      <div class="timer" data-ref="timer" aria-live="polite">
        <span class="timer__label">${t('play.seconds')}</span>
        <span class="timer__value" data-ref="timer-value">15</span>
      </div>
    </header>
    <main id="game-main" class="game-stage">
      <p class="status-copy" data-ref="status">${t('play.loading')}</p>
      <p class="lyrics" data-ref="lyrics"></p>
      <section class="reveal" data-ref="reveal" hidden>
        <p class="reveal__kicker" data-ref="reveal-kicker">${t('play.answer')}</p>
        <h1 class="reveal__title" data-ref="reveal-title"></h1>
        <p class="meta" data-ref="reveal-artist"></p>
        <p class="meta" data-ref="reveal-category"></p>
      </section>
    </main>
    <footer class="game-actions">
      <div data-ref="actions" class="btn-row"></div>
      <label class="timer-select">${t('play.timer')}
        <select data-ref="timer-select" aria-label="${t('play.roundLength')}">${options}</select>
      </label>
    </footer>
    <div class="player-sheet" data-ref="sheet" hidden>
      <div class="btn-row">
        <p data-ref="player-note" class="meta"></p>
        <button type="button" class="text-btn" data-ref="close-player">${iconClose()}<span>${t('play.close')}</span></button>
      </div>
      <div data-ref="player-mount"></div>
    </div>
  `;
}

function bind(root: HTMLElement) {
  const required = (name: string): HTMLElement => {
    const node = root.querySelector(`[data-ref="${name}"]`);
    if (!(node instanceof HTMLElement)) {
      throw new Error(`Missing game element: ${name}`);
    }
    return node;
  };

  const timerSelect = required('timer-select');
  if (!(timerSelect instanceof HTMLSelectElement)) {
    throw new Error('Timer select missing');
  }

  return {
    atmosphere: required('atmosphere'),
    timerWrap: required('timer'),
    timerValue: required('timer-value'),
    status: required('status'),
    lyrics: required('lyrics'),
    reveal: required('reveal'),
    revealKicker: required('reveal-kicker'),
    revealTitle: required('reveal-title'),
    revealArtist: required('reveal-artist'),
    revealCategory: required('reveal-category'),
    actions: required('actions'),
    timerSelect,
    sheet: required('sheet'),
    playerMount: required('player-mount'),
    playerNote: required('player-note'),
    closePlayer: required('close-player'),
  };
}
