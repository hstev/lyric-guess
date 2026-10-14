import type { Artist, Category, Song } from '../types/catalog';

export const SEED_VERSION = '1';

const createdAt = '2026-01-12T10:00:00.000Z';
const updatedAt = createdAt;

export const seedArtists: Artist[] = [
  { id: 'artist_realidad_mental', name: 'Realidad Mental', slug: 'realidad-mental' },
  { id: 'artist_selene', name: 'Selene', slug: 'selene' },
  { id: 'artist_mañas_rufino', name: 'Mañas Ru-fino', slug: 'mañas-ru-fino' },
  { id: 'artist_luis_7_lunes', name: 'Luis7Lunes', slug: 'luis-7-lunes' },
];

export const seedCategories: Category[] = [{ id: 'cat_rap', name: 'Rap', slug: 'rap' }];

const artistsById = new Map(seedArtists.map((artist) => [artist.id, artist]));
const categoriesById = new Map(seedCategories.map((category) => [category.id, category]));

function requireArtist(id: string): Artist {
  const artist = artistsById.get(id);
  if (!artist) {
    throw new Error(`Unknown seed artist: ${id}`);
  }
  return artist;
}

function requireCategory(id: string): Category {
  const category = categoriesById.get(id);
  if (!category) {
    throw new Error(`Unknown seed category: ${id}`);
  }
  return category;
}

type SeedSongInput = {
  id: string;
  slug: string;
  title: string;
  lyrics: string;
  youtubeUrl: string | null;
  youtubeStartSeconds: number;
  youtubeEndSeconds: number | null;
  durationSeconds: number | null;
  demoClip: boolean;
  artistIds: string[];
  categoryIds: string[];
};

const seedSongInputs: SeedSongInput[] = [
  {
    id: '9c864e5a-c50a-4881-a59f-edfa6e4f89e7',
    slug: '9c864e5a-c50a-4881-a59f-edfa6e4f89e7',
    title: 'La FIERITA',
    lyrics: 'La vida me detesta y eso no me molesta\nme pongo mis audifonos y armo severa fiesta',
    youtubeUrl: 'https://www.youtube.com/watch?v=YaYzhvako6o',
    youtubeStartSeconds: 53,
    youtubeEndSeconds: 64,
    durationSeconds: 11,
    demoClip: true,
    artistIds: ['artist_realidad_mental'],
    categoryIds: ['cat_rap'],
  },
  {
    id: 'd86b85ac-a437-4b6a-8f2b-e696587f0b45',
    slug: 'd86b85ac-a437-4b6a-8f2b-e696587f0b45',
    title: 'Los versos de nuestra cuna',
    lyrics: 'No nay nada que hablar cuando los actos siempre dicen más\nJusta que es la verdad, sin callar, sin dudar de lo que grita.',
    youtubeUrl: 'https://youtu.be/DT7rIo90SVQ',
    youtubeStartSeconds: 22,
    youtubeEndSeconds: 34,
    durationSeconds: 13,
    demoClip: true,
    artistIds: ['artist_selene'],
    categoryIds: ['cat_rap'],
  },
  {
    id: '56823d00-dd77-4c09-a3aa-e2c1df53a352',
    slug: '56823d00-dd77-4c09-a3aa-e2c1df53a352',
    title: '$.A.N.T.E.R.I.A',
    lyrics: 'Acá jugamos al ladrón y al policía\nsi no te dieron no es mi culpa no tenían\nsoy el vicioso que hace años no quería\ny ya me vieron atrapado esperando la luz del día.',
    youtubeUrl: 'https://youtu.be/TgKKxLa9nRo',
    youtubeStartSeconds: 23,
    youtubeEndSeconds: 35,
    durationSeconds: 13,
    demoClip: true,
    artistIds: ['artist_mañas_rufino'],
    categoryIds: ['cat_rap'],
  },
  {
    id: '56823d00-dd77-4c09-a3aa-e2c1df53a352',
    slug: '56823d00-dd77-4c09-a3aa-e2c1df53a352',
    title: 'Agua y ensalada',
    lyrics: 'Enbolatados van a señalarte el norte\nSé que me corresponde una parte.\nno tocar cual arte, que yo me muevo escribiendo aparte\nMejor si no encajan tu marco y corte',
    youtubeUrl: 'https://youtu.be/FoE0xCUnSWA',
    youtubeStartSeconds: 22,
    youtubeEndSeconds: 34,
    durationSeconds: 12,
    demoClip: true,
    artistIds: ['artist_luis_7_lunes'],
    categoryIds: ['cat_rap'],
  },
];

export const seedSongs: Song[] = seedSongInputs.map((input) => ({
  id: input.id,
  slug: input.slug,
  title: input.title,
  lyrics: input.lyrics,
  youtubeUrl: input.youtubeUrl,
  youtubeStartSeconds: input.youtubeStartSeconds,
  youtubeEndSeconds: input.youtubeEndSeconds,
  durationSeconds: input.durationSeconds,
  demoClip: input.demoClip,
  createdAt,
  updatedAt,
  artists: input.artistIds.map(requireArtist),
  categories: input.categoryIds.map(requireCategory),
}));

export const featuredCategorySlug = 'rap';
