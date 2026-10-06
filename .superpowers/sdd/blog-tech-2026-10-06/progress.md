# SDD ledger — plan: docs/superpowers/plans/2026-10-06-blog-tech-implementation.md

## Pre-flight scan
- Global Constraints: Node 18+, build <60s, no external APIs during build
- Spec: docs/superpowers/specs/2026-10-06-blog-tech-design.md (reachable)
- 15 tasks, sequential but mostly independent implementations
- No conflicts found in pre-flight scan

## Task Progress

### Task 1: Initialize npm + dependencies ✅ COMPLETE

**Implementer:** Created package.json, .gitignore; npm install (220 packages); Eleventy 3.1.6  
**Review:** PASS — all files match spec exactly  
**Fixes Applied:** Cross-platform clean script (Node.js fs.rmSync instead of rm -rf)  
**Committed:** [4dbd418] feat: initialize npm project with 11ty and dependencies  
**Findings:** 15 npm vulnerabilities (indirect, build-time only) — safe to ignore  
**Blocker for Task 2:** None  
**Next:** Task 2 (directory structure)

### Task 2: Create Directory Structure and Data Files ✅ COMPLETE

**Implementer:** Created 6 dirs (src/{_includes,_data,css,js,posts}, .github/workflows); 4 config files  
**Review:** PASS — all files match spec exactly, JSON valid, directories exist  
**Fixes Applied:** Renamed .eleventy.ignore → .eleventyignore (11ty requirement; plan had wrong name)  
**Committed:** [bc31aad] feat: create directory structure and data files; [0ff017c] fix: rename ignore file  
**Findings:** Plan used wrong filename (.eleventy.ignore vs .eleventyignore); now fixed  
**Blocker for Task 3:** None  
**Next:** Task 3 (.eleventy.js configuration)

### Task 3: Configure 11ty ✅ COMPLETE
**Implementer:** .eleventy.js + luxon; changed ariaInsertAfter -> linkAfterHeader (plan API did not exist in anchor v8) [77f1e5b]
**Review:** FOUND critical: TOC markerPattern string crashes any .md build. Fixed with RegExp, verified with temp post (unknown code lang = warning only) [a36edb6]
**Carry-forward notes for later tasks:**
- Task 4: Tailwind output _site/css/main.css collides with passthrough of src/css (raw @tailwind source gets copied; ordering). Decide: build tailwind AFTER eleventy, or exclude main.css from passthrough.
- anchor is sibling of heading (h2 + .header-anchor) for styling.
- Eleventy auto tag collections can clash with custom "posts/categories/tags" names (avoid those tags).
- .eleventyignore name corrected in Task 2; plan elsewhere says .eleventy.ignore.
- .superpowers/ untracked; do not git add -A.

### Task 4: Tailwind CSS ✅ COMPLETE
Implementer [9757978]; review found dev-mode races (passthrough overwrote compiled CSS). Fixed: Tailwind source now src/styles/main.css (not passed through), dev runs eleventy first. Output _site/css/main.css compiled. Build ~2.4s.
Carry-forward: CSS source lives in src/styles/ (NOT src/css); no src/css dir exists now. Minor: caniuse-lite outdated warning.

### Task 4: Tailwind CSS ✅ COMPLETE
Implementer [9757978]; review found dev-mode races (passthrough overwrote compiled CSS). Fixed: Tailwind source now src/styles/main.css (not passed through), dev runs eleventy first. Output _site/css/main.css compiled. Build ~2.4s.
Carry-forward: CSS source lives in src/styles/ (NOT src/css); no src/css dir exists now.

### Task 5: Base layouts ✅ COMPLETE
Implementer [b6df52a] exact plan content. Review fixes [cf80952]: inline head script prevents dark flash (localStorage key "theme"); pathPrefix "/blog-repo/" in .eleventy.js + `| url` on all internal links (site is a GitHub project page); header h1 -> div; toggle aria-label.
**STANDING RULES for tasks 6-15:** (1) every internal href/src in templates must use `{{ "/path/" | url }}` (or `{{ x.url | url }}`); JS that builds links (search.js) must account for the /blog-repo/ prefix. (2) CSS source is src/styles/. (3) Do not tag posts with "posts"/"categories"/"tags". (4) Heading ids from markdown-it-anchor render as `<h2 id="x" tabindex="-1">` (extra attrs) - regexes must tolerate. (5) Post pages need layout via directory data file (plan omits it).
Deferred polish (final review): mobile nav hidden <md with no menu; og:url always site.url; theme icons initial state (Task 10); duplicate h1 if post body starts with "# ".
### Task 6: Post layout + TOC ✅ COMPLETE
Implementer [36b36f5] (fixed plan defects: posts.json layout, heading regex, | url, IIFE script). Review fix round 1 [c2aa7fe]: accent-safe slugify (NFD), entity-decoded TOC text, author fallback to site.author, body h1 demoted to h2 (core rule demote_h1), aria-label on TOC nav.
Carry-forward: Task 9 must assert slug uniqueness across categories/tags (C# vs C++ => "c"). Deferred: toc script inline->src/js with passive listener; prev/next label wording; no draft/future-date filter; test post "2026-10-06-test-post" has odd heading (entity test) - remove/replace in Task 13/15. Eleventy `slice` filter in Nunjucks splits into groups (NOT take-n): use `head(n)`.
### Task 7: Home page ✅ COMPLETE [c6a70bf]
Tested with 7 posts (5 cards, newest first, /all/ archive added, all links /blog-repo/). Eleventy 3.1.6 has NO built-in `head` filter -> custom `head` filter added in .eleventy.js. Empty-state text present but not rendered-tested with zero posts. Review: coordinator-verified evidence only (implementer ran a real multi-post test); no separate reviewer round (low risk) - final reviewer covers it.
### Task 8: Search ✅ COMPLETE [6ce9681]
Redesigned vs plan: lunr served locally (/js/lunr.min.js passthrough from node_modules, no CDN, only on /search/), index is build-generated /search-index.json (urls prefixed, plain-text content from rawInput), search.js uses idx.query() with prefix wildcard + NFD accent folding, escaped rendering. Headless Node harness covered ~10 query cases. Limits: English stemmer (Spanish plurals match less); fetch-failure path not exercised.
### Task 9: Categories & Tags ✅ COMPLETE [026b8fe]
Files: src/categories.html, tags.html, category-page.html, tag-page.html (paginated, slugified permalinks, real names in titles via eleventyComputed). Slug-collision guard throws at build. Link crawl (242 links): only /feed.xml (Task 11) and /js/theme-toggle.js (Task 10) missing. Zero-posts build verified OK. Tags page titled "Etiquetas". Crawl script lives in the earlier agent's scratchpad (re-create for final verification).
### Task 10: Dark mode ✅ COMPLETE [c5e0380]
theme-toggle.js persists only on explicit click (plan's init-write bug fixed), icons follow `dark` class via CSS, src/styles/hljs.css (github / github-dark tokens, dark scoped) imported in main.css, head script split into two try blocks. Node vm harness 8 cases pass. NOT browser-tested. Polish for final review: light-theme hljs built_in (3.3:1) and keyword (4.3:1) contrast below AA.
### Task 11: RSS ✅ COMPLETE [53e02b0]
src/feed.njk + filters dateRSS, absoluteUrl, feedContent (relative->absolute URL rewrite, CDATA-safe), feedDescription. Validated with fast-xml-parser (scratchpad): newest-first, absolute /blog-repo/ links, dc:creator, atom:self, zero-post feed valid. Link crawl not re-run. Polish: `npm run build` doesn't clean _site (stale files locally; CI unaffected) -> consider `clean` first in build script. IMPORTANT for Task 12/final: local git branch is `master` but plan/workflow target `main` - flag to user (do not rename without asking).
### Task 12: GitHub Actions ✅ COMPLETE [5d16bc2] (not pushed)
Artifact Pages flow (no gh-pages branch): checkout@v4, setup-node@v4 (node 20, npm cache), configure-pages@v5, upload-pages-artifact@v3, deploy-pages@v4; deploy only on push to main; sanity step fails on missing outputs or uncompiled @tailwind; engines node>=18. Clean-clone `npm ci && npm run build` ~19.6s. Node 20 not exercised locally (local is v24).
**USER ACTIONS REQUIRED (report at end):** Settings > Pages > Source = "GitHub Actions" (NOT "Deploy from a branch"); repo must be named `blog-repo` (pathPrefix) or update pathPrefix/site.url; local branch is `master` but workflow triggers on `main` - rename/push to main; replace placeholders (site.json author/email/url/social, "Your Name", GA id); repo public or Pages-capable plan.
### Task 13: Sample posts ✅ COMPLETE [99f82e9] review PASS
3 posts + overview.svg + table wrapper + anchor slugify; scaffold test post removed. Review: link crawl 311 links, 0 broken; image path resolves; one h1/post. Deferred: home and /all/ have 0 h1 (header h1 became div in T5); `dax` unknown to highlight.js (plain, build warning); placeholder authors; README should note build doesn't clean.
### Task 14: 404 page [450bf20] implemented; task review folded into the combined T14+T15 review (range 99f82e9..HEAD)
Prefixed links, excluded from collections/search/feed (byte-identical outputs), dev server serves it under /blog-repo/.
### Task 15: README/.env.example/final verification ✅ COMPLETE [27e7db1]; T14+T15 combined review PASS (no must-fix)
build script now cleans first. Crawl: 19 pages, 282 links, 0 broken. README claims spot-checked (~10) true. User-site switch needs only pathPrefix + site.json url. Deferred: og:url on 404, robots.txt passthrough of nonexistent file, README doesn't call out socialLinks "usuario" placeholders explicitly.
## FINAL REVIEW PHASE: base = initial commit .. HEAD (27e7db1). Residual polish list: home and /all/ have no h1; dax unknown-language warning; hljs light contrast (built_in 3.3, keyword 4.3); mobile nav hidden <md; og:url always site.url; no draft/future-date filter; toc script inline; English stemmer; never browser-tested.
## FINAL: fix dispatch [4877a85]; scoped re-review found data-loss bug in eleventy.after hook (deleted whole dir incl. sibling pages) -> coordinator applied reviewer's verified 1-line fix and re-tested with draft + sibling page [see git log: "draft cleanup hook removes only orphaned images"].
Ruling: fixed the re-review must-fix directly instead of a 2nd fix dispatch (verified by test; cost-if-wrong: low).
Ruling: DEFER nav landmarks unlabeled (2 <nav> without aria-label), missing-date post always published, og:url, robots.txt passthrough, dax warning, hljs light contrast, toc inline script, English stemmer, no browser test.
