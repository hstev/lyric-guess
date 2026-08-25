import type { Artist, Category, Song } from '../types/catalog';

export const SEED_VERSION = '1';

const createdAt = '2026-01-12T10:00:00.000Z';
const updatedAt = createdAt;

export const seedArtists: Artist[] = [
  { id: 'artist_marina_vale', name: 'Marina Vale', slug: 'marina-vale' },
  { id: 'artist_wirebirds', name: 'The Wirebirds', slug: 'the-wirebirds' },
  { id: 'artist_solange_cruz', name: 'Solange Cruz', slug: 'solange-cruz' },
  { id: 'artist_rio_north', name: 'Rio North', slug: 'rio-north' },
  { id: 'artist_amos_wren', name: 'Amos Wren', slug: 'amos-wren' },
  { id: 'artist_kite_club', name: 'Kite Club', slug: 'kite-club' },
  { id: 'artist_nova_quinn', name: 'Nova Quinn', slug: 'nova-quinn' },
  {
    id: 'artist_ellis_nightshade',
    name: 'Ellis & the Nightshade',
    slug: 'ellis-and-the-nightshade',
  },
  { id: 'artist_hexa', name: 'Hexa', slug: 'hexa' },
  { id: 'artist_camila_duarte', name: 'Camila Duarte', slug: 'camila-duarte' },
  { id: 'artist_northroom', name: 'Northroom', slug: 'northroom' },
  { id: 'artist_juniper_low', name: 'Juniper Low', slug: 'juniper-low' },
  { id: 'artist_dj_paloma', name: 'DJ Paloma', slug: 'dj-paloma' },
  { id: 'artist_hollow_choir', name: 'The Hollow Choir', slug: 'the-hollow-choir' },
  { id: 'artist_rowan_vale', name: 'Rowan Vale', slug: 'rowan-vale' },
  { id: 'artist_tess_park', name: 'Tess Park', slug: 'tess-park' },
  { id: 'artist_signal_bloom', name: 'Signal Bloom', slug: 'signal-bloom' },
];

export const seedCategories: Category[] = [
  { id: 'cat_pop', name: 'Pop', slug: 'pop' },
  { id: 'cat_rock', name: 'Rock', slug: 'rock' },
  { id: 'cat_hip_hop', name: 'Hip Hop', slug: 'hip-hop' },
  { id: 'cat_electronic', name: 'Electronic', slug: 'electronic' },
  { id: 'cat_rnb', name: 'R&B', slug: 'r-and-b' },
  { id: 'cat_jazz', name: 'Jazz', slug: 'jazz' },
  { id: 'cat_classical', name: 'Classical', slug: 'classical' },
  { id: 'cat_latin', name: 'Latin', slug: 'latin' },
  { id: 'cat_indie', name: 'Indie', slug: 'indie' },
];

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

/**
 * Demo playback uses Blender Open Movie clips (CC-licensed, embeddable).
 * They exist so the YouTube fragment player can be tested without copyrighted audio.
 */
const CLIP = {
  bunny: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
  sintel: 'https://www.youtube.com/watch?v=eRsGyueVLvQ',
  tears: 'https://www.youtube.com/watch?v=R6MlUcmOul8',
  elephants: 'https://www.youtube.com/watch?v=aFUzUd1KkcI',
} as const;

const seedSongInputs: SeedSongInput[] = [
  {
    id: 'song_neon_harbor',
    slug: 'neon-harbor',
    title: 'Neon Harbor',
    lyrics:
      'The tide keeps the city awake in pink glass\nEvery window a lantern I cannot pass\nYou said wait by the water where the trams forget\nI am still counting boats that have not come yet',
    youtubeUrl: CLIP.bunny,
    youtubeStartSeconds: 12,
    youtubeEndSeconds: 27,
    durationSeconds: 214,
    demoClip: true,
    artistIds: ['artist_marina_vale'],
    categoryIds: ['cat_electronic', 'cat_pop'],
  },
  {
    id: 'song_copper_sky',
    slug: 'copper-sky',
    title: 'Copper Sky',
    lyrics:
      'We drove until the radio turned to dust\nA copper sky insisting it could still be dusk\nYour jacket on the seat like a borrowed year\nI kept the quiet because you were near',
    youtubeUrl: CLIP.sintel,
    youtubeStartSeconds: 40,
    youtubeEndSeconds: 55,
    durationSeconds: 198,
    demoClip: true,
    artistIds: ['artist_wirebirds'],
    categoryIds: ['cat_indie', 'cat_rock'],
  },
  {
    id: 'song_last_train_to_echo',
    slug: 'last-train-to-echo',
    title: 'Last Train to Echo',
    lyrics:
      'Platform light on your collar, almost gold\nThe last train writes our names and then goes cold\nIf Echo is a town then I have lived there twice\nonce in your mouth, once in the price',
    youtubeUrl: CLIP.tears,
    youtubeStartSeconds: 20,
    youtubeEndSeconds: 35,
    durationSeconds: 241,
    demoClip: true,
    artistIds: ['artist_solange_cruz', 'artist_rio_north'],
    categoryIds: ['cat_latin', 'cat_rnb'],
  },
  {
    id: 'song_glass_cathedral',
    slug: 'glass-cathedral',
    title: 'Glass Cathedral',
    lyrics:
      'A room of windows learning how to kneel\nDust in the organ, a patient wheel\nI hum the interval you left in the air\nand the glass keeps answering, unaware',
    youtubeUrl: null,
    youtubeStartSeconds: 0,
    youtubeEndSeconds: null,
    durationSeconds: 312,
    demoClip: false,
    artistIds: ['artist_amos_wren'],
    categoryIds: ['cat_classical', 'cat_indie'],
  },
  {
    id: 'song_static_prayer',
    slug: 'static-prayer',
    title: 'Static Prayer',
    lyrics:
      'I fold a prayer into the noise floor\nAsk the night for one frequency more\nIf you hear me through the ruined wire\nkeep the beat honest, keep the room on fire',
    youtubeUrl: CLIP.elephants,
    youtubeStartSeconds: 8,
    youtubeEndSeconds: 23,
    durationSeconds: 176,
    demoClip: true,
    artistIds: ['artist_kite_club'],
    categoryIds: ['cat_electronic', 'cat_hip_hop'],
  },
  {
    id: 'song_velvet_frequency',
    slug: 'velvet-frequency',
    title: 'Velvet Frequency',
    lyrics:
      'Low light, slower than a secret should be\nYou tune my name until it fits the key\nVelvet in the speaker, honey in the delay\nStay until the morning takes the night away',
    youtubeUrl: CLIP.bunny,
    youtubeStartSeconds: 60,
    youtubeEndSeconds: 75,
    durationSeconds: 223,
    demoClip: true,
    artistIds: ['artist_nova_quinn'],
    categoryIds: ['cat_rnb', 'cat_pop'],
  },
  {
    id: 'song_paper_moons',
    slug: 'paper-moons',
    title: 'Paper Moons',
    lyrics:
      'We hung paper moons above a rented floor\nEach one a promise we could not afford\nThe bass walked home without asking the drum\nand I learned your laugh in a language of hush',
    youtubeUrl: CLIP.sintel,
    youtubeStartSeconds: 90,
    youtubeEndSeconds: 105,
    durationSeconds: 267,
    demoClip: true,
    artistIds: ['artist_ellis_nightshade'],
    categoryIds: ['cat_jazz', 'cat_indie'],
  },
  {
    id: 'song_afterglow_protocol',
    slug: 'afterglow-protocol',
    title: 'Afterglow Protocol',
    lyrics:
      'Run the afterglow protocol again\nMap the heat that lingers under skin\nIf the city reboots we will still be here\nglowing like a fault the dark holds dear',
    youtubeUrl: CLIP.tears,
    youtubeStartSeconds: 70,
    youtubeEndSeconds: 85,
    durationSeconds: 189,
    demoClip: true,
    artistIds: ['artist_hexa'],
    categoryIds: ['cat_electronic'],
  },
  {
    id: 'song_river_in_reverse',
    slug: 'river-in-reverse',
    title: 'River in Reverse',
    lyrics:
      'Teach the river to remember uphill\nEvery silver fish a stubborn will\nI left my shoes where the mangrove starts\nand walked back into all of our almosts',
    youtubeUrl: CLIP.elephants,
    youtubeStartSeconds: 40,
    youtubeEndSeconds: 55,
    durationSeconds: 205,
    demoClip: true,
    artistIds: ['artist_camila_duarte'],
    categoryIds: ['cat_latin', 'cat_pop'],
  },
  {
    id: 'song_quiet_machinery',
    slug: 'quiet-machinery',
    title: 'Quiet Machinery',
    lyrics:
      'Listen: the quiet machinery of dusk\nGears of swallows, a hinge of rust\nI keep a lamp for the hour you return\nthough the clock has nothing left to learn',
    youtubeUrl: CLIP.bunny,
    youtubeStartSeconds: 110,
    youtubeEndSeconds: 125,
    durationSeconds: 254,
    demoClip: true,
    artistIds: ['artist_northroom'],
    categoryIds: ['cat_jazz', 'cat_electronic'],
  },
  {
    id: 'song_red_thread',
    slug: 'red-thread',
    title: 'Red Thread',
    lyrics:
      'A red thread through the winter coat\nYou sewed it there so I would know\nIf I unravel, follow the stitch\nit leads to the kitchen, the late-night pitch',
    youtubeUrl: CLIP.sintel,
    youtubeStartSeconds: 15,
    youtubeEndSeconds: 30,
    durationSeconds: 187,
    demoClip: true,
    artistIds: ['artist_juniper_low'],
    categoryIds: ['cat_indie', 'cat_pop'],
  },
  {
    id: 'song_midnight_arithmetic',
    slug: 'midnight-arithmetic',
    title: 'Midnight Arithmetic',
    lyrics:
      'Count the blocks between your door and mine\nMidnight arithmetic, a crooked line\nAdd the sirens, subtract the pride\ndivide the night until we both decide',
    youtubeUrl: CLIP.tears,
    youtubeStartSeconds: 100,
    youtubeEndSeconds: 115,
    durationSeconds: 168,
    demoClip: true,
    artistIds: ['artist_dj_paloma'],
    categoryIds: ['cat_hip_hop', 'cat_electronic'],
  },
  {
    id: 'song_ivory_weather',
    slug: 'ivory-weather',
    title: 'Ivory Weather',
    lyrics:
      'Ivory weather over the rehearsal hall\nA single note refuses to fall\nWe hold it like a bird that trusts the palm\nthen let it go, and call that calm',
    youtubeUrl: null,
    youtubeStartSeconds: 0,
    youtubeEndSeconds: null,
    durationSeconds: 298,
    demoClip: false,
    artistIds: ['artist_hollow_choir'],
    categoryIds: ['cat_classical', 'cat_jazz'],
  },
  {
    id: 'song_soft_collision',
    slug: 'soft-collision',
    title: 'Soft Collision',
    lyrics:
      'Two orbits grazing in a borrowed car\nSoft collision, nothing left to scar\nYour shoulder finds the sentence I reserved\nand every traffic light we pass is earned',
    youtubeUrl: CLIP.elephants,
    youtubeStartSeconds: 70,
    youtubeEndSeconds: 85,
    durationSeconds: 216,
    demoClip: true,
    artistIds: ['artist_rowan_vale', 'artist_tess_park'],
    categoryIds: ['cat_pop', 'cat_rnb'],
  },
  {
    id: 'song_abandoned_frequencies',
    slug: 'abandoned-frequencies',
    title: 'Abandoned Frequencies',
    lyrics:
      'We found a station no one claims at night\nAbandoned frequencies, a private light\nYour hand on the dial like a dare, like a hymn\nStay on this number, do not let it dim',
    youtubeUrl: CLIP.bunny,
    youtubeStartSeconds: 150,
    youtubeEndSeconds: 165,
    durationSeconds: 233,
    demoClip: true,
    artistIds: ['artist_signal_bloom'],
    categoryIds: ['cat_electronic', 'cat_rock'],
  },
  {
    id: 'song_golden_fault_line',
    slug: 'golden-fault-line',
    title: 'Golden Fault Line',
    lyrics:
      'There is a golden fault line under this town\nIt hums when we are too proud to come down\nMeet me where the pavement forgets its name\nwe can be the tremor and the calm the same',
    youtubeUrl: CLIP.sintel,
    youtubeStartSeconds: 120,
    youtubeEndSeconds: 135,
    durationSeconds: 221,
    demoClip: true,
    artistIds: ['artist_marina_vale', 'artist_wirebirds'],
    categoryIds: ['cat_rock', 'cat_indie'],
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

export const featuredCategorySlug = 'electronic';
