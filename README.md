# Blog Tecnologico - Business Central y Power BI

Blog estatico generado con 11ty 3, plantillas Nunjucks y Tailwind CSS v3, desplegado en GitHub Pages mediante GitHub Actions.

## Caracteristicas

- Generacion rapida con 11ty
- Articulos en Markdown (resaltado de codigo, indice de contenidos automatico)
- Categorias y tags, con paginas generadas para cada valor
- Busqueda client-side con Lunr (offline, sin CDN: Lunr se sirve desde el propio sitio)
- Feed RSS (`/feed.xml`)
- Dark mode con preferencia persistente
- Menu de navegacion movil automatico (desplegable sin JavaScript en pantallas pequenas)
- Analytics opcional (Google Analytics, desactivado por defecto)
- Despliegue automatico con GitHub Actions

## Instalacion local

Requisitos: Node.js >= 18 (el CI usa Node 20).

```bash
git clone <repo-url>
cd mpachecoBlog
npm install
npm run dev     # desarrollo con live reload
npm run build   # build de produccion en _site/ (limpia _site/ antes)
npm run clean   # elimina _site/
```

Con `npm run dev` el sitio se sirve en **http://localhost:8080/mpachecoBlog/** (no en la raiz), porque el sitio usa `pathPrefix` `/mpachecoBlog/`. Si el puerto 8080 esta ocupado, 11ty elige el siguiente libre (por ejemplo 8081); la URL exacta aparece en la consola.

## Crear un nuevo articulo

Cada articulo vive en `src/posts/YYYY-MM-DD-slug/index.md`, con sus imagenes en `images/`.

PowerShell (Windows):

```powershell
$slug = "mi-articulo"
$dir = "src/posts/$(Get-Date -Format 'yyyy-MM-dd')-$slug"
New-Item -ItemType Directory -Force "$dir/images" | Out-Null
@"
---
title: "Titulo del articulo"
date: $(Get-Date -Format 'yyyy-MM-dd')
categories: ["Categoria"]
tags: ["tag1", "tag2"]
description: "Descripcion breve."
---

Contenido del articulo...
"@ | Set-Content -Encoding utf8 "$dir/index.md"
```

bash:

```bash
slug="mi-articulo"
dir="src/posts/$(date +%Y-%m-%d)-$slug"
mkdir -p "$dir/images"
cat > "$dir/index.md" <<EOF
---
title: "Titulo del articulo"
date: $(date +%Y-%m-%d)
categories: ["Categoria"]
tags: ["tag1", "tag2"]
description: "Descripcion breve."
---

Contenido del articulo...
EOF
```

(El heredoc usa `EOF` sin comillas para que `$(date ...)` se expanda.)

### Front matter

| Campo | Obligatorio | Descripcion |
|-------|-------------|-------------|
| `title` | si | Titulo del articulo (es el unico h1 de la pagina) |
| `date` | si | Fecha `YYYY-MM-DD` |
| `categories` | si | Lista (array) de categorias |
| `tags` | no | Lista de tags |
| `description` | no | Resumen para tarjetas, feed y busqueda (si falta se usa un extracto) |
| `author` | no | Por defecto, el `author` de `src/_data/site.json` |
| `updated` | no | Fecha de ultima actualizacion |
| `draft` | no | `true` para marcar el articulo como borrador (no se publica) |

### Reglas

- Las imagenes se referencian como `./images/archivo.png`.
- Los encabezados `# ` del cuerpo se rebajan a h2: el titulo viene del front matter.
- No hace falta escribir `[[toc]]`.
- No uses como tag los nombres `posts`, `categories`, `tags` ni `all` (chocan con colecciones y rutas del sitio).
- Dos categorias o tags que generen el mismo slug (por ejemplo "C#" y "C++" dan `c`) hacen fallar el build a proposito, para evitar que una pagina sobrescriba a la otra.
- Los lenguajes de bloques de codigo que highlight.js no conoce (por ejemplo `dax`) se renderizan sin resaltado y el build muestra un aviso.
- Borradores y fechas futuras: con `npm run build` (y en el despliegue) se excluyen por completo los articulos con `draft: true` y los que tienen `date` posterior a hoy (se compara en UTC por dia, asi que un articulo con la fecha de hoy se publica). No aparecen en portada, `/all/`, categorias, tags, busqueda, feed ni tienen pagina propia; las categorias o tags usados solo por ellos tampoco generan pagina. Con `npm run dev` (servidor local) si se previsualizan, para poder revisarlos antes de publicar. Nota: el primer `eleventy` que lanza `npm run dev` es un build normal, pero el servidor lo regenera con borradores incluidos.
- `.eleventyignore` excluye `*.draft.md`; los articulos siempre son `index.md`, asi que para borradores usa `draft: true` en el front matter.

## Estructura

```
.
├── .eleventy.js              # Configuracion de 11ty (pathPrefix, filtros, Markdown)
├── .eleventyignore
├── .github/workflows/        # build-deploy.yml (GitHub Actions)
├── tailwind.config.js
├── package.json
└── src/
    ├── _data/                # site.json, analytics.json, navigation.json
    ├── _includes/            # layout, header, nav, footer, post-card, post-layout, toc
    ├── js/                   # theme-toggle.js, search.js
    ├── styles/               # main.css (fuente de Tailwind), hljs.css
    ├── posts/
    │   ├── posts.json        # layout comun de los articulos
    │   └── YYYY-MM-DD-slug/
    │       ├── index.md
    │       └── images/
    ├── index.html            # Home
    ├── all.html              # Archivo de todos los articulos
    ├── categories.html       # Listado de categorias
    ├── category-page.html    # Una pagina por categoria (paginada)
    ├── tags.html             # Listado de tags
    ├── tag-page.html         # Una pagina por tag (paginada)
    ├── search.html           # Pagina de busqueda
    ├── search-index.njk      # Genera /search-index.json
    ├── feed.njk              # Genera /feed.xml
    └── 404.html
```

El CSS se compila con Tailwind desde `src/styles/main.css` hacia `_site/css/main.css`.

## Despliegue

El workflow `.github/workflows/build-deploy.yml` usa el flujo de artefactos de GitHub Pages (no existe rama `gh-pages`).

1. En el repositorio: **Settings > Pages > Build and deployment > Source = "GitHub Actions"** (no "Deploy from a branch").
2. El workflow se ejecuta con cada push a `main` (y valida con un build las pull requests hacia `main`). El despliegue solo ocurre en push a `main`.
3. El repositorio debe ser publico, o tener un plan que permita Pages privado.

Es un sitio de proyecto, publicado en `https://<usuario>.github.io/<repo>/`. Por eso:

- `pathPrefix` en `.eleventy.js` (`/mpachecoBlog/`) y `url` en `src/_data/site.json` deben coincidir con el nombre del repositorio.
- Para un sitio de usuario (`<usuario>.github.io`) o un dominio propio, usa `pathPrefix: "/"` y ajusta `url` (por ejemplo `https://midominio.com/`).
- Todos los enlaces internos deben usar el filtro `| url` (por ejemplo `{{ "/search/" | url }}`) para respetar el prefijo.

## Configuracion

Sustituye los valores de ejemplo antes de publicar:

- `src/_data/site.json`: `title`, `description`, `author` ("Your Name"), `email`, `url` y `socialLinks` (github, linkedin).
- `src/_data/analytics.json`: pon tu ID en `googleAnalyticsId` y `enabled: true` para activar analytics.

  ```json
  {
    "googleAnalyticsId": "G-XXXXXXXXXX",
    "enabled": false
  }
  ```

- `src/_data/navigation.json`: entradas del menu principal.
- Los articulos de ejemplo tienen `author: "Tu Nombre"`; cambialo o borra los articulos de ejemplo.
- `.env.example`: solo informativo. La analitica se lee de `analytics.json`; el build no usa variables de entorno.

## Tecnologias

- **11ty 3** - Generador de sitios estaticos (plantillas Nunjucks)
- **markdown-it** (+ anchor, table of contents, highlight.js) - Markdown
- **Tailwind CSS v3** (+ typography) - Estilos
- **Lunr.js** - Busqueda client-side
- **GitHub Pages** y **GitHub Actions** - Hosting y CI/CD

## Licencia

MIT
