# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Firefly is an Astro-based blog theme with rich features including multiple wallpaper modes, i18n, comment systems, sidebar widgets, and SPA-like page transitions via Swup. The codebase is primarily Chinese-commented.

## Commands

- **Dev server:** `pnpm dev`
- **Build:** `pnpm build` (runs icon generation, Astro build, then Pagefind indexing)
- **Preview production build:** `pnpm preview`
- **Type check:** `pnpm check` (Astro check) or `pnpm type-check` (tsc)
- **Lint:** `pnpm lint` (Biome check with auto-fix)
- **Format:** `pnpm format` (Biome format with auto-write)
- **Create new post:** `pnpm new-post`
- **Package manager:** pnpm only (enforced via preinstall hook). Requires Node >= 22, pnpm >= 9.

## Architecture

### Layout System

Two layouts form the page shell:
- `src/layouts/Layout.astro` — Root HTML document. Handles theme initialization (light/dark/system), wallpaper mode setup, Swup page transition hooks, scroll behavior, and CSS variable injection. All of this runs as inline `<script>` to avoid FOUC.
- `src/layouts/MainGridLayout.astro` — Wraps Layout. Implements the responsive grid (1-3 columns), banner/overlay wallpaper rendering, sidebar placement (left/both/mobile-bottom), and navbar. This is the layout used by all pages.

### Configuration System

All site customization lives in `src/config/` as TypeScript files, re-exported through `src/config/index.ts`. Key configs:
- `siteConfig.ts` — Core site settings (title, URL, theme, pagination, analytics, page toggles)
- `sidebarConfig.ts` — Sidebar layout: position (left/both), widget list with enable/position/visibility per component
- `backgroundWallpaper.ts` — Three wallpaper modes: `banner`, `overlay`, `none` (switchable at runtime)
- `navBarConfig.ts` — Navigation links using presets from `src/constants/link-presets.ts`
- `commentConfig.ts` — Comment provider selection (Twikoo, Waline, Giscus, Disqus, Artalk)

Config types are defined in `src/types/config.ts`.

### Content Collections

Defined in `src/content.config.ts` using Astro's content collections with glob loader:
- **posts** (`src/content/posts/`) — Blog posts (md/mdx). Frontmatter schema: `title`, `published` (date), `updated`, `draft`, `description`, `image`, `tags`, `category`, `lang`, `pinned`, `author`, `sourceLink`, `licenseName`, `licenseUrl`, `comment`.
- **spec** (`src/content/spec/`) — Special pages: `about.md`, `friends.md`, `guestbook.md`.

### Pages

`src/pages/` uses Astro file-based routing with `trailingSlash: "always"`:
- `[...page].astro` — Home/paginated post list
- `posts/[...slug].astro` — Individual post pages
- Static pages: `about`, `archive`, `friends`, `search`, `sponsor`, `guestbook`, `bangumi`
- `rss.astro` — RSS feed generation

### Component Organization

`src/components/` is organized by function:
- `layout/` — Structural: Navbar, SideBar, PostCard, PostPage, Footer
- `widget/` — Sidebar widgets: Profile, Calendar, Categories, Tags, SiteStats, Music, SidebarTOC, Announcement, Advertisement
- `controls/` — Interactive UI: DisplaySettings, Search, FloatingTOC, BackToTop (Svelte for client interactivity)
- `features/` — Optional features: SakuraEffect, MusicPlayer, Live2DWidget, SpineModel, TypewriterText, OverlayWallpaper, FancyboxManager
- `comment/` — Comment system integrations (each provider is a separate component)
- `common/` — Shared: Pagination, ImageWrapper, Markdown, WidgetLayout
- `analytics/` — Google Analytics, Microsoft Clarity

Interactive components use **Svelte** (`.svelte` files in controls/, misc/, pages/). Static components use **Astro** (`.astro`).

### Path Aliases

Defined in `tsconfig.json`:
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@assets/*` → `src/assets/*`
- `@constants/*` → `src/constants/*`
- `@utils/*` → `src/utils/*`
- `@i18n/*` → `src/i18n/*`
- `@layouts/*` → `src/layouts/*`

### i18n

`src/i18n/` supports: `en`, `zh_CN`, `zh_TW`, `ja`, `ru`. Language is set via `SITE_LANG` in `siteConfig.ts`. The `i18n()` function falls back to Chinese then English if a key is missing.

### Markdown Pipeline

Custom remark/rehype plugins in `src/plugins/`:
- `remark-reading-time.mjs` — Reading time calculation
- `remark-excerpt.js` — Post excerpt extraction
- `remark-mermaid.js` / `rehype-mermaid.mjs` — Mermaid diagram support
- `remark-directive-rehype.js` — Custom directive processing
- `rehype-figure.mjs` — Figure/caption wrapping
- `rehype-email-protection.mjs` — Email obfuscation (base64)
- `rehype-component-github-card.mjs` — GitHub card embeds

### Styling

- **Tailwind CSS 4** via Vite plugin (not PostCSS integration)
- **Stylus** for `variables.styl` and `markdown-extend.styl`
- Main entry: `src/styles/main.css`
- Theme colors use oklch with a configurable `--hue` CSS variable

### Key Utilities

`src/utils/`:
- `content-utils.ts` — Post sorting, filtering, tag/category extraction
- `url-utils.ts` — URL path helpers with base URL support
- `setting-utils.ts` — Runtime theme/wallpaper mode management
- `responsive-utils.ts` — Sidebar grid class generation
- `layout-utils.ts` — Background image selection, home page detection

### Swup Page Transitions

The site uses `@swup/astro` for SPA-like navigation. Three containers are swapped: `#swup-container`, `#right-sidebar-dynamic`, `#floating-toc-wrapper`. Swup hooks in `Layout.astro` handle banner height changes, navbar visibility, TOC reinitialization, and sidebar updates during transitions.

## Code Style

- **Biome** for linting and formatting (not ESLint/Prettier)
- Indent style: tabs
- Quote style: double quotes
- `useConst`, `useImportType`, `noUnusedVariables`, `noUnusedImports` rules are disabled for `.svelte`, `.astro`, `.vue` files
- `src/constants/icons.ts` is excluded from Biome (auto-generated)
