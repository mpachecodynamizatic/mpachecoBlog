# Blog Tecnológico con 11ty Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Build a minimal, fast tech blog for Business Central and Power BI content with automatic GitHub Pages deployment, supporting Markdown articles with images, categories, tags, search, RSS, and dark mode.

**Architecture:** 11ty static site generator (Node.js) reads Markdown posts from `src/posts/` (each post = folder with `index.md` + `images/` subfolder), generates static HTML to `_site/`, deployed to GitHub Pages via GitHub Actions on every push to `main` branch. Features implemented as modular 11ty filters, shortcodes, and collections.

**Tech Stack:**
- **11ty (Eleventy):** Static site generator
- **Markdown-it + plugins:** Content parsing (tables, code highlight)
- **Nunjucks:** Templating
- **Tailwind CSS v3:** Styling + dark mode utilities
- **Lunr.js:** Client-side full-text search
- **Node.js 18+:** Runtime

**Spec:** `docs/superpowers/specs/2026-10-06-blog-tech-design.md`

## Global Constraints

- Node.js >= 18.0.0
- Markdown front matter: YAML syntax, required fields = `title`, `date`, `categories`
- Post folder naming: `YYYY-MM-DD-slug-format` (enforced by convention)
- Build time target: < 60 seconds
- GitHub Pages source: `gh-pages` branch (automated)
- All paths in templates: relative or absolute from site root `/`
- No external APIs in build (build must work offline)

## Review Focus

1. **Broken image paths in generated HTML:** Posts reference `./images/file.png` but output is in `_site/posts/SLUG/index.html` — verify relative path resolution works at runtime in browser
2. **Markdown rendering: code block language detection fails:** Test that ` ```javascript ` blocks highlight correctly and ` ```unknown ` doesn't crash
3. **Lunr search index is stale or empty:** Verify index.json is generated during build with all posts; verify in browser console that Lunr loads without errors
4. **Dark mode CSS not applied:** Check that Tailwind's `dark:` classes work with localStorage theme toggle; test both manual toggle and system preference fallback
5. **RSS feed missing recent posts:** Verify `feed.xml` is generated with correct timestamp ordering and all required RSS 2.0 fields (title, link, description, pubDate, category)

---

## File Structure

### Core Configuration
- `.eleventy.js` — Main 11ty config (input/output dirs, filters, shortcodes, collections)
- `.eleventy.ignore` — Files to exclude from build
- `tailwind.config.js` — Tailwind CSS configuration
- `package.json` — NPM dependencies
- `.gitignore` — Standard Node.js ignores

### Source: `src/`
- `src/_includes/` — Reusable Nunjucks templates
  - `layout.html` — Master layout wrapper
  - `header.html` — Header component
  - `footer.html` — Footer component
  - `nav.html` — Navigation component
  - `toc.html` — Table of contents sidebar
  - `post-card.html` — Article preview card
  
- `src/_data/` — Data files (become global in templates)
  - `site.json` — Site metadata (title, author, URL, etc.)
  - `analytics.json` — Analytics configuration
  - `navigation.json` — Navigation links

- `src/css/` — Stylesheets
  - `main.css` — Tailwind imports + custom utilities
  - `dark-mode.css` — Dark mode specific styles (if needed)

- `src/js/` — Client-side JavaScript
  - `search.js` — Lunr search logic + UI
  - `theme-toggle.js` — Dark mode toggle + localStorage
  - `syntax-highlight.js` — Code block highlighting (if not handled by Markdown parser)

- `src/posts/` — Article content (user-created structure)
  - `2026-10-06-slug/index.md` — Article content + front matter
  - `2026-10-06-slug/images/` — Article images

- `src/index.html` — Home page (lists recent posts)
- `src/search.html` — Search results page
- `src/categories.html` — Categories index
- `src/tags.html` — Tags index
- `src/rss.njk` — RSS feed template
- `src/404.html` — 404 page

### CI/CD: `.github/`
- `.github/workflows/build-deploy.yml` — GitHub Actions workflow

### Generated (not committed)
- `_site/` — Output directory (generated, in .gitignore)
- `node_modules/` — Dependencies (in .gitignore)

---

## Task Sequence

### Setup Phase

---

### Task 1: Initialize Project and Install Dependencies

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `node_modules/` (via npm install)

**Interfaces:**
- Produces: Node.js project with 11ty, Tailwind, markdown-it, lunr installed and ready

- [ ] **Step 1: Create package.json with initial dependencies**

Create `package.json`:
```json
{
  "name": "blog-tech-bc-pbi",
  "version": "1.0.0",
  "description": "Tech blog for Business Central and Power BI",
  "main": "index.js",
  "scripts": {
    "build": "eleventy",
    "dev": "eleventy --serve --incremental",
    "clean": "rm -rf _site"
  },
  "keywords": ["blog", "11ty", "business-central", "power-bi"],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "@11ty/eleventy-navigation": "^0.3.5",
    "markdown-it": "^14.0.0",
    "markdown-it-anchor": "^8.6.7",
    "markdown-it-table-of-contents": "^0.6.0",
    "markdown-it-highlightjs": "^4.0.1",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.31",
    "postcss-cli": "^11.0.0",
    "lunr": "^2.3.9",
    "gray-matter": "^4.0.3"
  }
}
```

- [ ] **Step 2: Create .gitignore**

Create `.gitignore`:
```
node_modules/
_site/
.DS_Store
*.log
.env
.env.local
dist/
build/
.cache/
```

- [ ] **Step 3: Install dependencies**

Run: `npm install`

Expected: All packages installed in `node_modules/`, `package-lock.json` created

- [ ] **Step 4: Verify installation**

Run: `npx eleventy --version`

Expected: Output shows version (e.g., "Eleventy v3.0.0")

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "feat: initialize npm project with 11ty and dependencies"
```

---

### Task 2: Create Directory Structure and Placeholder Files

**Files:**
- Create: `src/` directory tree
- Create: `.eleventy.ignore`
- Create: `src/_data/site.json`
- Create: `src/_data/analytics.json`

**Interfaces:**
- Consumes: Working npm project from Task 1
- Produces: Empty but properly organized directory structure ready for config and templates

- [ ] **Step 1: Create directory structure**

Run:
```bash
mkdir -p src/{_includes,_data,css,js,posts}
mkdir -p .github/workflows
```

- [ ] **Step 2: Create .eleventy.ignore**

Create `.eleventy.ignore`:
```
*.draft.md
TODO.md
README.md
```

- [ ] **Step 3: Create src/_data/site.json**

Create `src/_data/site.json`:
```json
{
  "title": "Tech Blog - Business Central & Power BI",
  "description": "Artículos sobre Business Central y Power BI",
  "author": "Your Name",
  "email": "your@email.com",
  "url": "https://usuario.github.io/blog-repo/",
  "language": "es",
  "postsPerPage": 10,
  "recentPostsCount": 5,
  "socialLinks": {
    "github": "https://github.com/usuario",
    "linkedin": "https://linkedin.com/in/usuario"
  }
}
```

- [ ] **Step 4: Create src/_data/analytics.json**

Create `src/_data/analytics.json`:
```json
{
  "googleAnalyticsId": "G-XXXXXXXXXX",
  "enabled": false
}
```

- [ ] **Step 5: Create src/_data/navigation.json**

Create `src/_data/navigation.json`:
```json
{
  "mainNav": [
    {
      "title": "Home",
      "url": "/"
    },
    {
      "title": "Categorías",
      "url": "/categories/"
    },
    {
      "title": "Buscar",
      "url": "/search/"
    }
  ]
}
```

- [ ] **Step 6: Commit**

```bash
git add src/.gitkeep .eleventy.ignore src/_data/
git commit -m "feat: create directory structure and data files"
```

---

### Task 3: Configure 11ty (.eleventy.js)

**Files:**
- Create: `.eleventy.js`
- Modify: `package.json` (add Markdown-it config step)

**Interfaces:**
- Consumes: npm project, directory structure from Tasks 1-2
- Produces: 11ty configured with Markdown parsing, input/output dirs, collections, filters, and watched CSS

- [ ] **Step 1: Create .eleventy.js core config**

Create `.eleventy.js`:
```javascript
const markdown = require("markdown-it");
const markdownAnchor = require("markdown-it-anchor");
const markdownTOC = require("markdown-it-table-of-contents");
const markdownHighlight = require("markdown-it-highlightjs");
const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
  // Watch CSS files
  eleventyConfig.addWatchTarget("src/css/**/*.css");
  
  // Copy CSS, JS, images to output
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/posts/**/images");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  
  // Configure Markdown with plugins
  const md = markdown({
    html: true,
    breaks: true,
    typographer: true
  })
    .use(markdownAnchor, {
      level: 2,
      permalink: markdownAnchor.permalink.ariaInsertAfter(
        '<svg class="icon icon-link" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1 .018-1.042Zm4.908 2.85-2.5 2.5a2.002 2.002 0 0 1-2.83 0 .751.751 0 0 0-1.042.018.751.751 0 0 0 .018 1.042 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l1.25-1.25a.751.751 0 0 0-1.042-1.042l-1.25 1.25a3.5 3.5 0 0 0 4.95 4.95Z"/></svg>'
      )
    })
    .use(markdownTOC, {
      "includeLevel": [2, 3],
      "markerPattern": "^\\[\\[toc\\]\\]"
    })
    .use(markdownHighlight, {
      auto: true,
      code: true
    });
  
  eleventyConfig.setLibrary("md", md);
  
  // Date filter (ISO format)
  eleventyConfig.addFilter("dateISO", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "UTC" }).toISO();
  });
  
  // Date filter (readable format)
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "UTC" })
      .setLocale("es")
      .toFormat("dd 'de' LLLL 'de' yyyy");
  });
  
  // Collections: all posts
  eleventyConfig.addCollection("posts", function(collection) {
    return collection
      .getFilteredByGlob("src/posts/**/index.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });
  
  // Collections: posts by category
  eleventyConfig.addCollection("categories", function(collection) {
    let categories = new Set();
    collection.getFilteredByGlob("src/posts/**/index.md").forEach(post => {
      if (post.data.categories) {
        post.data.categories.forEach(cat => categories.add(cat));
      }
    });
    return Array.from(categories).sort();
  });
  
  // Collections: posts by tag
  eleventyConfig.addCollection("tags", function(collection) {
    let tags = new Set();
    collection.getFilteredByGlob("src/posts/**/index.md").forEach(post => {
      if (post.data.tags) {
        post.data.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  });
  
  // Filter: get posts by category
  eleventyConfig.addFilter("filterByCategory", function(collection, category) {
    return collection.filter(post => 
      post.data.categories && post.data.categories.includes(category)
    );
  });
  
  // Filter: get posts by tag
  eleventyConfig.addFilter("filterByTag", function(collection, tag) {
    return collection.filter(post => 
      post.data.tags && post.data.tags.includes(tag)
    );
  });
  
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["html", "md", "njk"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: false
  };
};
```

- [ ] **Step 2: Add luxon dependency**

Run: `npm install luxon`

- [ ] **Step 3: Test build**

Run: `npm run build`

Expected: Build succeeds (may be empty since no posts exist yet), `_site/` created

- [ ] **Step 4: Commit**

```bash
git add .eleventy.js package.json package-lock.json
git commit -m "feat: configure 11ty with markdown parsing and collections"
```

---

### Task 4: Configure Tailwind CSS

**Files:**
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `src/css/main.css`
- Modify: `package.json` (add CSS build script)

**Interfaces:**
- Consumes: npm project from Task 1
- Produces: Tailwind CSS configured and output to `_site/css/main.css` during build

- [ ] **Step 1: Create tailwind.config.js**

Create `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,njk,md}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a",
        secondary: "#64748b",
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['Menlo', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: 'class',
};
```

- [ ] **Step 2: Create postcss.config.js**

Create `postcss.config.js`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 3: Create src/css/main.css**

Create `src/css/main.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
@layer components {
  .prose-code {
    @apply bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-sm;
  }
}

/* Dark mode scrollbar */
@layer utilities {
  @supports (scrollbar-color: red blue) {
    ::-webkit-scrollbar {
      width: 12px;
    }
    ::-webkit-scrollbar-track {
      @apply bg-white dark:bg-gray-900;
    }
    ::-webkit-scrollbar-thumb {
      @apply bg-gray-300 dark:bg-gray-700 rounded-full;
    }
  }
}
```

- [ ] **Step 4: Add @tailwindcss/typography**

Run: `npm install @tailwindcss/typography autoprefixer`

- [ ] **Step 5: Update package.json scripts**

Modify `package.json` scripts section:
```json
"scripts": {
  "build": "tailwindcss -i src/css/main.css -o _site/css/main.css && eleventy",
  "dev": "tailwindcss -i src/css/main.css -o _site/css/main.css --watch & eleventy --serve --incremental",
  "clean": "rm -rf _site"
}
```

- [ ] **Step 6: Test CSS build**

Run: `npm run build`

Expected: `_site/css/main.css` created with Tailwind output, build succeeds

- [ ] **Step 7: Commit**

```bash
git add tailwind.config.js postcss.config.js src/css/ package.json package-lock.json
git commit -m "feat: configure Tailwind CSS with dark mode support"
```

---

### Template Phase

---

### Task 5: Create Base Layouts

**Files:**
- Create: `src/_includes/layout.html`
- Create: `src/_includes/header.html`
- Create: `src/_includes/footer.html`
- Create: `src/_includes/nav.html`

**Interfaces:**
- Consumes: Tailwind CSS from Task 4, site data from Task 2
- Produces: Reusable Nunjucks templates for all pages

- [ ] **Step 1: Create src/_includes/layout.html**

Create `src/_includes/layout.html`:
```html
<!DOCTYPE html>
<html lang="{{ site.language }}" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{{ description or site.description }}">
  <meta name="author" content="{{ site.author }}">
  
  <!-- OG Tags -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="{{ title or site.title }}">
  <meta property="og:description" content="{{ description or site.description }}">
  <meta property="og:url" content="{{ site.url }}">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='75' font-size='75' font-weight='bold' fill='%230f172a'>B</text></svg>">
  
  <title>{{ title or site.title }}</title>
  <link rel="stylesheet" href="/css/main.css">
  <link rel="alternate" type="application/rss+xml" href="/feed.xml" title="{{ site.title }}">
  
  {% if analytics.enabled %}
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id={{ analytics.googleAnalyticsId }}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '{{ analytics.googleAnalyticsId }}');
  </script>
  {% endif %}
</head>
<body class="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
  {% include "header.html" %}
  
  <main class="container mx-auto px-4 py-8 max-w-4xl">
    {{ content | safe }}
  </main>
  
  {% include "footer.html" %}
  
  <script src="/js/theme-toggle.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Create src/_includes/header.html**

Create `src/_includes/header.html`:
```html
<header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
  <nav class="container mx-auto px-4 py-4 max-w-4xl flex items-center justify-between">
    <div class="flex items-center space-x-2">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        <a href="/">Blog</a>
      </h1>
    </div>
    
    <div class="flex items-center space-x-4">
      {% include "nav.html" %}
      
      <a href="/search/" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" title="Buscar">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </a>
      
      <button id="theme-toggle" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
        <svg class="w-5 h-5 sun-icon" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm4.293 1.293a1 1 0 011.414 0l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414a1 1 0 010-1.414zm2.828 4.293a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm-1.414 5.414l1.414 1.414a1 1 0 11-1.414 1.414l-1.414-1.414a1 1 0 111.414-1.414zM10 16a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zm-4.293 1.293l-1.414 1.414a1 1 0 111.414 1.414l1.414-1.414a1 1 0 11-1.414-1.414zm0-4.586l-1.414-1.414a1 1 0 111.414-1.414l1.414 1.414a1 1 0 11-1.414 1.414zM4 10a1 1 0 011-1h2a1 1 0 110 2H5a1 1 0 01-1-1z" clip-rule="evenodd"></path>
        </svg>
        <svg class="w-5 h-5 moon-icon hidden" fill="currentColor" viewBox="0 0 20 20">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
      </button>
    </div>
  </nav>
</header>
```

- [ ] **Step 3: Create src/_includes/nav.html**

Create `src/_includes/nav.html`:
```html
<nav class="hidden md:flex space-x-6">
  {% for item in navigation.mainNav %}
    <a href="{{ item.url }}" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
      {{ item.title }}
    </a>
  {% endfor %}
</nav>
```

- [ ] **Step 4: Create src/_includes/footer.html**

Create `src/_includes/footer.html`:
```html
<footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12">
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <div class="flex flex-col md:flex-row justify-between items-center space-y-4">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <p>&copy; 2026 {{ site.author }}. Todos los derechos reservados.</p>
      </div>
      
      <div class="flex space-x-4">
        {% if site.socialLinks.github %}
          <a href="{{ site.socialLinks.github }}" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            GitHub
          </a>
        {% endif %}
        {% if site.socialLinks.linkedin %}
          <a href="{{ site.socialLinks.linkedin }}" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            LinkedIn
          </a>
        {% endif %}
        <a href="/feed.xml" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          RSS
        </a>
      </div>
    </div>
  </div>
</footer>
```

- [ ] **Step 5: Commit**

```bash
git add src/_includes/
git commit -m "feat: create base layout templates with header, footer, navigation"
```

---

### Task 6: Create Post Layout and TOC Component

**Files:**
- Create: `src/_includes/post-layout.html`
- Create: `src/_includes/toc.html`

**Interfaces:**
- Consumes: `layout.html`, Markdown parsed with anchors from Task 3
- Produces: Template for individual post pages with TOC sidebar

- [ ] **Step 1: Create src/_includes/post-layout.html**

Create `src/_includes/post-layout.html`:
```html
---
layout: layout.html
---

<article class="grid grid-cols-1 md:grid-cols-3 gap-8">
  <!-- TOC Sidebar -->
  <aside class="md:col-span-1 order-last md:order-first">
    {% if content.includes('<h2') or content.includes('<h3') %}
      {% include "toc.html" %}
    {% endif %}
  </aside>
  
  <!-- Article Content -->
  <div class="md:col-span-2">
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">{{ title }}</h1>
      
      <div class="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <time datetime="{{ date | dateISO }}">
          {{ date | readableDate }}
        </time>
        
        {% if author %}
          <span>por {{ author }}</span>
        {% endif %}
      </div>
      
      {% if categories %}
        <div class="mt-4 flex flex-wrap gap-2">
          {% for category in categories %}
            <a href="/categories/{{ category | slugify }}/" class="inline-block bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-3 py-1 rounded-full text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-800">
              {{ category }}
            </a>
          {% endfor %}
        </div>
      {% endif %}
    </header>
    
    <!-- Main content -->
    <div class="prose dark:prose-invert max-w-none">
      {{ content | safe }}
    </div>
    
    <!-- Tags -->
    {% if tags %}
      <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tags:</p>
        <div class="flex flex-wrap gap-2">
          {% for tag in tags %}
            <a href="/tags/{{ tag | slugify }}/" class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
              #{{ tag }}
            </a>
          {% endfor %}
        </div>
      </div>
    {% endif %}
  </div>
</article>

<!-- Navigation -->
{% if collections.posts %}
  {% set postIndex = collections.posts | findIndex(page) %}
  {% if postIndex > -1 %}
    <nav class="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex justify-between">
      {% if postIndex > 0 %}
        {% set nextPost = collections.posts[postIndex - 1] %}
        <a href="{{ nextPost.url }}" class="text-blue-600 dark:text-blue-400 hover:underline">
          ← {{ nextPost.data.title }}
        </a>
      {% endif %}
      
      {% if postIndex < collections.posts.length - 1 %}
        {% set prevPost = collections.posts[postIndex + 1] %}
        <a href="{{ prevPost.url }}" class="text-blue-600 dark:text-blue-400 hover:underline ml-auto">
          {{ prevPost.data.title }} →
        </a>
      {% endif %}
    </nav>
  {% endif %}
{% endif %}
```

- [ ] **Step 2: Create src/_includes/toc.html**

Create `src/_includes/toc.html`:
```html
<div class="sticky top-20 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
  <h3 class="font-bold text-gray-900 dark:text-white mb-3">En este artículo</h3>
  <nav class="space-y-1">
    {% set headings = content | extractHeadings %}
    {% for heading in headings %}
      <a href="#{{ heading.id }}" class="block text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white {% if heading.level == 3 %}ml-4{% endif %}" data-toc-link>
        {{ heading.text }}
      </a>
    {% endfor %}
  </nav>
</div>

<script>
  // TOC scroll tracking
  const links = document.querySelectorAll('[data-toc-link]');
  const headings = Array.from(links).map(link => {
    const id = link.getAttribute('href').slice(1);
    return document.getElementById(id);
  });

  window.addEventListener('scroll', () => {
    let current = links[0];
    
    for (let i = 0; i < headings.length; i++) {
      if (!headings[i]) continue;
      if (window.scrollY >= headings[i].offsetTop - 100) {
        current = links[i];
      }
    }
    
    links.forEach(link => link.classList.remove('font-bold', 'text-gray-900', 'dark:text-white'));
    current?.classList.add('font-bold', 'text-gray-900', 'dark:text-white');
  });
</script>
```

- [ ] **Step 3: Add helper filters to .eleventy.js**

Modify `.eleventy.js` to add filters at end (before return statement):

```javascript
  // Add in .eleventy.js before the return statement:
  
  // Filter: slugify text (for URLs)
  eleventyConfig.addFilter("slugify", function(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]/g, '')
      .replace(/\-+/g, '-');
  });
  
  // Filter: extract headings from HTML content
  eleventyConfig.addFilter("extractHeadings", function(content) {
    const headings = [];
    const regex = /<h([2-3]) id="([^"]*)">(.*?)<\/h[2-3]>/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        id: match[2],
        text: match[3].replace(/<[^>]*>/g, '') // Remove anchor tags
      });
    }
    
    return headings;
  });
  
  // Filter: find post by page
  eleventyConfig.addFilter("findIndex", function(array, page) {
    return array.findIndex(item => item.inputPath === page.inputPath);
  });
```

- [ ] **Step 4: Test post layout creation**

Create test post at `src/posts/2026-10-06-test-post/index.md`:
```markdown
---
title: "Test Post"
date: 2026-10-06
categories: ["Test"]
tags: ["test"]
---

# Test Heading

## Section 1
Some content here.

## Section 2
More content.
```

Run: `npm run build`

Expected: `_site/posts/2026-10-06-test-post/index.html` created, no errors

- [ ] **Step 5: Commit**

```bash
git add src/_includes/post-layout.html src/_includes/toc.html .eleventy.js src/posts/
git commit -m "feat: create post layout with table of contents sidebar"
```

---

### Feature Phase

---

### Task 7: Implement Home Page

**Files:**
- Create: `src/index.html`
- Create: `src/_includes/post-card.html`

**Interfaces:**
- Consumes: `collections.posts` from Task 3, `layout.html`
- Produces: Home page listing recent posts with pagination

- [ ] **Step 1: Create src/_includes/post-card.html**

Create `src/_includes/post-card.html`:
```html
<article class="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
  <h2 class="text-xl font-bold mb-2">
    <a href="{{ post.url }}" class="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
      {{ post.data.title }}
    </a>
  </h2>
  
  <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
    <time datetime="{{ post.data.date | dateISO }}">
      {{ post.data.date | readableDate }}
    </time>
  </p>
  
  {% if post.data.description %}
    <p class="text-gray-700 dark:text-gray-300 mb-4">
      {{ post.data.description }}
    </p>
  {% endif %}
  
  {% if post.data.categories %}
    <div class="flex flex-wrap gap-2 mb-4">
      {% for category in post.data.categories %}
        <a href="/categories/{{ category | slugify }}/" class="text-xs bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 px-2 py-1 rounded">
          {{ category }}
        </a>
      {% endfor %}
    </div>
  {% endif %}
  
  <a href="{{ post.url }}" class="text-blue-600 dark:text-blue-400 hover:underline">
    Leer más →
  </a>
</article>
```

- [ ] **Step 2: Create src/index.html**

Create `src/index.html`:
```html
---
layout: layout.html
title: Home
description: Blog de artículos sobre Business Central y Power BI
---

<section class="mb-12">
  <h2 class="text-3xl font-bold mb-2">Bienvenido</h2>
  <p class="text-gray-700 dark:text-gray-300 text-lg">
    Blog de artículos técnicos sobre Business Central y Power BI. Actualizamos con nuevos contenidos regularmente.
  </p>
</section>

<section>
  <h2 class="text-2xl font-bold mb-6">Artículos Recientes</h2>
  
  <div class="grid gap-6">
    {% for post in collections.posts | slice(0, site.recentPostsCount) %}
      {% include "post-card.html" %}
    {% endfor %}
  </div>
  
  {% if collections.posts.length > site.recentPostsCount %}
    <div class="mt-8 text-center">
      <a href="/all/" class="inline-block bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2 rounded-lg">
        Ver todos los artículos
      </a>
    </div>
  {% endif %}
</section>
```

- [ ] **Step 3: Test home page**

Run: `npm run dev`

Navigate to `http://localhost:8080/`

Expected: Home page renders with test post card, no errors

- [ ] **Step 4: Commit**

```bash
git add src/index.html src/_includes/post-card.html
git commit -m "feat: create home page with recent posts listing"
```

---

### Task 8: Implement Search with Lunr.js

**Files:**
- Create: `src/search.html`
- Create: `src/js/search.js`
- Modify: `.eleventy.js` (add search index generation)

**Interfaces:**
- Consumes: `collections.posts` from Task 3
- Produces: `/search/` page with client-side full-text search UI and index.json

- [ ] **Step 1: Add search index generation to .eleventy.js**

Modify `.eleventy.js` to add this before `return` statement:

```javascript
  // Generate search index
  eleventyConfig.addCollection("searchIndex", function(collection) {
    return collection
      .getFilteredByGlob("src/posts/**/index.md")
      .map(post => ({
        title: post.data.title,
        url: post.url,
        excerpt: post.data.description || post.template.inputContent.substring(0, 200),
        content: post.template.inputContent,
        categories: post.data.categories || [],
        tags: post.data.tags || [],
        date: post.data.date
      }));
  });
  
  // Add JSON template filter
  eleventyConfig.addNunjucksFilter("JSON", JSON.stringify);
  
  // Add pass-through copy for search index
  eleventyConfig.addPassthroughCopy("src/search.html");
```

- [ ] **Step 2: Create src/search.html**

Create `src/search.html`:
```html
---
layout: layout.html
title: Buscar
description: Busca en todos los artículos del blog
permalink: /search/
---

<h1 class="text-4xl font-bold mb-8">Buscar Artículos</h1>

<div class="mb-6">
  <input 
    type="text" 
    id="search-input" 
    placeholder="Busca por palabra clave..." 
    class="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
</div>

<div id="search-results" class="space-y-6">
  <p class="text-gray-600 dark:text-gray-400">Escribe algo para buscar...</p>
</div>

<script src="/js/search.js" defer></script>
<script>
  window.searchData = {{ collections.searchIndex | JSON | safe }};
</script>
```

- [ ] **Step 3: Create src/js/search.js**

Create `src/js/search.js`:
```javascript
const Lunr = window.lunr;

// Initialize Lunr index
const idx = Lunr(function() {
  this.ref('id');
  this.field('title', { boost: 10 });
  this.field('content');
  this.field('categories', { boost: 5 });
  this.field('tags', { boost: 5 });
  
  window.searchData.forEach((post, index) => {
    this.add({
      id: index,
      title: post.title,
      content: post.content,
      categories: post.categories.join(' '),
      tags: post.tags.join(' ')
    });
  });
});

// Search input handler
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

if (searchInput) {
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      searchResults.innerHTML = '<p class="text-gray-600 dark:text-gray-400">Escribe algo para buscar...</p>';
      return;
    }
    
    try {
      const results = idx.search(query);
      
      if (results.length === 0) {
        searchResults.innerHTML = '<p class="text-gray-600 dark:text-gray-400">No se encontraron resultados.</p>';
        return;
      }
      
      searchResults.innerHTML = results
        .map(result => {
          const post = window.searchData[result.ref];
          return `
            <article class="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 class="text-xl font-bold mb-2">
                <a href="${post.url}" class="text-blue-600 dark:text-blue-400 hover:underline">
                  ${post.title}
                </a>
              </h2>
              <p class="text-gray-700 dark:text-gray-300 mb-3">
                ${post.excerpt}
              </p>
              <a href="${post.url}" class="text-blue-600 dark:text-blue-400 hover:underline">
                Leer más →
              </a>
            </article>
          `;
        })
        .join('');
    } catch (e) {
      searchResults.innerHTML = '<p class="text-red-600 dark:text-red-400">Error en la búsqueda.</p>';
    }
  });
}
```

- [ ] **Step 4: Add Lunr.js to layout.html**

Modify `src/_includes/layout.html` and add before closing `</head>`:

```html
  <script src="https://cdn.jsdelivr.net/npm/lunr@2.3.9/lunr.min.js"></script>
```

- [ ] **Step 5: Test search**

Run: `npm run dev`

Navigate to `http://localhost:8080/search/`

Expected: Search page loads, typing in search box returns results (if posts exist)

- [ ] **Step 6: Commit**

```bash
git add src/search.html src/js/search.js .eleventy.js src/_includes/layout.html
git commit -m "feat: implement full-text search with Lunr.js"
```

---

### Task 9: Implement Categories and Tags Pages

**Files:**
- Create: `src/categories.html`
- Create: `src/tags.html`
- Create: `src/categories/[slug].html` (dynamic layout)
- Create: `src/tags/[slug].html` (dynamic layout)

**Interfaces:**
- Consumes: `collections.categories`, `collections.tags`, `collections.posts` from Task 3
- Produces: Category and tag listing pages with filtered post lists

- [ ] **Step 1: Create src/categories.html**

Create `src/categories.html`:
```html
---
layout: layout.html
title: Categorías
description: Explora artículos por categoría
permalink: /categories/index.html
---

<h1 class="text-4xl font-bold mb-8">Categorías</h1>

<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
  {% for category in collections.categories %}
    {% set postsInCategory = collections.posts | filterByCategory(category) %}
    <a href="/categories/{{ category | slugify }}/" class="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <h2 class="font-bold text-gray-900 dark:text-white">{{ category }}</h2>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ postsInCategory.length }} artículo{% if postsInCategory.length != 1 %}s{% endif %}
      </p>
    </a>
  {% endfor %}
</div>
```

- [ ] **Step 2: Create src/categories/[slug].html (dynamic pages)**

Create `src/categories/index.html`:
```html
---
layout: layout.html
permalink: /categories/{{ slug }}/index.html
pagination:
  data: collections.categories
  size: 1
  alias: slug
---

<h1 class="text-4xl font-bold mb-2">{{ slug }}</h1>
<p class="text-gray-600 dark:text-gray-400 mb-8">
  {% set postsInCategory = collections.posts | filterByCategory(slug) %}
  {{ postsInCategory.length }} artículo{% if postsInCategory.length != 1 %}s{% endif %}
</p>

<div class="grid gap-6">
  {% for post in collections.posts | filterByCategory(slug) %}
    {% include "post-card.html" %}
  {% endfor %}
</div>
```

- [ ] **Step 3: Create src/tags.html**

Create `src/tags.html`:
```html
---
layout: layout.html
title: Tags
description: Explora artículos por etiqueta
permalink: /tags/index.html
---

<h1 class="text-4xl font-bold mb-8">Tags</h1>

<div class="flex flex-wrap gap-3">
  {% for tag in collections.tags %}
    {% set postsWithTag = collections.posts | filterByTag(tag) %}
    <a href="/tags/{{ tag | slugify }}/" class="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
      #{{ tag }}
      <span class="text-sm ml-1">({{ postsWithTag.length }})</span>
    </a>
  {% endfor %}
</div>
```

- [ ] **Step 4: Create src/tags/[slug].html (dynamic pages)**

Create `src/tags/index.html`:
```html
---
layout: layout.html
permalink: /tags/{{ slug }}/index.html
pagination:
  data: collections.tags
  size: 1
  alias: slug
---

<h1 class="text-4xl font-bold mb-2">#{{ slug }}</h1>
<p class="text-gray-600 dark:text-gray-400 mb-8">
  {% set postsWithTag = collections.posts | filterByTag(slug) %}
  {{ postsWithTag.length }} artículo{% if postsWithTag.length != 1 %}s{% endif %}
</p>

<div class="grid gap-6">
  {% for post in collections.posts | filterByTag(slug) %}
    {% include "post-card.html" %}
  {% endfor %}
</div>
```

- [ ] **Step 5: Test categories and tags**

Run: `npm run dev`

Navigate to `http://localhost:8080/categories/` and `http://localhost:8080/tags/`

Expected: Pages render with category/tag links, clicking links shows filtered posts

- [ ] **Step 6: Commit**

```bash
git add src/categories.html src/categories/ src/tags.html src/tags/
git commit -m "feat: implement dynamic category and tag pages"
```

---

### Task 10: Implement Dark Mode Toggle

**Files:**
- Create: `src/js/theme-toggle.js`

**Interfaces:**
- Consumes: Tailwind dark mode from Task 4
- Produces: Persistent dark mode toggle with localStorage

- [ ] **Step 1: Create src/js/theme-toggle.js**

Create `src/js/theme-toggle.js`:
```javascript
// Dark mode toggle
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Get saved theme or detect system preference
function getTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Apply theme
function setTheme(theme) {
  if (theme === 'dark') {
    htmlElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    htmlElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
  updateToggleIcon();
}

// Update toggle icon
function updateToggleIcon() {
  const isDark = htmlElement.classList.contains('dark');
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');
  
  if (isDark) {
    sunIcon.classList.add('hidden');
    moonIcon.classList.remove('hidden');
  } else {
    sunIcon.classList.remove('hidden');
    moonIcon.classList.add('hidden');
  }
}

// Toggle theme on button click
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const isDark = htmlElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  });
}

// Initialize theme on load
setTheme(getTheme());

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    setTheme(e.matches ? 'dark' : 'light');
  }
});
```

- [ ] **Step 2: Test dark mode**

Run: `npm run dev`

Click theme toggle button in header

Expected: Page switches between light and dark mode, persists on refresh, toggles smoothly

- [ ] **Step 3: Commit**

```bash
git add src/js/theme-toggle.js
git commit -m "feat: implement persistent dark mode toggle"
```

---

### Task 11: Implement RSS Feed

**Files:**
- Create: `src/feed.njk`

**Interfaces:**
- Consumes: `collections.posts` from Task 3, `site` data
- Produces: Valid RSS 2.0 feed at `/feed.xml`

- [ ] **Step 1: Create src/feed.njk**

Create `src/feed.njk`:
```njk
---
permalink: /feed.xml
eleventyExcludeFromCollections: true
---
<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>{{ site.title }}</title>
    <link>{{ site.url }}</link>
    <description>{{ site.description }}</description>
    <language>{{ site.language }}</language>
    <lastBuildDate>{{ now | dateRSS }}</lastBuildDate>
    
    {% for post in collections.posts | slice(0, 20) %}
      <item>
        <title>{{ post.data.title }}</title>
        <link>{{ site.url }}{{ post.url }}</link>
        <description>{{ post.data.description or post.template.inputContent | truncate(200) }}</description>
        <pubDate>{{ post.data.date | dateRSS }}</pubDate>
        {% if post.data.author %}
          <author>{{ post.data.author }}</author>
        {% endif %}
        {% if post.data.categories %}
          {% for category in post.data.categories %}
            <category>{{ category }}</category>
          {% endfor %}
        {% endif %}
        <guid>{{ site.url }}{{ post.url }}</guid>
      </item>
    {% endfor %}
  </channel>
</rss>
```

- [ ] **Step 2: Add RSS date filter to .eleventy.js**

Modify `.eleventy.js` to add these filters before `return`:

```javascript
  // Filter: RSS date format (RFC 2822)
  eleventyConfig.addNunjucksFilter("dateRSS", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "UTC" })
      .toRFC2822();
  });
  
  // Filter: truncate text
  eleventyConfig.addNunjucksFilter("truncate", (text, length = 200) => {
    return text.substring(0, length) + (text.length > length ? "..." : "");
  });
  
  // Global data: current date
  eleventyConfig.addNunjucksGlobal("now", new Date());
```

- [ ] **Step 3: Test RSS feed**

Run: `npm run build`

Expected: `_site/feed.xml` created and valid (can validate at https://www.w3.org/Feed/Validator/)

- [ ] **Step 4: Commit**

```bash
git add src/feed.njk .eleventy.js
git commit -m "feat: generate RSS 2.0 feed for blog posts"
```

---

### CI/CD Phase

---

### Task 12: Configure GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/build-deploy.yml`

**Interfaces:**
- Consumes: npm build from Tasks 1-4
- Produces: Automated build + deploy to GitHub Pages on push to main

- [ ] **Step 1: Create .github/workflows/build-deploy.yml**

Create `.github/workflows/build-deploy.yml`:
```yaml
name: Build and Deploy

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "_site"

  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    needs: build
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

- [ ] **Step 2: Configure repository settings**

Manual step (cannot automate):
- Go to repository Settings → Pages
- Select "Deploy from a branch"
- Branch: `gh-pages`, folder: `/`
- Save

- [ ] **Step 3: Enable GitHub Pages**

In Settings → Pages, ensure visibility is set to "Public"

- [ ] **Step 4: Commit workflow**

```bash
git add .github/workflows/build-deploy.yml
git commit -m "ci: add GitHub Actions workflow for build and deploy"
```

---

### Content and Testing Phase

---

### Task 13: Create Sample Posts

**Files:**
- Create: Multiple sample posts in `src/posts/`

**Interfaces:**
- Consumes: Post layout from Task 6
- Produces: Testable posts with various categories, tags, and images

- [ ] **Step 1: Create Business Central post**

Create `src/posts/2026-10-06-business-central-basics/index.md`:
```markdown
---
title: "Introducción a Business Central"
date: 2026-10-06
author: "Tu Nombre"
categories: ["Business Central"]
tags: ["bc", "basics", "tutorial"]
description: "Guía básica para comenzar con Microsoft Dynamics 365 Business Central."
---

# Introducción a Business Central

Business Central es una solución de gestión empresarial en la nube diseñada para empresas pequeñas y medianas.

## ¿Qué es Business Central?

Business Central proporciona:
- Gestión financiera completa
- Gestión de inventario
- Automatización de procesos
- Reportes y análisis

## Primeros Pasos

Para comenzar con Business Central:
1. Acceder a portal de administración
2. Crear entorno de demostración
3. Configurar módulos básicos

## Conclusión

Business Central es una herramienta poderosa para gestionar tu negocio de forma efectiva.
```

- [ ] **Step 2: Create Power BI post**

Create `src/posts/2026-10-05-power-bi-dashboards/index.md`:
```markdown
---
title: "Crear Dashboards en Power BI"
date: 2026-10-05
author: "Tu Nombre"
categories: ["Power BI"]
tags: ["pbi", "dashboards", "visualization"]
description: "Tutorial paso a paso para crear dashboards efectivos en Power BI."
---

# Crear Dashboards en Power BI

Los dashboards son la forma más efectiva de visualizar datos en Power BI.

## ¿Por qué dashboards?

- Visualización clara de datos
- Toma de decisiones más rápida
- Interactividad con los datos
- Compartible con el equipo

## Pasos para crear un dashboard

### 1. Preparar datos
Asegúrate de tener datos limpios y bien estructurados.

### 2. Crear visualizaciones
Selecciona el tipo de gráfico más adecuado.

### 3. Organizar diseño
Distribuye las visualizaciones de forma coherente.

## Mejores prácticas

- Usa colores consistentes
- Mantén el diseño simple
- Prioriza la información importante
- Proporciona contexto

## Conclusión

Un buen dashboard convierte datos en insights valiosos.
```

- [ ] **Step 3: Create integration post**

Create `src/posts/2026-10-04-bc-pbi-integration/index.md`:
```markdown
---
title: "Integrar Business Central con Power BI"
date: 2026-10-04
author: "Tu Nombre"
categories: ["Business Central", "Power BI"]
tags: ["bc", "pbi", "integration", "data"]
description: "Conecta Business Central con Power BI para análisis avanzados de datos."
---

# Integrar Business Central con Power BI

La integración entre Business Central y Power BI permite crear reportes y dashboards poderosos.

## Ventajas de la integración

- Acceso a datos en tiempo real
- Análisis detallado de datos BC
- Dashboards interactivos
- Automatización de reportes

## Métodos de conexión

### Opción 1: Conector nativo
Power BI tiene un conector específico para BC que facilita la conexión.

### Opción 2: API REST
Accede a datos mediante las APIs REST de BC.

### Opción 3: Excel
Exporta datos a Excel para análisis.

## Pasos básicos

1. Crear conexión en Power BI Desktop
2. Seleccionar tablas de BC
3. Transformar datos si es necesario
4. Crear visualizaciones
5. Publicar dashboard

## Conclusión

La integración BC + PBI es fundamental para el análisis de datos empresariales.
```

- [ ] **Step 4: Test site build with content**

Run: `npm run build`

Expected: All pages build successfully, no errors

Run: `npm run dev` and navigate to `http://localhost:8080`

Expected: Home page shows all 3 posts, categories/tags are populated, search works

- [ ] **Step 5: Commit sample posts**

```bash
git add src/posts/
git commit -m "docs: add sample blog posts for testing"
```

---

### Task 14: Create 404 Page

**Files:**
- Create: `src/404.html`

**Interfaces:**
- Consumes: `layout.html`
- Produces: Custom 404 error page

- [ ] **Step 1: Create src/404.html**

Create `src/404.html`:
```html
---
layout: layout.html
permalink: /404.html
title: Página no encontrada
---

<div class="text-center py-12">
  <h1 class="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
  <p class="text-2xl text-gray-700 dark:text-gray-300 mb-8">Página no encontrada</p>
  
  <p class="text-gray-600 dark:text-gray-400 mb-8">
    Lo sentimos, la página que buscas no existe.
  </p>
  
  <div class="flex flex-col sm:flex-row gap-4 justify-center">
    <a href="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
      Volver al inicio
    </a>
    <a href="/search/" class="inline-block bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-6 py-3 rounded-lg">
      Buscar artículos
    </a>
  </div>
</div>
```

- [ ] **Step 2: Configure GitHub Pages 404**

The 404.html will be automatically served by GitHub Pages when a page is not found.

- [ ] **Step 3: Test 404 page**

Run: `npm run dev`

Navigate to `http://localhost:8080/nonexistent-page/`

Expected: 404 page displays

- [ ] **Step 4: Commit**

```bash
git add src/404.html
git commit -m "feat: create custom 404 error page"
```

---

### Task 15: Final Verification and Deployment Prep

**Files:**
- Modify: `README.md` (create if doesn't exist)
- Verify: All build artifacts and configurations

**Interfaces:**
- Produces: Ready-to-deploy repository with documentation

- [ ] **Step 1: Create README.md**

Create or update `README.md`:
```markdown
# Blog Tecnológico - Business Central & Power BI

Blog estático generado con 11ty y desplegado en GitHub Pages.

## Características

- ✨ Generación rápida con 11ty
- 📝 Artículos en Markdown
- 🏷️ Categorías y tags
- 🔍 Búsqueda client-side
- 📡 Feed RSS
- 🌙 Dark mode
- 📊 Analytics (opcional)
- ⚡ Despliegue automático con GitHub Actions

## Instalación Local

```bash
# Clonar repositorio
git clone <repo-url>
cd blog-repo

# Instalar dependencias
npm install

# Desarrollo (con live reload)
npm run dev

# Build para producción
npm run build
```

## Crear un nuevo artículo

```bash
# Crear estructura
mkdir -p src/posts/$(date +%Y-%m-%d)-titulo-slug/images

# Crear archivo
cat > src/posts/$(date +%Y-%m-%d)-titulo-slug/index.md << 'EOF'
---
title: "Título del artículo"
date: $(date +%Y-%m-%d)
categories: ["Categoría"]
tags: ["tag1", "tag2"]
description: "Descripción breve..."
---

# Título

Tu contenido aquí...
EOF
```

## Estructura

```
src/
├── posts/                    # Artículos
│   └── YYYY-MM-DD-slug/
│       ├── index.md         # Contenido
│       └── images/          # Imágenes
├── _includes/               # Plantillas
├── _data/                   # Datos globales
├── css/                     # Estilos
├── js/                      # Scripts
└── index.html              # Home
```

## Despliegue

El despliegue es automático:
1. Escribe un artículo
2. Haz commit y push a main
3. GitHub Actions genera el sitio
4. Se despliega automáticamente en GitHub Pages

## Configuración

### Analytics
Edita `src/_data/analytics.json`:
```json
{
  "googleAnalyticsId": "G-XXXXXXXXXX",
  "enabled": true
}
```

### Sitio
Edita `src/_data/site.json` con tu información.

## Tecnologías

- **11ty** - Generador de sitios estáticos
- **Markdown-it** - Parser Markdown
- **Tailwind CSS** - Framework CSS
- **Lunr.js** - Búsqueda
- **GitHub Pages** - Hosting
- **GitHub Actions** - CI/CD

## Licencia

MIT
```

- [ ] **Step 2: Create .env.example**

Create `.env.example`:
```
# Google Analytics (opcional)
ANALYTICS_ID=G-XXXXXXXXXX
```

- [ ] **Step 3: Verify all files**

Run: `npm run build`

Verify:
- [ ] No build errors
- [ ] `_site/` contains all pages
- [ ] `_site/feed.xml` exists
- [ ] `_site/search.html` exists
- [ ] `_site/categories/` has category pages
- [ ] `_site/tags/` has tag pages

- [ ] **Step 4: Clean up test post (optional)**

Option A: Keep sample posts for demo

Option B: Remove sample posts and keep only structure:
```bash
rm -rf src/posts/*/
```

- [ ] **Step 5: Final commit**

```bash
git add README.md .env.example
git commit -m "docs: add README and setup documentation"
```

- [ ] **Step 6: Verify deployment readiness**

Checklist:
- [ ] All source files in `src/`
- [ ] `.eleventy.js` configured
- [ ] GitHub workflow in `.github/workflows/build-deploy.yml`
- [ ] `.gitignore` excludes build artifacts
- [ ] `package.json` has build scripts
- [ ] README has deployment instructions
- [ ] No secrets in code (use `.env.example`)

- [ ] **Step 7: Final status check**

Run: `npm run build && npm run clean`

Expected: Clean build cycle works, no artifacts left

- [ ] **Step 8: Commit and prepare for push**

```bash
git log --oneline
```

Expected: All commits show feature implementations

---

## Execution Method

**Plan complete and saved to `docs/superpowers/plans/2026-10-06-blog-tech-implementation.md`.**

Which execution approach would you prefer?

1. **Subagent-driven** — Each task executed by a fresh subagent, independent review between tasks, then whole-branch review at the end. Most thorough.

2. **Native** — I implement all tasks in this session, then one review at the end. Fastest, best for tightly-coupled tasks.

**I recommend Native** because:
- Tasks are tightly coupled (each layer builds on previous configurations)
- Single session maintains consistency across Eleventy config, templates, and scripts
- Front-end features (dark mode, search) need integrated testing
- Faster overall delivery with mid-tier model

**Does the plan capture what you want, and which approach should we use?**

