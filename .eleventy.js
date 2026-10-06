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
      permalink: markdownAnchor.permalink.linkAfterHeader({
        style: "aria-label",
        assistiveText: title => `Enlace permanente a "${title}"`,
        wrapper: null,
        symbol: '<svg class="icon icon-link" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="m7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1 .018-1.042Zm4.908 2.85-2.5 2.5a2.002 2.002 0 0 1-2.83 0 .751.751 0 0 0-1.042.018.751.751 0 0 0 .018 1.042 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l1.25-1.25a.751.751 0 0 0-1.042-1.042l-1.25 1.25a3.5 3.5 0 0 0 4.95 4.95Z"/></svg>'
      })
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
