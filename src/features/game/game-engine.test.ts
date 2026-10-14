import { describe, expect, it } from 'vitest';
import { MemorySongRepository } from '../../lib/repositories/memory-catalog';
import { seedSongs } from '../../data/seed-catalog';
import { GameEngine } from './game-engine';
import { CountdownTimer } from './timer';

describe('GameEngine', () => {
  it('loads a requested song and reveals it on demand', async () => {
    const engine = new GameEngine({
      songs: new MemorySongRepository(),
      timer: new CountdownTimer(),
      durationMs: 15_000,
    });

    const first = seedSongs[0];
    if (!first) {
      throw new Error('seed required');
    }

    await engine.start({ songSlug: first.slug });
    expect(engine.getSnapshot().phase).toBe('guessing');
    expect(engine.getSnapshot().song?.slug).toBe(first.slug);

    engine.reveal();
    expect(engine.getSnapshot().phase).toBe('revealed');
    expect(engine.getSnapshot().remainingMs).toBe(0);
    engine.dispose();
  });

  it('moves to the next song after a reveal', async () => {
    const engine = new GameEngine({
      songs: new MemorySongRepository(),
      durationMs: 5_000,
    });

    await engine.start();
    const firstId = engine.getSnapshot().song?.id;
    engine.reveal();
    await engine.next();
    expect(engine.getSnapshot().phase).toBe('guessing');
    if (seedSongs.length > 1) {
      expect(engine.getSnapshot().song?.id).not.toBe(firstId);
    } else {
      expect(engine.getSnapshot().song?.id).toBe(firstId);
    }
    engine.dispose();
  });

  it('reports an empty collection', async () => {
    const engine = new GameEngine({
      songs: new MemorySongRepository([]),
      durationMs: 5_000,
    });
    await engine.start();
    expect(engine.getSnapshot().phase).toBe('empty');
    engine.dispose();
  });
});
