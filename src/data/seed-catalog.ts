import type { Artist, Category, Song } from '../types/catalog';

export const SEED_VERSION = '20261013-05';

const createdAt = '2026-01-12T10:00:00.000Z';
const updatedAt = createdAt;

export const seedArtists: Artist[] = [
  { id: 'artist_realidad_mental', name: 'Realidad Mental', slug: 'realidad-mental' },
  { id: 'artist_selene', name: 'Selene', slug: 'selene' },
  { id: 'artist_mañas_rufino', name: 'Mañas Ru-fino', slug: 'mañas-ru-fino' },
  { id: 'artist_luis_7_lunes', name: 'Luis7Lunes', slug: 'luis-7-lunes' },
  { id: 'artist_radio_mc', name: 'Radio MC', slug: 'radio-mc' },
  { id: 'artist_asir_ones', name: 'Asir Ones', slug: 'asir-ones' },
  { id: 'artist_noiseferatu', name: 'Noiseferatu', slug: 'noiseferatu' },
  { id: 'artist_gambeta', name: 'Gambeta', slug: 'gambeta' },
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
    id: '113672bf-281c-4bea-8a98-8014e0733c51',
    slug: '113672bf-281c-4bea-8a98-8014e0733c51',
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
  {
    id: 'bebf80bf-763e-4eef-8dc5-dcc1771a5776',
    slug: 'bebf80bf-763e-4eef-8dc5-dcc1771a5776',
    title: 'El barrio no es un negocio',
    lyrics: 'Y asi contribuir a mi comuna con salud y educación\nmás camadas de niños bro escuchando Hip Hop',
    youtubeUrl: 'https://youtu.be/eIE07fGNz-0',
    youtubeStartSeconds: 53,
    youtubeEndSeconds: 59,
    durationSeconds: 6,
    demoClip: true,
    artistIds: ['artist_radio_mc'],
    categoryIds: ['cat_rap'],
  },
  {
    id: '62993d1c-a452-470e-b94e-f9d0b25f7cd7',
    slug: '62993d1c-a452-470e-b94e-f9d0b25f7cd7',
    title: 'Ironías',
    lyrics: 'A la final todos deben comer\nNo me preguntes por la falta de modales\nNo vas a hablarle de conciencia a niños que crecieron en la calle.',
    youtubeUrl: 'https://youtu.be/tYnGoxtVR3s',
    youtubeStartSeconds: 52,
    youtubeEndSeconds: 59,
    durationSeconds: 6,
    demoClip: true,
    artistIds: ['artist_asir_ones'],
    categoryIds: ['cat_rap'],
  },
  {
    id: '7c846c03-5eb4-477f-a154-f4152d6dff64',
    slug: '7c846c03-5eb4-477f-a154-f4152d6dff64',
    title: 'PARA SIEMPRE',
    lyrics: 'Todo lo que pasamos no es por nada\n¿Aporreones en la rodilla? si, no palmadas en la espalda.',
    youtubeUrl: 'https://youtu.be/iIJsRA6YGso',
    youtubeStartSeconds: 71,
    youtubeEndSeconds: 77,
    durationSeconds: 6,
    demoClip: true,
    artistIds: ['artist_asir_ones'],
    categoryIds: ['cat_rap'],
  },
  {
    id: 'bc883bb8-24d6-4aa6-9197-6f091912a727',
    slug: 'bc883bb8-24d6-4aa6-9197-6f091912a727',
    title: 'Entropía',
    lyrics: 'Medito bajo el lapo, no espero que cese\nIndustria indolente carece de lo que padece\nRapean sobre sus trapos\nFake G\'s aprendieron de capos\nDirigidos por Scorsese. ',
    youtubeUrl: 'https://youtu.be/At_2xS6V9aI',
    youtubeStartSeconds: 53,
    youtubeEndSeconds: 64,
    durationSeconds: 11,
    demoClip: true,
    artistIds: ['artist_noiseferatu'],
    categoryIds: ['cat_rap'],
  },
  {
    id: 'f7ac49f3-1ab6-42db-bbbb-5f14f34bf137',
    slug: 'f7ac49f3-1ab6-42db-bbbb-5f14f34bf137',
    title: 'Entropía',
    lyrics: 'Artistas no hacen arte\nUribestias de clóset\nParecen Polo Polo o Samuel Jackson en Django\nEngañados, se hacen matar por la causa de su amo',
    youtubeUrl: 'https://youtu.be/At_2xS6V9aI',
    youtubeStartSeconds: 53,
    youtubeEndSeconds: 64,
    durationSeconds: 11,
    demoClip: true,
    artistIds: ['artist_noiseferatu'],
    categoryIds: ['cat_rap'],
  },
  {
    id: 'c5590aa9-d1e9-4bac-9a8a-f5a5a8e31118',
    slug: 'c5590aa9-d1e9-4bac-9a8a-f5a5a8e31118',
    title: 'El propio 2',
    lyrics: 'Guerra infinita, igual todo funciona desde la cárcel y las cárceles no rehabilitan,\nLos que se van no resucitan\nPolíticos no acaban el conflicto, lo necesitan ',
    youtubeUrl: 'https://youtu.be/7wUqwkaTZNE',
    youtubeStartSeconds: 149,
    youtubeEndSeconds: 155,
    durationSeconds: 6,
    demoClip: true,
    artistIds: ['artist_gambeta'],
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
