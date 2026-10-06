# Blog Tecnológico con 11ty + GitHub Pages
**Especificación Técnica**

**Fecha:** 2026-10-06  
**Autor:** Claude Haiku 4.5  
**Alcance:** Arquitectura, stack, estructura de datos, CI/CD, features iniciales  
**Fase:** MVP para publicación de artículos sobre Business Central y Power BI  

---

## 1. Visión y Objetivos

**Objetivo Principal:**  
Crear un blog tecnológico minimalista que permita publicar artículos en Markdown con imágenes, con despliegue automático en GitHub Pages al hacer push. Cada artículo y sus imágenes viven en una carpeta única para simplificar el flujo.

**Audiencia:**  
Pequeña comunidad técnica interesada en Business Central y Power BI.

**Frecuencia:**  
1-2 artículos por semana.

**Criterios de Éxito:**
- ✅ Build < 1 minuto
- ✅ Publicar nuevo artículo = crear carpeta + escribir MD + push
- ✅ Todas las features (TOC, búsqueda, RSS, dark mode, analytics, categorías) funcionales
- ✅ Sitio responsive y accesible
- ✅ Preparado para extender en Fase 2 (generación semiautomática)

---

## 2. Stack Técnico

| Componente | Tecnología | Razón |
|-----------|-----------|-------|
| **Generador estático** | 11ty (Eleventy) | Flexible, build rápido, JS-based para Fase 2 |
| **Contenido** | Markdown (markdown-it) | Estándar, simple, con plugins para tablas/código |
| **Estilos** | Tailwind CSS v3 | Utility-first, dark mode integrado, bajo overhead |
| **Búsqueda** | Lunr.js | Client-side, sin backend, index JSON generado |
| **Feed** | RSS 2.0 | Generado automáticamente por 11ty |
| **Dark Mode** | CSS + localStorage | Toggle nativo, sin frameworks pesados |
| **Analytics** | Google Analytics (opcional) | Token configurable en data files |
| **CI/CD** | GitHub Actions | Nativo, integración perfecta con Pages |
| **Hosting** | GitHub Pages | Gratuito, automático, sin costos operacionales |
| **Runtime** | Node.js 18+ | NPM ecosystem, mantenimiento simple |

---

## 3. Arquitectura General

### 3.1 Flujo de Publicación

```
Usuario escribe en local
    ↓
git push → GitHub
    ↓
GitHub Actions dispara workflow
    ↓
11ty build (src/ → _site/)
    ↓
Deploy a GitHub Pages (rama gh-pages)
    ↓
Sitio publicado en usuario.github.io/blog-repo/
```

**Tiempo total:** ~30-60 segundos desde push a online.

### 3.2 Estructura de Directorios

```
blog-repo/
│
├── .github/
│   └── workflows/
│       └── build-deploy.yml              # GitHub Actions workflow
│
├── src/
│   ├── _includes/                        # Plantillas Nunjucks
│   │   ├── layout.html                   # Layout base
│   │   ├── header.html                   # Header con nav
│   │   ├── footer.html                   # Footer
│   │   ├── nav.html                      # Navegación
│   │   ├── toc.html                      # Tabla de contenidos
│   │   └── post-card.html                # Card de artículo
│   │
│   ├── _data/                            # Data files (config)
│   │   ├── site.json                     # {title, author, url, etc}
│   │   ├── analytics.json                # {googleAnalyticsId}
│   │   └── navigation.json               # {links}
│   │
│   ├── css/
│   │   ├── main.css                      # Tailwind imports + custom
│   │   └── dark-mode.css                 # Dark mode utilities
│   │
│   ├── js/
│   │   ├── search.js                     # Lunr search + UI
│   │   ├── theme-toggle.js               # Dark mode toggle
│   │   └── toc-scroll.js                 # TOC scroll tracking (opcional)
│   │
│   ├── posts/                            # ARTÍCULOS
│   │   ├── 2026-10-06-titulo-slug/
│   │   │   ├── index.md                  # Artículo
│   │   │   └── images/
│   │   │       ├── image1.png
│   │   │       ├── image2.png
│   │   │       └── diagram.svg
│   │   │
│   │   └── 2026-10-01-otro-post/
│   │       ├── index.md
│   │       └── images/
│   │           └── screenshot.png
│   │
│   ├── index.html                        # Home (listado de posts)
│   ├── search.html                       # Página de búsqueda
│   ├── categories.html                   # Página de categorías
│   ├── tags.html                         # Página de tags
│   ├── rss.njk                           # RSS feed template
│   └── 404.html                          # Página 404
│
├── .eleventy.js                          # Configuración de 11ty
├── .eleventy.ignore                      # Archivos a ignorar
├── tailwind.config.js                    # Config Tailwind
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## 4. Formato de Artículos

### 4.1 Front Matter (Metadatos)

Cada `index.md` comienza con YAML front matter:

```markdown
---
title: "Cómo integrar Business Central con Power BI"
date: 2026-10-06
updated: 2026-10-06
author: "Tu Nombre"
description: "Guía paso a paso para conectar BC a PBI y crear reportes..."
categories: ["Business Central", "Power BI"]
tags: ["bc", "pbi", "integration", "tutorial", "dax"]
slug: "bc-pbi-integration"
---

# Título del Artículo

## Sección 1
...
```

**Campos obligatorios:**
- `title`: Título del artículo
- `date`: Fecha de publicación (YYYY-MM-DD)
- `categories`: Array de 1+ categorías
- `tags`: Array de 0+ tags

**Campos opcionales:**
- `updated`: Fecha de última actualización
- `author`: Nombre del autor (por defecto del site.json)
- `description`: Resumen corto (para preview)
- `featured`: `true` para destacar en home

### 4.2 Convenciones de Contenido

- **Imágenes:** `![Descripción](./images/nombre.png)` (rutas relativas)
- **Enlaces:** `[Texto](https://...)` (web) o `[Texto](/posts/otro-post/)` (internos)
- **Código:** ` ```language ` blocks con resaltado automático
- **Estructura:** H2 para secciones principales, H3 para subsecciones (genera TOC)

---

## 5. Features Implementadas

### 5.1 Tabla de Contenidos (TOC)

- **Generada automáticamente** del Markdown (H2, H3)
- **Ubicación:** Sidebar derecho o top (responsive)
- **Interactividad:** Scroll tracking (resalta sección actual)
- **Accesibilidad:** Links internos funcionales

### 5.2 Búsqueda Client-Side

- **Motor:** Lunr.js
- **Index:** JSON generado en build (pequeño, ~50KB típico)
- **Busca:** Títulos, contenido, categorías, tags, descripción
- **UI:** Página dedicada `/search/` con formulario + resultados dinámicos
- **Ventajas:** Sin backend, instant, privado

### 5.3 Categorías y Tags

- **Generadas automáticamente** del front matter
- **Páginas:** `/categories/business-central/`, `/tags/tutorial/`, etc.
- **Lista:** Todos los posts en esa categoría/tag con preview
- **Navegación cruzada:** Links en header/sidebar

### 5.4 RSS Feed

- **Ubicación:** `/feed.xml`
- **Contenido:** Título, descripción, contenido completo, fecha, autor, categorías
- **Formato:** RSS 2.0 válido
- **Actualización:** Automática con cada build

### 5.5 Dark Mode

- **Implementación:** Tailwind `dark:` classes + CSS personalizado
- **Toggle:** Button en header
- **Persistencia:** localStorage (`theme: 'dark' | 'light'`)
- **Sin JS pesado:** CSS puro, fallback a system preference
- **Cobertura:** UI completa + syntax highlighting en code blocks

### 5.6 Analytics (Opcional)

- **Servicio:** Google Analytics (GA4)
- **Token:** Configurable en `_data/analytics.json`
- **Tracking:** Pageviews automáticos
- **Sin invasión:** No bloquea render, async loading
- **Alternativa:** Fácil reemplazar por otra solución

### 5.7 Navegación

- **Header:** Logo + Nav + Toggle dark mode + Search
- **Sidebar:** (Mobile: collapsible) Con categorías, tags, posts recientes
- **Anterior/Siguiente:** En footer del post (orden cronológico)
- **Footer:** Links, redes, suscripción RSS

---

## 6. Configuración y Datos

### 6.1 site.json

```json
{
  "title": "Tech Blog - BC & Power BI",
  "description": "Artículos sobre Business Central y Power BI",
  "author": "Tu Nombre",
  "email": "tu@email.com",
  "url": "https://usuario.github.io/blog-repo/",
  "language": "es",
  "postsPerPage": 10,
  "recentPostsCount": 5
}
```

### 6.2 analytics.json

```json
{
  "googleAnalyticsId": "G-XXXXXXXXXX",
  "enabled": true
}
```

---

## 7. CI/CD - GitHub Actions

### 7.1 Workflow: build-deploy.yml

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
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build site
        run: npm run build

      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        uses: actions/deploy-pages@v3
        with:
          folder: _site
```

**Pasos:**
1. Checkout código
2. Setup Node.js 18
3. `npm ci` (instala deps exactas)
4. `npm run build` (11ty genera _site/)
5. Deploy a GitHub Pages (rama gh-pages automática)

**Tiempo total:** ~60 segundos

### 7.2 Configuración de GitHub Pages

En Settings del repo:
- **Source:** Deploy from a branch
- **Branch:** gh-pages (creada automáticamente por Actions)
- **Folder:** / (root de gh-pages)
- **Custom domain:** Opcional

---

## 8. Proceso de Publicación

### 8.1 Para publicar nuevo artículo

```bash
# 1. Crear estructura
mkdir -p src/posts/$(date +%Y-%m-%d)-titulo-slug/images

# 2. Crear index.md con template
cat > src/posts/2026-10-06-titulo-slug/index.md << 'EOF'
---
title: "Título del artículo"
date: 2026-10-06
categories: ["Business Central"]
tags: ["tag1", "tag2"]
description: "Breve descripción..."
---

# Título

Tu contenido aquí...
EOF

# 3. Agregar imágenes
cp /ruta/imagen.png src/posts/2026-10-06-titulo-slug/images/

# 4. Preview (opcional)
npm run dev
# Visitar http://localhost:8080

# 5. Publicar
git add .
git commit -m "feat: nuevo post sobre Business Central"
git push origin main

# ¡Listo! Publicado automáticamente en ~60 segundos
```

---

## 9. Extensibilidad (Fase 2 Preview)

**Preparado para extender:**

1. **CLI para crear posts:** Script Node.js que genera estructura + template
2. **Generación semiautomática:** Hook en 11ty que procesa datos externos (API, Notion, etc.)
3. **Comentarios:** Integración futura (Utterances, Giscus)
4. **Relacionados:** Posts similares por tag/categoría
5. **Author bios:** Múltiples autores con bios
6. **Newsletter:** Formulario integrado (Substack, Mailchimp, etc.)
7. **Social:** Share buttons + meta tags OG/Twitter

---

## 10. Requisitos Técnicos

**Para desarrollar localmente:**
- Node.js 18+ 
- NPM 8+
- Git

**Dependencias principales:**
- `@11ty/eleventy`: Generador
- `markdown-it`: Parser Markdown
- `tailwindcss`: Estilos
- `lunr`: Búsqueda
- `gray-matter`: Front matter parser

**Tamaño estimado:**
- Repo inicial: ~2MB (código + config)
- Node modules: ~500MB (ignorados en deploy)
- Site generado: ~5-10MB típico (escalable)
- Cada post: ~100-500KB (MD + imágenes)

---

## 11. Testing y Validación

**Pre-deploy:**
- `npm run build` sin errores
- `npm run dev` sirve correctamente
- Links internos válidos
- Imágenes cargadas
- Front matter parseado

**Post-deploy:**
- Sitio accesible en GitHub Pages
- RSS feed válido
- Búsqueda funciona
- Dark mode toggle funciona
- Mobile responsive

---

## 12. Decisiones Arquitectónicas Clave

| Decisión | Alternativa Rechazada | Razón |
|----------|----------------------|-------|
| **11ty** vs. Next.js/Hugo | Más complejidad innecesaria | 11ty = balance perfecto entre potencia y simplicidad |
| **Tailwind** vs. CSS custom | Menos consistencia, más trabajo | Tailwind = desarrollo rápido + utilities |
| **Lunr** vs. Algolia | Costo, dependencia externa | Lunr = offline, privado, sin backend |
| **Carpeta por post** vs. posts.json | Menos intuitivo | Estructura de carpetas = fácil de entender y mantener |
| **GitHub Pages** vs. Vercel/Netlify | Más flexible pero más overhead | Pages = integración nativa, gratis, simple |
| **Markdown** vs. CMS headless | Overkill para pequeña comunidad | Markdown = versionable, offline-first |

---

## 13. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|-----------|
| Build time crece con posts | Media | Incremental builds en 11ty, lazy image loading |
| Imágenes muy pesadas | Media | Compresión en workflow, guía en README |
| Búsqueda lenta con 100+ posts | Baja | Index pequeño (<500KB), client-side es rápido |
| Cambios en GitHub Pages | Baja | Estándar de facto, documentado |
| SEO limitado | Baja | Meta tags, sitemap.xml, RSS feed |

---

## 14. Próximos Pasos (Después del MVP)

1. **Fase 1 - MVP:** Infraestructura + 5-10 posts de prueba
2. **Fase 2 - Automatización:** CLI para crear posts, scripts de generación
3. **Fase 3 - Comunidad:** Comentarios, newsletter, social sharing
4. **Fase 4 - Analytics:** Dashboard de lectoría, trending posts

---

## 15. Definiciones de Éxito (Métricas)

- ✅ Build consistentemente < 1min
- ✅ Todos los posts con TOC funcional
- ✅ Búsqueda encuentra contenido en < 500ms
- ✅ Dark mode sin flashes
- ✅ RSS feed con 100% de posts
- ✅ Sitio funcional en mobile
- ✅ 0 broken links

