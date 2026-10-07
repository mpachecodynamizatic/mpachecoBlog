---
name: publicar-post
description: Publica un borrador revisado moviéndolo de draf\<post> (o src\draf\<post>) a su carpeta definitiva src/posts/AAAA-MM-DD-titulo-resumido/, quitando draft, poniendo la fecha de hoy y reescribiendo las rutas de imágenes para que funcionen en la nueva carpeta. Úsala siempre que el usuario diga "publica el post", "publicar-post", "/publicar-post post1", "pasa el borrador a posts", "mueve el post a su carpeta definitiva" o quiera dejar listo para el despliegue un borrador generado con revisar-post, aunque no mencione la skill.
argument-hint: <nombre-carpeta-dentro-de-draf, p.ej. post1>
---

# Publicar post

Convierte el borrador `draf\<post>` (el parámetro) en un post definitivo en `src/posts/`. El script `scripts/publicar_post.py` hace lo mecánico (carpeta, fecha, front matter, rutas); tú decides el nombre corto, validas el resultado y le cuentas al usuario qué ha pasado. Ten presente que quitar `draft: true` hace que el post salga en el siguiente despliegue a GitHub Pages, por eso hay una confirmación antes de mover.

## 1. Comprobar sin tocar nada

Desde la raíz del proyecto:

```bash
python .claude/skills/publicar-post/scripts/publicar_post.py <post> --dry-run
```

- **Código 2 / `stopped: verificar`**: quedan comentarios `<!-- VERIFICAR: ... -->`. Para aquí, lístalos al usuario y no muevas nada. Solo si el usuario confirma expresamente que quiere publicar igualmente, repite con `--ignore-verificar` (los comentarios no se ven en la web, pero conviene que los resuelva).
- **`error`** (no existe el borrador, falta `index.md`, imágenes referenciadas que no existen): cuéntalo y pregunta; no adivines.

## 2. Elegir el nombre corto

El nombre de la carpeta es `AAAA-MM-DD-slug` con la fecha de hoy. Propón tú el slug: 3-5 palabras, minúsculas, sin acentos ni artículos, que resuman el tema (por ejemplo, para "Cómo transferir inventario entre ubicaciones en Business Central" → `transferir-inventario-ubicaciones`). El slug acaba en la URL pública, así que conviene que sea corto y estable: cambiarlo después rompe los enlaces que ya se hayan compartido.

## 3. Confirmar

Pregunta al usuario (una sola vez) mostrando: carpeta destino, título, que se quitará `draft: true`, la fecha que se pondrá y que **se borrará la carpeta del borrador completa, incluido el Word original**. Espera un sí claro: el borrado no se puede deshacer desde aquí.

## 4. Publicar

```bash
python .claude/skills/publicar-post/scripts/publicar_post.py <post> --slug <slug> --delete-source
```

Qué hace el script: crea `src/posts/AAAA-MM-DD-slug/` con `index.md` e `images/`; pone `date` a hoy; elimina `draft`; convierte cualquier ruta que apunte al borrador (`draf/<post>/...`, `src/draf/<post>/...`) o a `images/...` en `./images/...`, que es relativa a la carpeta del post y por tanto funciona donde esté; y borra el origen.

## 5. Verificar

Ejecuta `npm run build` y comprueba que existen `_site/posts/AAAA-MM-DD-slug/index.html` y las imágenes en `_site/posts/AAAA-MM-DD-slug/images/`. Si el build falla (por ejemplo, un tag cuyo slug choca con otro), cuéntalo y propón el arreglo en lugar de dejarlo a medias.

## 6. Cerrar

Resume en pocas líneas: carpeta nueva, cambios de rutas, resultado del build. No hagas commit ni push; indica qué archivos añadir (`src/posts/AAAA-MM-DD-slug/`) y recuerda que el push a `main` es lo que publica la web. Si la rama local no es `main`, avísalo, porque el workflow solo se dispara con `main`.
