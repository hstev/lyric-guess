import type { Song } from '../../types/catalog';
import type { MusicPlayer } from '../../types/player';
import { buildYouTubeEmbedSrc, parseYouTubeUrl } from './youtube-url';

export class YouTubeUnavailableError extends Error {
  constructor(message = 'This song has no playable YouTube fragment.') {
    super(message);
    this.name = 'YouTubeUnavailableError';
  }
}

export class YouTubePlayer implements MusicPlayer {
  constructor(private readonly mount: HTMLElement) {}

  async play(song: Song): Promise<void> {
    const parsed = parseYouTubeUrl(song.youtubeUrl);
    if (!parsed) {
      throw new YouTubeUnavailableError();
    }

    const start = song.youtubeStartSeconds || parsed.startSeconds;
    const end = song.youtubeEndSeconds ?? parsed.endSeconds;
    const src = buildYouTubeEmbedSrc(parsed.videoId, start, end);
    if (!src) {
      throw new YouTubeUnavailableError();
    }

    await this.stop();

    const frame = document.createElement('iframe');
    frame.src = src;
    frame.title = `YouTube fragment for ${song.title}`;
    frame.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    frame.allowFullscreen = true;
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    this.mount.replaceChildren(frame);
  }

  async stop(): Promise<void> {
    this.mount.replaceChildren();
  }
}
