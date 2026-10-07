# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static tech blog (Business Central / Power BI, content in Spanish) built with Eleventy 3 + Nunjucks + Tailwind v3, deployed to GitHub Pages by GitHub Actions. There is no test suite or linter; verification is `npm run build` succeeding plus a manual look at the site. `README.md` documents authoring and front matter in detail. Specs/plans that produced the project live in `docs/superpowers/`; `.superpowers/` is git-ignored scratch.

## Commands

- `run.bat` (Windows) installs deps if missing, runs `npm run dev` and opens the browser.
- `npm run dev` — Eleventy `--serve --incremental` plus Tailwind `--watch` in parallel. Served at **http://localhost:8080/mpachecoBlog/** (not the root, because of `pathPrefix`).
- `npm run build` — cleans `_site/`, runs Eleventy, then compiles Tailwind. Order matters: Tailwind must run **after** Eleventy.
- `npm run clean` — removes `_site/` (Node-based, Windows-safe; do not use `rm -rf` in scripts).

## Architecture

- **Input `src/` → output `_site/`**, all configuration in `.eleventy.js` (filters, collections, Markdown pipeline, drafts handling). Reusable helpers (`slugify`, `toPlainText`, `absoluteUrl`) live at the top of that file and are shared by the search index, RSS feed and taxonomy pages.
- **Posts**: `src/posts/YYYY-MM-DD-slug/index.md` with images in `images/` next to it (passthrough-copied, referenced as `./images/x.png`). `src/posts/posts.json` gives every post its layout (`post-layout.html`). The `posts` collection is `src/posts/**/index.md` sorted by date.
- **Taxonomies**: `categories`/`tags` collections are built from front matter; `category-page.html`/`tag-page.html` paginate over them. Names that slugify to the same slug throw on purpose. Tags named `posts`, `categories`, `tags` or `all` collide with site routes.
- **Drafts/future posts**: a `drafts` preprocessor excludes `draft: true` and future-dated posts only when `ELEVENTY_RUN_MODE === "build"`; `npm run dev` still previews them. An `eleventy.after` hook removes only the orphaned `images/` folder of excluded posts.
- **Search**: `search-index.njk` emits `/search-index.json` via the `searchIndexJSON` filter; `src/js/search.js` builds a Lunr index client-side. Lunr is copied from `node_modules` to `js/lunr.min.js` (no CDN).
- **Feed**: `feed.njk` → `/feed.xml`, using `feedContent`/`absoluteUrl` filters to make URLs absolute.
- **Styling**: Tailwind source is `src/styles/main.css` (deliberately outside the `css` passthrough) compiled to `_site/css/main.css`. Dark mode is class-based; an inline head script in `layout.html` prevents the flash and `src/js/theme-toggle.js` persists only explicit user choices.
- **Markdown quirks**: body `# h1` is demoted to `h2` (the title is the only h1); TOC (h2/h3) is generated automatically, no `[[toc]]` needed; tables are wrapped for horizontal scroll.

## Gotchas

- `pathPrefix: "/mpachecoBlog/"` (in `.eleventy.js`) and `url` in `src/_data/site.json` must match the GitHub repo name. **Every internal link in templates must use the `| url` filter** or it breaks on Pages.
- CI (`.github/workflows/build-deploy.yml`) triggers on `main` only (the local branch is `master`) and uses the Pages artifact flow; Pages Source must be set to "GitHub Actions".
- Unknown highlight languages (e.g. `dax`) render unhighlighted and print a build warning; this is expected.
- The ignore file must be named `.eleventyignore` (11ty ignores `.eleventy.ignore`).
