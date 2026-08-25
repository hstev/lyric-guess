import { describe, expect, it } from 'vitest';
import { buildYouTubeEmbedSrc, buildYouTubeWatchUrl, parseYouTubeUrl } from './youtube-url';

describe('YouTube URL helpers', () => {
  it('accepts official watch, short, and embed URLs', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/watch?v=aqz-KE-bpKQ')?.videoId).toBe(
      'aqz-KE-bpKQ',
    );
    expect(parseYouTubeUrl('https://youtu.be/aqz-KE-bpKQ')?.videoId).toBe('aqz-KE-bpKQ');
    expect(
      parseYouTubeUrl('https://www.youtube.com/embed/aqz-KE-bpKQ?start=12')?.startSeconds,
    ).toBe(12);
  });

  it('rejects non-YouTube hosts and malformed ids', () => {
    expect(parseYouTubeUrl('https://example.com/watch?v=aqz-KE-bpKQ')).toBeNull();
    expect(parseYouTubeUrl('https://www.youtube.com/watch?v=short')).toBeNull();
    expect(parseYouTubeUrl('javascript:alert(1)')).toBeNull();
  });

  it('builds embed URLs with start and end', () => {
    const src = buildYouTubeEmbedSrc('aqz-KE-bpKQ', 12, 27);
    expect(src).toContain('youtube-nocookie.com/embed/aqz-KE-bpKQ');
    expect(src).toContain('start=12');
    expect(src).toContain('end=27');
    expect(buildYouTubeWatchUrl('aqz-KE-bpKQ', 12)).toBe(
      'https://www.youtube.com/watch?v=aqz-KE-bpKQ&t=12s',
    );
    expect(buildYouTubeEmbedSrc('bad', 0, null)).toBeNull();
  });
});
