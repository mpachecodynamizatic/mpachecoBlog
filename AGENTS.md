# AGENTS.md

Guía para agentes (de código o de contenido) que trabajen en este repositorio. Para el contexto y las decisiones tomadas, ver `memory.md`. Detalle de autoría y front matter en `README.md`.

## 1. Agentes de código

Blog estático sobre Business Central y Power BI: Eleventy 3 + Nunjucks + Tailwind v3, publicado en GitHub Pages con GitHub Actions.

### Comandos

- `run.bat` (Windows): instala dependencias si faltan, lanza `npm run dev` y abre el navegador.
- `npm run dev`: servidor con recarga en http://localhost:8080/blog-repo/ (no en la raíz).
- `npm run build`: limpia `_site/`, ejecuta Eleventy y después Tailwind (el orden importa).
- `npm run clean`: borra `_site/`.
- No hay tests ni linter: se verifica con `npm run build` sin errores y revisión manual.

### Reglas del repo

- Toda la configuración de 11ty está en `.eleventy.js`; los helpers (`slugify`, `toPlainText`, `absoluteUrl`) se comparten entre búsqueda, RSS y taxonomías.
- Todos los enlaces internos en plantillas usan el filtro `| url`. `pathPrefix` (`.eleventy.js`) y `url` (`src/_data/site.json`) deben coincidir con el nombre del repo.
- Posts en `src/posts/YYYY-MM-DD-slug/index.md`, imágenes en `images/` de esa carpeta, referenciadas como `./images/archivo.png`.
- Tailwind se compila desde `src/styles/main.css` (fuera del passthrough de CSS) hacia `_site/css/main.css`.
- Categorías o tags que generen el mismo slug rompen el build a propósito. No uses como tag `posts`, `categories`, `tags` ni `all`.
- Borradores (`draft: true`) y fechas futuras se excluyen en `build` y se previsualizan en `dev`.
- El fichero de exclusiones debe llamarse `.eleventyignore`.
- Rama local `master`, el workflow solo se dispara con `main`. No hacer push ni renombrar ramas sin petición expresa.

## 2. Agentes de contenido (Fase 2, propuesta, no implementada)

Objetivo: generar de forma semiautomática borradores de artículos que una persona revisa y publica. Esta sección fija el contrato; los agentes todavía no existen.

### Principios

- Un agente solo escribe en una carpeta nueva `src/posts/YYYY-MM-DD-slug/`, siempre con `draft: true`. Nunca modifica posts publicados ni código del sitio.
- La publicación (quitar `draft`, commit, push) la decide siempre una persona.
- Sin inventar datos: capturas, cifras y código deben proceder de fuentes aportadas o verificables; lo no verificado se marca en el borrador.

### Roles previstos

| Rol | Entrada | Salida |
|-----|---------|--------|
| Investigador | Tema y fuentes (docs de Microsoft, notas del autor) | Notas con enlaces y datos citables |
| Redactor | Notas + guía editorial de `memory.md` | `index.md` con front matter válido y borrador en español |
| Revisor | Borrador | Lista de problemas: precisión técnica, formato, enlaces, imágenes faltantes |

### Formato de salida obligatorio

- Front matter con `title`, `date`, `categories` (p. ej. `Business Central`, `Power BI`), `tags`, `description` y `draft: true`.
- Cuerpo en Markdown: encabezados desde `##` (el título viene del front matter), bloques de código con lenguaje, imágenes en `./images/`.
- Comprobación: `npm run build` y `npm run dev` deben mostrar el borrador sin errores ni avisos nuevos.
