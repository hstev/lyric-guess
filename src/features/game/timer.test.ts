import { afterEach, describe, expect, it, vi } from 'vitest';
import { CountdownTimer } from './timer';

describe('CountdownTimer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('counts down from timestamps rather than interval ticks', () => {
    vi.useFakeTimers();
    let current = 0;
    const timer = new CountdownTimer(() => current);
    timer.start(15_000);

    current = 4_000;
    vi.advanceTimersByTime(200);

    expect(timer.getSnapshot().remainingMs).toBe(11_000);
    timer.dispose();
  });

  it('completes when remaining time reaches zero', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
    const timer = new CountdownTimer(() => Date.now());
    timer.start(1_000);
    vi.setSystemTime(new Date('2026-01-01T00:00:01.000Z'));
    vi.advanceTimersByTime(200);
    expect(timer.getSnapshot().completed).toBe(true);
    expect(timer.getSnapshot().remainingMs).toBe(0);
    timer.dispose();
  });

  it('finish() reveals immediately and stop() clears timers', () => {
    vi.useFakeTimers();
    const timer = new CountdownTimer(() => Date.now());
    timer.start(8_000);
    timer.finish();
    expect(timer.getSnapshot().completed).toBe(true);
    timer.stop();
    expect(timer.getSnapshot().running).toBe(false);
    timer.dispose();
  });
});
