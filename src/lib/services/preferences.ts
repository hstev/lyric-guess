const STORAGE_KEY = 'lyric-guess.preferences';
const DEFAULT_TIMER_SECONDS = 15;
const ALLOWED_TIMER_SECONDS = [10, 15, 20, 30] as const;

export type TimerSeconds = (typeof ALLOWED_TIMER_SECONDS)[number];

export type UserPreferences = {
  timerSeconds: TimerSeconds;
};

export function getAllowedTimerSeconds(): readonly TimerSeconds[] {
  return ALLOWED_TIMER_SECONDS;
}

export function readPreferences(): UserPreferences {
  const fallback: UserPreferences = {
    timerSeconds: defaultTimerSeconds(),
  };

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return fallback;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return fallback;
    }
    const timerSeconds = (parsed as { timerSeconds?: unknown }).timerSeconds;
    return {
      timerSeconds: isTimerSeconds(timerSeconds) ? timerSeconds : fallback.timerSeconds,
    };
  } catch {
    return fallback;
  }
}

export function writePreferences(preferences: UserPreferences): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function isTimerSeconds(value: unknown): value is TimerSeconds {
  return typeof value === 'number' && (ALLOWED_TIMER_SECONDS as readonly number[]).includes(value);
}

function defaultTimerSeconds(): TimerSeconds {
  const fromEnv = Number(import.meta.env.PUBLIC_DEFAULT_TIMER_SECONDS ?? DEFAULT_TIMER_SECONDS);
  return isTimerSeconds(fromEnv) ? fromEnv : DEFAULT_TIMER_SECONDS;
}
