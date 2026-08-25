import type { GameSnapshot } from '../../types/game';
import type { Song } from '../../types/catalog';
import { YouTubePlayer, YouTubeUnavailableError } from '../../lib/player/youtube-player';
import { buildYouTubeWatchUrl, parseYouTubeUrl } from '../../lib/player/youtube-url';
import {
  getAllowedTimerSeconds,
  isTimerSeconds,
  readPreferences,
  writePreferences,
} from '../../lib/services/preferences';
import { padTwo } from '../../utils/format';
import { withBase } from '../../utils/paths';
import { formatArtistNames } from '../../utils/text';
import { atmosphereFromSeed, atmosphereStyle } from './atmosphere';
import { GameEngine } from './game-engine';
import { iconClose, iconPlay } from './icons';

export async function mountGame(root: HTMLElement): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const categorySlug = params.get('category') ?? undefined;
  const songSlug = params.get('song') ?? undefined;
  const preferences = readPreferences();

  root.innerHTML = shellHtml();
  const refs = bind(root);
  applyAtmosphere(refs.atmosphere, 'lyric-guess');

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
        errorMessage: 'The catalog could not be opened. Try refreshing the page.',
        playedCount: 0,
      });
    }
  }

  function render(snapshot: GameSnapshot): void {
    const seconds = Math.ceil(snapshot.remainingMs / 1000);
    refs.timerValue.textContent = padTwo(seconds);
    refs.timerWrap.setAttribute('aria-label', `${seconds} seconds remaining`);
    root.classList.toggle('is-revealed', snapshot.phase === 'revealed');

    const sameRound =
      snapshot.phase === renderedPhase && snapshot.song?.id === renderedSongId;
    if (sameRound) {
      return;
    }

    renderedPhase = snapshot.phase;
    renderedSongId = snapshot.song?.id ?? null;

    if (snapshot.song) {
      applyAtmosphere(refs.atmosphere, snapshot.song.id);
    }

    if (snapshot.phase === 'loading') {
      setStatus('Loading song…');
      setActions('guessing', null);
      return;
    }

    if (snapshot.phase === 'error') {
      setStatus(snapshot.errorMessage ?? 'Something went wrong.');
      setActions('error', null);
      return;
    }

    if (snapshot.phase === 'empty') {
      setStatus('No songs in this collection yet.');
      setActions('empty', null);
      return;
    }

    if (!snapshot.song) {
      setStatus('Loading song…');
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
    refs.status.hidden = false;
    refs.status.textContent = message;
  }

  function setLyrics(lyrics: string): void {
    hideReveal();
    hidePlayer();
    refs.status.hidden = true;
    refs.lyrics.textContent = lyrics;
    replayLyricsEntrance();
  }

  function setReveal(song: Song): void {
    refs.reveal.hidden = false;
    refs.revealKicker.textContent = 'Answer';
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
      refs.actions.append(actionButton('Reveal answer', () => engine?.reveal(), 'reveal'));
      return;
    }

    if (mode === 'revealed' && song) {
      refs.actions.append(
        actionButton('Play fragment', () => void playSong(song), 'play', true),
        actionButton('Next song', () => void engine?.next(), 'next'),
      );
      return;
    }

    refs.actions.append(linkButton('Browse catalog', withBase('/categories')));
  }

  async function playSong(song: Song): Promise<void> {
    try {
      refs.sheet.hidden = false;
      refs.playerNote.textContent = song.demoClip
        ? 'Demo clip from a public-domain open movie, used to test fragment playback.'
        : 'Official YouTube embed for this lyric fragment.';
      await player.play(song);
    } catch (error) {
      refs.playerMount.replaceChildren();
      const message =
        error instanceof YouTubeUnavailableError
          ? 'YouTube is not available for this song.'
          : 'The player could not start. You can open YouTube instead.';
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
        link.textContent = 'Open on YouTube';
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

function shellHtml(): string {
  const home = withBase('/');
  const options = getAllowedTimerSeconds()
    .map((value) => `<option value="${value}">${value}s</option>`)
    .join('');

  return `
    <div class="atmosphere" data-ref="atmosphere" aria-hidden="true">
      <div class="atmosphere__blob atmosphere__blob--a"></div>
      <div class="atmosphere__blob atmosphere__blob--b"></div>
      <div class="atmosphere__blob atmosphere__blob--c"></div>
      <div class="atmosphere__noise"></div>
      <div class="atmosphere__scrim"></div>
    </div>
    <a class="skip-link" href="#game-main">Skip to lyrics</a>
    <header class="game-bar">
      <a class="wordmark" href="${home}">Lyric-Guess</a>
      <div class="timer" data-ref="timer" aria-live="polite">
        <span class="timer__label">seconds</span>
        <span class="timer__value" data-ref="timer-value">15</span>
      </div>
    </header>
    <main id="game-main" class="game-stage">
      <p class="status-copy" data-ref="status">Loading song…</p>
      <p class="lyrics" data-ref="lyrics"></p>
      <section class="reveal" data-ref="reveal" hidden>
        <p class="reveal__kicker" data-ref="reveal-kicker">Answer</p>
        <h1 class="reveal__title" data-ref="reveal-title"></h1>
        <p class="meta" data-ref="reveal-artist"></p>
        <p class="meta" data-ref="reveal-category"></p>
      </section>
    </main>
    <footer class="game-actions">
      <div data-ref="actions" class="btn-row"></div>
      <label class="timer-select">Timer
        <select data-ref="timer-select" aria-label="Round length">${options}</select>
      </label>
    </footer>
    <div class="player-sheet" data-ref="sheet" hidden>
      <div class="btn-row">
        <p data-ref="player-note" class="meta"></p>
        <button type="button" class="text-btn" data-ref="close-player">${iconClose()}<span>Close</span></button>
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
