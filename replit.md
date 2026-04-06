# NantonFilm Workspace

## Overview

NantonFilm — streaming website for anime, film, series & TV shows. Built on a pnpm workspace monorepo. The frontend is a React+Vite app; the backend is an Express API server that proxies all content from an external API with in-memory TTL caching.

## Architecture

- **Frontend** (`artifacts/nonton-film`): React + Vite + Tailwind CSS v4, dark Netflix-style theme
- **API Server** (`artifacts/api-server`): Express 5, proxies `https://www.sankavollerei.com/anime/winbu`, in-memory TTL caching
- **API Spec** (`lib/api-spec`): OpenAPI YAML → Orval codegen → React Query hooks

## External API

- Base URL: `https://www.sankavollerei.com/anime/winbu`
- All requests include `Referer: winbu.net` header
- Image proxy: `/api/img?url=...` (served via Express, cached 10 min)

## Caching TTL

- Home: 5 min
- Genres: 1 hr
- Lists (film/anime/series/etc): 3 min
- Detail pages: 10 min
- Episodes: 5 min
- Search: 2 min

## Pages

Home, Film, Anime, Series, TvShow, Genre, GenreDetail, Schedule, Search, AnimeDetail, FilmDetail, SeriesDetail, Watch

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Wouter + React Query + Tailwind CSS v4 + shadcn/ui
- **HTTP client**: axios (api-server)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
