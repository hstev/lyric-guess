export function escapeLike(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

export function likeContains(value: string): string {
  return `%${escapeLike(value.trim())}%`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}
