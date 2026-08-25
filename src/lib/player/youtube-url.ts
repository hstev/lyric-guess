import type { YouTubeRef } from '../../types/player';

const VIDEO_ID = /^[a-zA-Z0-9_-]{11}$/;
const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

export function parseYouTubeUrl(url: string | null): YouTubeRef | null {
  if (!url) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) {
    return null;
  }

  const videoId = extractVideoId(parsed, host);
  if (!videoId || !VIDEO_ID.test(videoId)) {
    return null;
  }

  const start = parseSeconds(parsed.searchParams.get('start') ?? parsed.searchParams.get('t'));
  const end = parseSeconds(parsed.searchParams.get('end'));

  return {
    videoId,
    startSeconds: start ?? 0,
    endSeconds: end,
  };
}

export function buildYouTubeEmbedSrc(
  videoId: string,
  startSeconds: number,
  endSeconds: number | null,
): string | null {
  if (!VIDEO_ID.test(videoId)) {
    return null;
  }

  const params = new URLSearchParams({
    start: String(Math.max(0, Math.floor(startSeconds))),
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    autoplay: '1',
  });

  if (endSeconds !== null && endSeconds > startSeconds) {
    params.set('end', String(Math.floor(endSeconds)));
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function buildYouTubeWatchUrl(videoId: string, startSeconds: number): string | null {
  if (!VIDEO_ID.test(videoId)) {
    return null;
  }
  const start = Math.max(0, Math.floor(startSeconds));
  return `https://www.youtube.com/watch?v=${videoId}&t=${start}s`;
}

function extractVideoId(url: URL, host: string): string | null {
  if (host === 'youtu.be' || host === 'www.youtu.be') {
    return url.pathname.split('/').filter(Boolean)[0] ?? null;
  }

  if (url.pathname.startsWith('/embed/')) {
    return url.pathname.split('/')[2] ?? null;
  }

  if (url.pathname.startsWith('/shorts/')) {
    return url.pathname.split('/')[2] ?? null;
  }

  return url.searchParams.get('v');
}

function parseSeconds(value: string | null): number | null {
  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
  if (!match) {
    return null;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}
