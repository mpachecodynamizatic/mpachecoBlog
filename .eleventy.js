const markdown = require("markdown-it");
const markdownAnchor = require("markdown-it-anchor");
const markdownTOC = require("markdown-it-table-of-contents");
const markdownHighlight = require("markdown-it-highlightjs");
const { DateTime } = require("luxon");

function decodeEntities(str) {
  const named = { lt: "<", gt: ">", amp: "&", quot: '"' };
  return str.replace(/&(#x[0-9a-f]+|#[0-9]+|lt|gt|amp|quot);/gi, (m, e) => {
    if (e[0] === "#") {
      const cp = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      try { return String.fromCodePoint(cp); } catch (err) { return m; }
    }
    return named[e.toLowerCase()];
  });
}

module.exports = function(eleventyConfig) {
  // Watch CSS files
  eleventyConfig.addWatchTarget("src/styles/**/*.css");

  // Copy JS, images to output (CSS is compiled by Tailwind from src/styles)
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
      permalink: markdownAnchor.permalink.linkAfterHeader({
        style: "aria-label",
        assistiveText: title => `Enlace permanente a "${title}"`,
        wrapper: null,
        symbol: '<svg class="icon icon-link" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1 .018-1.042Zm4.908 2.85-2.5 2.5a2.002 2.002 0 0 1-2.83 0 .751.751 0 0 0-1.042.018.751.751 0 0 0 .018 1.042 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l1.25-1.25a.751.751 0 0 0-1.042-1.042l-1.25 1.25a3.5 3.5 0 0 0 4.95 4.95Z"/></svg>'
      })
    })
    .use(markdownTOC, {
      "includeLevel": [2, 3],
      "markerPattern": /^\[\[toc\]\]/im
    })
    .use(markdownHighlight, {
      auto: true,
      code: true
    });

  // Demote body h1 to h2 (page title is the only h1). Runs before anchor so ids/permalinks are generated.
  md.core.ruler.before("anchor", "demote_h1", state => {
    state.tokens.forEach(t => {
      if ((t.type === "heading_open" || t.type === "heading_close") && t.tag === "h1") {
        t.tag = "h2";
        if (t.markup) t.markup = "##";
      }
    });
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

  // Filter: slugify text (for URLs)
  eleventyConfig.addFilter("slugify", t => {
    const r = String(t).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    return r || "x-" + Buffer.from(String(t)).toString("hex").slice(0, 8);
  });

  // Filter: extract h2/h3 headings from rendered HTML (tolerates extra attributes, e.g. tabindex)
  eleventyConfig.addFilter("extractHeadings", function(content) {
    const headings = [];
    const regex = /<h([2-3])\b[^>]*?\sid="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1], 10),
        id: match[2],
        text: decodeEntities(match[3].replace(/<[^>]*>/g, '')).trim()
      });
    }

    return headings;
  });

  // Filter: find index of a page in a collection
  eleventyConfig.addFilter("findIndex", function(array, page) {
    return array.findIndex(item => item.inputPath === page.inputPath);
  });

  return {
    // GitHub Pages project site lives under /<repo>/ (see site.url). Use `| url` on internal links.
    pathPrefix: "/blog-repo/",
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
