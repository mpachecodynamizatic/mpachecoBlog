# memory.md

Registro versionado de contexto y decisiones del proyecto. Actualízalo cuando cambie una decisión; no repitas aquí lo que ya se deduce del código.

## Proyecto

- Blog técnico sobre Business Central y Power BI, en español, 1-2 artículos por semana, comunidad pequeña.
- Cada artículo vive en una carpeta con su `index.md` y sus imágenes en `images/`.
- Publicar = push a `main`; GitHub Actions construye y despliega en GitHub Pages.
- Documentos de origen: `docs/superpowers/specs/2026-10-06-blog-tech-design.md` y `docs/superpowers/plans/2026-10-06-blog-tech-implementation.md`.

## Decisiones

- **11ty** por sencillez, build rápido y ecosistema JavaScript para la Fase 2.
- Funciones incluidas: índice de contenidos, búsqueda, categorías y tags, RSS, dark mode, analytics opcional (desactivado). Sin comentarios por ahora.
- Búsqueda con Lunr servido en local (sin CDN).
- Despliegue con el flujo de artefactos de Pages (no rama `gh-pages`).
- `pathPrefix: "/mpachecoBlog/"` como nombre provisional del repositorio.

## Desviaciones del plan original (ya aplicadas)

- `ariaInsertAfter` no existe en markdown-it-anchor 8.x: se usa `linkAfterHeader`.
- Eleventy 3 no tiene filtro `head`: se define uno propio.
- `.eleventy.ignore` se renombró a `.eleventyignore`.
- Script `clean` en Node (el `rm -rf` falla en Windows).
- Fuente de Tailwind movida a `src/styles` por conflicto con el passthrough en modo dev.

## Estado (2026-10-06)

- Las 15 tareas del plan están hechas; 24 commits en `master`, sin push.
- Enlaces internos verificados (19 páginas, 377 enlaces, 0 rotos). Dark mode, menú móvil y búsqueda solo probados con scripts, no en un navegador real.

## Pendiente

- Pasar la rama a `main` y hacer push.
- En GitHub: Settings > Pages > Source = "GitHub Actions"; repo público o plan con Pages privado.
- Fijar el nombre real del repo (`pathPrefix` y `site.json`).
- Sustituir marcadores: "Your Name", email, enlaces sociales, "Tu Nombre" en posts de ejemplo, id de Google Analytics.
- Revisar el sitio en un navegador real.
- Fase 2: implementar los agentes de contenido descritos en `AGENTS.md`.

## Deuda conocida (baja prioridad)

- Contraste AA insuficiente en tokens `built_in` y `keyword` del tema claro de highlight.js.
- `og:url` siempre apunta a la raíz del sitio.
- Un post sin `date` siempre se publica.
- Script del índice de contenidos incrustado en `toc.html`.
- Stemmer de Lunr en inglés (coincide peor con plurales en español).
- `src/robots.txt` está en el passthrough pero no existe.
- Falta `.gitattributes` (avisos de CRLF).
- `caniuse-lite` desactualizado: `npx update-browserslist-db@latest`.
