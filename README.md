# Lyric-Guess

Lyric-Guess is a web game for recognizing songs from a lyric fragment. A round fills the screen with words, a countdown runs, and the answer arrives with artist, genre, and a playable clip.

It is built as a static Astro site with an offline-first SQLite catalog in the browser. Demo lyrics are original fiction. Playback uses official YouTube embeds and public-domain Blender Open Movie clips so fragment start/end times can be tested without copyrighted audio.

## Stack

- Astro 7 and Vite
- TypeScript (strict)
- Node.js 24 LTS
- SQLite compiled to WebAssembly (`sql.js`)
- OPFS persistence with IndexedDB fallback
- Vitest, ESLint, Prettier
- GitHub Pages

## Architecture

The UI never talks to SQLite. It talks to `SongRepository`, `ArtistRepository`, and `CategoryRepository`.

```
UI / GameEngine
      ↓
Catalog (repository interfaces)
      ↓
Sqlite*Repository   Memory*Repository   Api*Repository (future)
```

- **Memory adapters** prerender pages at build time and power unit tests.
- **SQLite adapters** run in the visitor’s browser for search, filters, and the game.
- **API adapters** can replace SQLite later without rewriting pages or the game engine.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the decisions behind persistence, YouTube, and GitHub Pages.

## Installation

Requires **Node.js 24**.

```bash
nvm use
npm install
```

Copy environment defaults if you need to override site URL or base path:

```bash
cp .env.example .env
```

## Local development

```bash
npm run dev
```

The app is configured as a GitHub Pages project site, so the local URL is:

```text
http://localhost:4321/lyric-guess/
```

To serve at `/` instead, set `PUBLIC_BASE_PATH=/` in `.env`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Preview the production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Database

Schema lives in `src/lib/database/schema.ts`:

- `songs`
- `artists`
- `categories`
- `song_artists`
- `song_categories`
- `meta` (schema and seed versions)

A song may have several artists and several categories. Queries use bound parameters. Search is SQL `LIKE` with escaped wildcards (title, artist name, category name), not a JavaScript scan of every row.

## SQLite / WASM

The browser loads `sql.js` (SQLite compiled to WASM) and opens an in-memory database. Official `@sqlite.org/sqlite-wasm` OPFS VFS needs COOP/COEP headers, which GitHub Pages cannot send. `sql.js` keeps the full SQL engine without Cross-Origin Isolation.

## Persistence

Catalog bytes are exported from SQLite and stored with:

1. **Origin Private File System** when the browser allows it
2. **IndexedDB** otherwise
3. Memory for the session if both fail

`localStorage` only stores the timer preference (`lyric-guess.preferences`). It does not store songs.

On first visit the client creates tables and upserts the demo seed. If `SEED_VERSION` changes, seed rows are upserted again.

## How to add songs

1. Edit `src/data/seed-catalog.ts`.
2. Use original lyrics only. Do not paste copyrighted lyrics.
3. Give the song a stable `id` and `slug`.
4. Attach existing or new artists and categories.
5. For YouTube, store a real `https://www.youtube.com/watch?v=...` URL. The player validates host and video id, then embeds with `start` and `end` seconds.
6. Bump `SEED_VERSION` so existing browsers refresh the catalog.
7. Rebuild. Static song and category pages are generated from the same seed.

## YouTube

Playback goes through `MusicPlayer`. `YouTubePlayer` is the first implementation:

- Allowlisted hosts only
- Official iframe embed (`youtube-nocookie.com`) with `start` and `end`
- Watch-URL fallback (`t=`) when embed is unavailable
- No downloads, no scraping, no unofficial clients

A later audio source implements the same `play` / `stop` interface.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds with Node 24 and deploys via `withastro/action`.

Repository settings:

1. **Settings → Pages → Source:** GitHub Actions
2. Keep `PUBLIC_SITE_URL=https://hstev.github.io` and `PUBLIC_BASE_PATH=/lyric-guess/` unless you use a custom domain
3. After the first successful workflow, the site is at `https://hstev.github.io/lyric-guess/`

For a custom domain, set `PUBLIC_SITE_URL` to that origin, set `PUBLIC_BASE_PATH=/`, and add `public/CNAME`.

## Migrating from SQLite to PostgreSQL

Do not rewrite the game or the pages. They already depend on repository interfaces.

1. Expose the catalog behind an HTTP API backed by PostgreSQL.
2. Add `ApiSongRepository`, `ApiArtistRepository`, and `ApiCategoryRepository` that implement the existing interfaces.
3. Switch the factory in `src/lib/repositories/create-catalog.ts` from `Sqlite*Repository` to the API implementations.
4. Keep `Memory*Repository` for tests, or point tests at the API with fixtures.

The game engine only calls `SongRepository`. It does not know whether a row came from WASM, memory, or Postgres.

Static Astro pages currently prerender from the seed via `getStaticCatalog()`. If the catalog becomes dynamic, those routes can move to SSR or a build-time fetch of the same API without changing presentational components.

## License

Demo text and original lyrics in this repository are provided for the Lyric-Guess demo. Blender Open Movie links are used only as verifiable public playback sources.
