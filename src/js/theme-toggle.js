// Dark mode toggle. The inline head script in layout.html already applied the
// `dark` class before first paint (saved choice or system preference).
// Here we only sync the button state and persist on EXPLICIT user click.
(function () {
  var root = document.documentElement;
  var btn = document.getElementById('theme-toggle');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function saved() {
    try { var t = localStorage.getItem('theme'); return t === 'dark' || t === 'light' ? t : null; }
    catch (e) { return null; }
  }
  function save(theme) {
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }
  // Icon shown = CURRENT mode (sun in light, moon in dark); CSS handles it via .dark.
  function sync() {
    if (!btn) return;
    var dark = root.classList.contains('dark');
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  }
  function apply(dark) {
    root.classList.toggle('dark', dark);
    sync();
  }

  if (btn) {
    btn.addEventListener('click', function () {
      var dark = !root.classList.contains('dark');
      apply(dark);
      save(dark ? 'dark' : 'light');
    });
  }

  if (mq) {
    var onChange = function (e) { if (!saved()) apply(e.matches); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  sync();
})();
