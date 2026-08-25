import type { TimerSnapshot } from '../../types/game';

export type TimerListener = (snapshot: TimerSnapshot) => void;

export class CountdownTimer {
  private durationMs = 0;
  private startedAt = 0;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private listeners = new Set<TimerListener>();
  private visibilityHandler: (() => void) | null = null;
  private completed = false;
  private running = false;

  constructor(private readonly now: () => number = () => Date.now()) {}

  subscribe(listener: TimerListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  start(durationMs: number): void {
    this.clearLoop();
    this.durationMs = Math.max(0, durationMs);
    this.startedAt = this.now();
    this.completed = false;
    this.running = true;
    this.attachVisibility();
    this.tick();
  }

  finish(): void {
    if (this.completed) {
      return;
    }
    this.clearLoop();
    this.running = false;
    this.completed = true;
    this.emit();
  }

  stop(): void {
    this.clearLoop();
    this.detachVisibility();
    this.running = false;
  }

  dispose(): void {
    this.stop();
    this.listeners.clear();
  }

  getSnapshot(): TimerSnapshot {
    return {
      remainingMs: this.getRemainingMs(),
      durationMs: this.durationMs,
      running: this.running,
      completed: this.completed,
    };
  }

  private getRemainingMs(): number {
    if (this.completed || this.durationMs === 0) {
      return this.completed ? 0 : this.durationMs;
    }
    if (!this.running) {
      return this.durationMs;
    }
    return Math.max(0, this.durationMs - (this.now() - this.startedAt));
  }

  private tick = (): void => {
    const remaining = this.getRemainingMs();
    if (remaining <= 0) {
      this.running = false;
      this.completed = true;
      this.clearLoop();
      this.emit();
      return;
    }

    this.emit();
    const delay = Math.min(200, remaining);
    this.timeoutId = setTimeout(this.tick, delay);
  };

  private emit(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private clearLoop(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  private attachVisibility(): void {
    if (typeof document === 'undefined' || this.visibilityHandler) {
      return;
    }

    this.visibilityHandler = () => {
      if (document.hidden) {
        this.clearLoop();
        return;
      }
      if (this.running && !this.completed) {
        this.tick();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  private detachVisibility(): void {
    if (!this.visibilityHandler || typeof document === 'undefined') {
      return;
    }
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    this.visibilityHandler = null;
  }
}
