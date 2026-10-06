(function () {
  var app = document.getElementById('search-app');
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!app || !input || !results) return;

  var P = 'text-gray-600 dark:text-gray-400';
  var ERR = 'text-red-600 dark:text-red-400';
  var entries = [];
  var idx = null;

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Accent folding so "programacion" matches "programación" (applied to index and query)
  function fold(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  // Plain tokens only: drops every lunr query-syntax char (: ^ ~ * + - etc.)
  function tokenize(q) {
    return fold(q).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  }

  function message(text, cls) {
    results.innerHTML = '<p class="' + (cls || P) + '">' + escapeHtml(text) + '</p>';
  }

  function render(refs) {
    results.innerHTML = refs.map(function (r) {
      var post = entries[Number(r.ref)];
      if (!post) return '';
      var url = escapeHtml(post.url);
      return '<article class="border border-gray-200 dark:border-gray-800 rounded-lg p-6">' +
        '<h2 class="text-xl font-bold mb-2"><a href="' + url + '" class="text-blue-600 dark:text-blue-400 hover:underline">' +
        escapeHtml(post.title) + '</a></h2>' +
        '<p class="text-gray-700 dark:text-gray-300 mb-3">' + escapeHtml(post.excerpt) + '</p>' +
        '<a href="' + url + '" class="text-blue-600 dark:text-blue-400 hover:underline">Leer más →</a>' +
        '</article>';
    }).join('');
  }

  function search() {
    if (!idx) return;
    var terms = tokenize(input.value);
    if (!terms.length) { message('Escribe algo para buscar...'); return; }
    try {
      // Programmatic query: no query-string parsing, so user input cannot throw syntax errors
      var found = idx.query(function (q) {
        terms.forEach(function (t) {
          q.term(t, { usePipeline: true });
          q.term(t, { usePipeline: false, wildcard: lunr.Query.wildcard.TRAILING });
        });
      });
      if (!found.length) { message('No se encontraron resultados.'); return; }
      render(found);
    } catch (e) {
      message('Error en la búsqueda.', ERR);
    }
  }

  function debounce(fn, ms) {
    var t;
    return function () { clearTimeout(t); t = setTimeout(fn, ms); };
  }

  input.addEventListener('input', debounce(search, 150));

  if (typeof lunr === 'undefined') {
    message('No se pudo cargar el motor de búsqueda.', ERR);
    return;
  }

  fetch(app.getAttribute('data-index'))
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      entries = data;
      idx = lunr(function () {
        var b = this;
        b.ref('id');
        b.field('title', { boost: 10 });
        b.field('categories', { boost: 5 });
        b.field('tags', { boost: 5 });
        b.field('content');
        entries.forEach(function (p, i) {
          b.add({
            id: String(i),
            title: fold(p.title),
            categories: fold((p.categories || []).join(' ')),
            tags: fold((p.tags || []).join(' ')),
            content: fold(p.content)
          });
        });
      });
      if (input.value.trim()) search();
    })
    .catch(function () {
      message('No se pudo cargar el índice de búsqueda.', ERR);
    });
})();
