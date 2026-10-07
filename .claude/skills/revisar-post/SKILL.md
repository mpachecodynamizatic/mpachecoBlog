---
name: revisar-post
description: Convierte un borrador en Word (.docx) de la carpeta draf\<post> en una propuesta de artículo lista para el blog (index.md con front matter de 11ty + images/), extrayendo las imágenes y reescribiendo los textos en un estilo claro, cercano y profesional. Úsala siempre que el usuario diga "revisa el post", "revisar-post", "/revisar-post post1", "procesa el borrador/word de draf", "convierte el docx en artículo" o pida preparar un post a partir de un Word, aunque no mencione la skill.
argument-hint: <nombre-carpeta-dentro-de-draf, p.ej. post1>
---

# Revisar post desde Word

Toma el Word de `draf\<post>\` (el parámetro) y genera en la misma carpeta una propuesta de post con la estructura de `src/posts/`. El Word solo trae título, categoría, imágenes y textos con la información; tu trabajo es pulir esos textos para que se lean bien sin inventar contenido técnico.

## 1. Extraer

Ejecuta desde la raíz del proyecto (el argumento es el nombre de la carpeta, no la ruta):

```bash
python .claude/skills/revisar-post/scripts/extraer_docx.py draf/<post>
```

Devuelve un JSON con `title`, `category`, `images` (ya copiadas a `draf/<post>/images/imagen-01.ext`, `imagen-02.ext`... en el orden del documento) y `body` (Markdown con las imágenes ya enlazadas).

- Si devuelve `error` (no hay `.docx`, hay varios, falta pandoc), cuéntalo y pregunta; no adivines.
- Si `title` o `category` vienen vacíos, pregúntalo al usuario. La categoría se escribe en el Word como línea `Categoría: X`. Sé coherente con las que ya usa el blog (hoy `Business Central` y `Power BI`).

## 2. Reescribir los textos

Escribe en español, de tú, con un tono cercano y profesional: frases cortas, voz activa, explica el porqué de cada paso y evita jerga innecesaria. Usa los nombres oficiales de producto (Business Central, Power BI Desktop, DAX). Antes de escribir, mira `src/posts/*/index.md` para alinear el estilo con los artículos publicados.

Puedes: ordenar en secciones con `##`/`###` (nunca `#`: el título viene del front matter), añadir una introducción breve y un cierre, enlazar ideas con transiciones, aclarar conceptos y convertir pasos sueltos en listas numeradas. Los bloques de código llevan el lenguaje indicado.

No debes inventar cifras, nombres de menús o campos, pasos del producto, versiones ni citas. Si para completar una idea hace falta un dato que no está en el Word, deja `<!-- VERIFICAR: qué dato falta o qué se asumió -->` en ese punto. Esto es lo más importante: el autor publicará esto bajo su nombre, y un error técnico sobre Business Central o Power BI pesa mucho más que un párrafo menos pulido.

## 3. Imágenes

- Conserva el orden y los nombres `imagen-NN` que dejó el script.
- Redacta un texto alternativo descriptivo (qué muestra la imagen y por qué importa en ese punto) en lugar del `alt` original si este está vacío o es genérico.
- Si una imagen queda sin contexto claro, mantenla donde estaba y anótalo en el resumen final.
- La primera imagen se usa como portada (`image:` del front matter).

## 4. Generar `draf/<post>/index.md`

Si el archivo ya existe, pregunta antes de sobrescribirlo. Estructura exacta:

```markdown
---
title: "<título>"
date: <AAAA-MM-DD de hoy>
categories: ["<categoría>"]
tags: ["<3-5 tags en minúsculas>"]
image: ./images/imagen-01.<ext>
description: "<~150 caracteres, sin comillas dobles>"
draft: true
---

<cuerpo>
```

- Tags: reutiliza los que ya existen en `src/posts/*/index.md` cuando encajen; añade solo los nuevos necesarios. No uses `posts`, `categories`, `tags` ni `all` (chocan con rutas del sitio), y evita tags cuyo slug coincida con otro distinto (por ejemplo `C#` y `C++`).
- Las rutas de imagen dentro del cuerpo son `./images/imagen-NN.ext` (el script las deja como `images/...`: ajústalas al formato `./images/`).
- Sin `image:` si el documento no tenía imágenes.

## 5. Cerrar

No modifiques el `.docx`, no toques `src/posts/` ni hagas commit. Termina con un resumen corto: qué se escribió, cuántas imágenes se extrajeron, lista de los `VERIFICAR` pendientes, imágenes con contexto dudoso y la carpeta final sugerida `src/posts/AAAA-MM-DD-slug/` con el comando para moverla, para que el usuario decida cuándo publicarla (quitando `draft: true`).
