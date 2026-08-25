# Lyric-Guess Architecture

This document records the decisions behind the first production-ready version of Lyric-Guess. The product is a static, offline-first web game: guess a song from an original lyric fragment, then reveal the answer and play a timed clip.

## Current repository state

The repository started as an empty Git project (`README.md` only). There was no existing Astro, Vite, or application code to preserve.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Runtime | Node.js 24 LTS | Required by the product brief; current Active LTS |
| Framework | Astro 7 | Static output for GitHub Pages, islands only where JS is needed |
| Bundler | Vite (via Astro) | Native to Astro 7 |
| Language | TypeScript, `strict` | Domain models without `any` |
| Database | `sql.js` (SQLite compiled to WASM) | Full SQL in the browser without Cross-Origin Isolation |
| Tests | Vitest | Same toolchain as Vite |
| Deploy | GitHub Pages + Actions | Official Astro action, Node 24 |

No React/Vue/Svelte. Interactive surfaces (game, search, player) are small TypeScript islands that mount into the DOM.

## Why `sql.js` instead of official OPFS VFS

The official `@sqlite.org/sqlite-wasm` OPFS backend needs `SharedArrayBuffer`, which in turn needs:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

GitHub Pages cannot set those headers. The SQLite project documents that the worker/OPFS build cannot be hosted there.

`sql.js` is still SQLite compiled to WebAssembly. It runs without COOP/COEP, works on GitHub Pages, and is usable from Node for repository tests.

The npm `browser` entry (`sql-wasm-browser.js`) is UMD/CJS, not ESM. Vite would otherwise import it as a native module without a `default` export. The client loads that file explicitly and a small Vite plugin adds `export default initSqlJs` so the browser and Node (plain `sql.js`) both work.

Persistence is a separate adapter, not a SQLite VFS:

1. **OPFS** — write the exported database bytes with `navigator.storage.getDirectory()` when available
2. **IndexedDB** — fallback for browsers without OPFS
3. **Memory** — last resort; catalog still works for the session

`localStorage` is reserved for tiny UI preferences (timer duration). It never stores the song catalog.

If the app later moves to a host that can send COOP/COEP, the database client can switch to `@sqlite.org/sqlite-wasm` + OPFS VFS without touching UI or repository interfaces.

## Domain first, storage second

UI and game logic depend on repository interfaces, never on SQLite APIs.

```
Song / Artist / Category / Game / Player
        ▲
  CatalogService
        ▲
 SongRepository | ArtistRepository | CategoryRepository
        ▲
 SQLite*  or  Memory*  or  (future) Api*
```

| Implementation | Where it runs | Role |
| --- | --- | --- |
| `Memory*Repository` | Astro build / tests | SSG, unit tests, source of prerendered pages |
| `Sqlite*Repository` | Browser | Runtime search, game selection, offline catalog |
| `Api*Repository` | Future | PostgreSQL behind HTTP; drop-in replacement |

Seed data (`src/data/seed-catalog.ts`) is the demo catalog source of truth. The static site prerenders from it. The browser opens SQLite, applies schema, and upserts the same seed when the stored seed version is stale.

## Layers

```
src/
  types/                 Domain models
  data/                  Demo catalog (original, non-copyright lyrics)
  lib/
    database/            WASM client, schema, OPFS/IDB persistence
    repositories/        Interfaces + SQLite + memory adapters
    services/            Catalog facade, preferences
    player/              MusicPlayer + YouTube implementation
  features/
    game/                Engine, timer, background, DOM island
    search/              Search island
  components/            Presentational Astro pieces
  layouts/
  pages/                 File-based routes
  styles/                Design tokens + global CSS
  utils/
```

### Game engine

`GameEngine` owns round flow: pick a song, run the countdown, reveal, next. It is framework-agnostic and unit-tested.

`CountdownTimer` measures remaining time from timestamps (`Date.now()` / injectable clock), not from interval ticks. Hidden tabs stop the loop; on return the engine recomputes against the original start time so drift and background throttling do not freeze or inflate the countdown.

### Player

```ts
interface MusicPlayer {
  play(song: Song): Promise<void>
  stop(): Promise<void>
}
```

`YouTubePlayer` is the first implementation. It:

- Accepts only `youtube.com` / `youtu.be` / `youtube-nocookie.com` URLs
- Extracts an 11-character video id
- Uses the official iframe embed with `start` and `end` (seconds from video start)
- Does not scrape, download, or rewrite audio
- Requires a user gesture before loading the iframe (autoplay policies)

A later Spotify/AudioFile player would implement the same interface.

YouTube watch URLs do not support an end time. Embeds do (`?start=&end=`). The player therefore embeds for in-app fragments and still exposes an official “Open on YouTube” link (`t=` start time).

Demo songs use **verifiable public-domain Blender Open Movie** clips so fragment playback can be tested without inventing fake video ids or embedding copyrighted music. Lyrics and titles are original fiction. The UI labels playback as a demo clip when the catalog marks it as such.

## Rendering strategy

| Route | JS | Data |
| --- | --- | --- |
| `/` | None beyond font CSS | Seed at build |
| `/play` | Game island | SQLite in the browser |
| `/categories`, `/categories/:slug` | Minimal | Seed at build |
| `/search` | Search island | SQLite FTS/LIKE |
| `/songs/:slug`, `/artists/:slug` | None | Seed at build |

Astro emits a static site. GitHub Pages serves it. The database is created in the visitor’s browser on first visit.

## Design system

Tokens live in `src/styles/tokens.css` as CSS custom properties (color, type, space, radius, shadow, z-index, motion, breakpoints). Components consume tokens; they do not invent one-off values.

Identity: late-night listening room. Ink backgrounds, paper-colored type, acid chartreuse as a single accent. Fraunces for lyrics and display, Outfit for UI. Motion is short and sequential (background → lyrics → timer). `prefers-reduced-motion` collapses decorative movement.

## Security

- Lyrics and titles render as text, never as HTML
- SQL uses bound parameters
- YouTube URLs are allowlisted and validated before embed
- No private API keys in client code
- No secrets in the repository

## GitHub Pages

- `site`: `https://hstev.github.io`
- `base`: `/lyric-guess/`
- Workflow: `.github/workflows/deploy.yml` with Node 24 and `withastro/action`

Local development uses the same base path so asset and route behavior matches production (`http://localhost:4321/lyric-guess/`). Override with `PUBLIC_BASE_PATH=/` if you want the site at `/`.

## Replacing SQLite with PostgreSQL later

1. Keep `SongRepository` / `ArtistRepository` / `CategoryRepository` unchanged
2. Add `ApiSongRepository` that calls the new HTTP API
3. Swap the factory in `create-browser-catalog.ts` (and SSG, if pages become SSR)
4. Leave `features/game`, pages, and components untouched

The game engine already receives a `SongRepository`. It does not know whether rows came from WASM, memory, or Postgres.
