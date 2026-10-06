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

// Convert markdown/HTML source into plain text for the search index
function toPlainText(src) {
  return decodeEntities(String(src || "")
    .replace(/\r\n?/g, "\n")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/^[ \t]*(```|~~~)[^\n]*\n[\s\S]*?\n[ \t]*\1[^\n]*$/gm, " ") // fenced code blocks
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // links
    .replace(/<[^>]+>/g, " ") // html tags
    .replace(/^\s{0,3}#{1,6}\s+/gm, "") // headings
    .replace(/^\s{0,3}>\s?/gm, "") // blockquotes
    .replace(/^\s*([-*+]|\d+\.)\s+/gm, "") // list markers
    .replace(/^\s*([-*_]\s*){3,}$/gm, " ") // horizontal rules
    .replace(/\[\[toc\]\]/gi, " ")
    .replace(/[`*_~]+/g, "") // inline code/emphasis markers
    .replace(/\s+/g, " ")).trim();
}

const siteData = require("./src/_data/site.json");

// Site base URL guaranteed to end with "/" (it includes the GitHub Pages subpath, e.g. /blog-repo/)
const SITE_BASE = siteData.url.replace(/\/*$/, "/");

// Resolve a site-relative path (as in post.url, no pathPrefix) to an absolute URL under SITE_BASE
function absoluteUrl(path) {
  return new URL(String(path || "").replace(/^\//, ""), SITE_BASE).href;
}

// Make URLs inside rendered post HTML absolute (feed readers have no <base>).
// Relative URLs resolve against the post URL; root-relative ("/x") against the site base.
// Skips absolute/protocol-relative URLs, mailto:, data:, #fragments, etc.
function absolutizeHtml(html, postUrl) {
  const postAbs = absoluteUrl(postUrl);
  return String(html || "").replace(/(\s(?:src|href)=)(["'])(.*?)\2/gi, (m, attr, q, val) => {
    const v = decodeEntities(val).trim();
    if (!v || v.startsWith("#") || v.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(v)) return m;
    let abs;
    try { abs = v.startsWith("/") ? absoluteUrl(v) : new URL(v, postAbs).href; } catch (e) { return m; }
    return attr + q + abs.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + q;
  });
}

function slugify(t) {
  const r = String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return r || "x-" + Buffer.from(String(t)).toString("hex").slice(0, 8);
}

module.exports = function(eleventyConfig) {
  // Watch CSS files
  eleventyConfig.addWatchTarget("src/styles/**/*.css");

  // Copy JS, images to output (CSS is compiled by Tailwind from src/styles)
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/posts/**/images");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  // Lunr is served locally (no CDN); only the search page loads it
  eleventyConfig.addPassthroughCopy({ "node_modules/lunr/lunr.min.js": "js/lunr.min.js" });

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

  // Collections: sorted unique names per taxonomy. Throws if two distinct names share a slug
  // (they would be written to the same output path and silently overwrite each other).
  function taxonomyCollection(field) {
    return function(collection) {
      const bySlug = new Map();
      collection.getFilteredByGlob("src/posts/**/index.md").forEach(post => {
        (post.data[field] || []).forEach(name => {
          const slug = slugify(name);
          if (bySlug.has(slug) && bySlug.get(slug) !== name) {
            throw new Error(`Slug collision in "${field}": "${bySlug.get(slug)}" and "${name}" both slugify to "${slug}"`);
          }
          bySlug.set(slug, name);
        });
      });
      return Array.from(bySlug.values()).sort((a, b) => a.localeCompare(b, "es"));
    };
  }
  eleventyConfig.addCollection("categories", taxonomyCollection("categories"));
  eleventyConfig.addCollection("tags", taxonomyCollection("tags"));

  // Search index: plain-text entries serialized as JSON (output with `| safe`)
  eleventyConfig.addFilter("searchIndexJSON", function(posts) {
    const urlFilter = eleventyConfig.getFilter("url");
    const entries = (posts || []).map(post => {
      const content = toPlainText(post.rawInput);
      const desc = post.data.description ? String(post.data.description).trim() : "";
      const d = post.data.date;
      return {
        title: String(post.data.title || ""),
        url: urlFilter(post.url),
        excerpt: desc || (content.length > 200 ? content.slice(0, 200).replace(/\s+\S*$/, "") + "…" : content),
        content,
        categories: post.data.categories || [],
        tags: post.data.tags || [],
        date: d instanceof Date ? d.toISOString() : String(d || "")
      };
    });
    // Escape "<" so sequences like </script> can never break out if the JSON is inlined
    return JSON.stringify(entries).replace(/</g, "\\u003c");
  });

  // Feed: RFC 2822 date (UTC) for <pubDate>/<lastBuildDate>
  eleventyConfig.addFilter("dateRSS", (dateObj) => {
    return DateTime.fromJSDate(new Date(dateObj), { zone: "UTC" }).toRFC2822();
  });

  // Feed: absolute URL for a site-relative path (post.url has no pathPrefix)
  eleventyConfig.addFilter("absoluteUrl", absoluteUrl);

  // Feed: post HTML with relative URLs made absolute and "]]>" split so it is safe inside CDATA
  eleventyConfig.addFilter("feedContent", (html, postUrl) => {
    return absolutizeHtml(html, postUrl).replace(/\]\]>/g, "]]]]><![CDATA[>");
  });

  // Feed: <description> = front matter description, else ~200-char plain-text excerpt
  eleventyConfig.addFilter("feedDescription", (post) => {
    const desc = post.data.description ? String(post.data.description).trim() : "";
    if (desc) return desc;
    const text = toPlainText(post.rawInput);
    return text.length > 200 ? text.slice(0, 200).replace(/\s+\S*$/, "") + "…" : text;
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
  eleventyConfig.addFilter("slugify", slugify);

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

  // Filter: first n items of an array (Nunjucks `slice` splits into groups instead)
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array)) return [];
    return n < 0 ? array.slice(n) : array.slice(0, n);
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
