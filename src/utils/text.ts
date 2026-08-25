export function slugify(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatArtistNames(names: string[]): string {
  if (names.length === 0) {
    return 'Unknown artist';
  }
  if (names.length === 1) {
    return names[0] ?? 'Unknown artist';
  }
  if (names.length === 2) {
    return `${names[0]} & ${names[1]}`;
  }
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`;
}
