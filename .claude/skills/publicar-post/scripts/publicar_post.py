#!/usr/bin/env python3
"""Mueve un borrador de draf/<post> a src/posts/AAAA-MM-DD-slug/.

Uso (desde la raiz del proyecto):
  python publicar_post.py <post> [--slug SLUG] [--date AAAA-MM-DD] [--ignore-verificar] [--delete-source] [--dry-run]

- Busca el borrador en draf/<post> o src/draf/<post>.
- Se detiene (exit 2) si quedan comentarios VERIFICAR, salvo --ignore-verificar.
- Pone date = hoy, quita draft y reescribe las rutas de imagenes a ./images/.
- Con --delete-source borra la carpeta del borrador tras mover (incluido el .docx).
Imprime un JSON con el resultado.
"""
import argparse
import datetime
import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

STOP = {"de", "del", "la", "el", "los", "las", "en", "entre", "con", "para", "y", "a", "un", "una",
        "por", "que", "como", "al", "se", "su", "sus", "o", "e"}
VERIFICAR = re.compile(r'<!--\s*VERIFICAR\b.*?-->', re.S | re.I)
FM = re.compile(r'\A---\r?\n(.*?)\r?\n---\r?\n', re.S)


def out(obj, code=0):
    print(json.dumps(obj, ensure_ascii=False, indent=2))
    sys.exit(code)


def slugify(text):
    t = unicodedata.normalize("NFD", text)
    t = "".join(c for c in t if unicodedata.category(c) != "Mn").lower()
    words = [w for w in re.findall(r"[a-z0-9]+", t) if w not in STOP]
    return "-".join(words[:6])[:50].strip("-")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("post")
    ap.add_argument("--slug")
    ap.add_argument("--date")
    ap.add_argument("--ignore-verificar", action="store_true")
    ap.add_argument("--delete-source", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    if not re.fullmatch(r"[\w.-]+", a.post):
        out({"error": "El parametro debe ser el nombre de la carpeta (p.ej. post1), no una ruta"}, 1)

    candidates = [Path("draf") / a.post, Path("src") / "draf" / a.post]
    src = next((c for c in candidates if c.is_dir()), None)
    if not src:
        out({"error": f"No existe el borrador: se buscó en {[str(c) for c in candidates]}"}, 1)
    index = src / "index.md"
    if not index.is_file():
        out({"error": f"Falta {index}. Genera antes la propuesta con /revisar-post {a.post}"}, 1)

    raw = index.read_bytes().decode("utf-8")
    nl = "\r\n" if "\r\n" in raw else "\n"
    m = FM.match(raw)
    if not m:
        out({"error": "index.md no empieza con front matter YAML (---)"}, 1)

    pending = [re.sub(r"\s+", " ", v).strip() for v in VERIFICAR.findall(raw)]
    if pending and not a.ignore_verificar:
        out({"stopped": "verificar", "pending": pending,
             "message": "Quedan comentarios VERIFICAR sin resolver; no se ha movido nada."}, 2)

    fm_text = m.group(1)
    body = raw[m.end():]
    tm = re.search(r'^title:\s*(.+)$', fm_text, re.M)
    title = tm.group(1).strip().strip('"\'') if tm else ""
    today = a.date or datetime.date.today().isoformat()
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", today):
        out({"error": "--date debe ser AAAA-MM-DD"}, 1)
    slug = slugify(a.slug) if a.slug else slugify(title)
    if not slug:
        out({"error": "No se pudo derivar un slug; indica --slug"}, 1)
    target = Path("src") / "posts" / f"{today}-{slug}"
    if target.exists():
        out({"error": f"Ya existe {target}; elige otro --slug"}, 1)

    # Internal references: anything pointing at the draft folder or a bare images/ path
    # becomes ./images/ so it resolves from the final post folder.
    draft_ref = re.compile(r'(?:\.{0,2}/)?(?:src/)?draf/' + re.escape(a.post) + r'/')
    changes = []

    def fix_ref(path):
        new = draft_ref.sub("", path)
        new = re.sub(r'^(?:\./)?images/', "./images/", new)
        if new != path:
            changes.append(f"{path} -> {new}")
        return new

    fm_new = fm_text
    fm_new = re.sub(r'^date:.*$', f"date: {today}", fm_new, flags=re.M) if re.search(r'^date:', fm_new, re.M) \
        else fm_new + nl + f"date: {today}"
    fm_new = re.sub(r'^draft:.*(?:\r?\n|$)', "", fm_new, flags=re.M).rstrip("\r\n")
    fm_new = re.sub(r'^(image:\s*)(\S+)\s*$', lambda mo: mo.group(1) + fix_ref(mo.group(2)), fm_new, flags=re.M)

    body = re.sub(r'(!\[[^\]]*\]\()([^)\s]+)(\))', lambda mo: mo.group(1) + fix_ref(mo.group(2)) + mo.group(3), body)
    body = re.sub(r'(<img\b[^>]*?\bsrc=")([^"]+)(")', lambda mo: mo.group(1) + fix_ref(mo.group(2)) + mo.group(3), body)
    body = re.sub(r'(?<!\!)(\[[^\]]*\]\()((?:\.{0,2}/)?(?:src/)?draf/[^)\s]+)(\))',
                  lambda mo: mo.group(1) + fix_ref(mo.group(2)) + mo.group(3), body)

    new_text = "---" + nl + fm_new + nl + "---" + nl + body

    # Every local reference must exist in the final folder.
    refs = re.findall(r'^image:\s*(\S+)', fm_new, re.M) + re.findall(r'!\[[^\]]*\]\(([^)\s]+)\)', body) \
        + re.findall(r'<img\b[^>]*?\bsrc="([^"]+)"', body)
    missing = [r for r in dict.fromkeys(refs)
               if not re.match(r'^(?:[a-z][a-z0-9+.-]*:|//|/)', r, re.I) and not (src / r).exists()]

    result = {"source": str(src), "target": str(target), "date": today, "slug": slug,
              "title": title, "removed_draft": bool(re.search(r'^draft:', fm_text, re.M)),
              "reference_changes": changes, "missing_files": missing,
              "ignored_verificar": pending if pending else []}
    if missing:
        result["error"] = "Hay referencias a archivos que no existen; no se ha movido nada"
        out(result, 1)
    if a.dry_run:
        result["dry_run"] = True
        out(result)

    target.mkdir(parents=True)
    (target / "index.md").write_bytes(new_text.encode("utf-8"))
    if (src / "images").is_dir():
        shutil.copytree(src / "images", target / "images")
    result["moved"] = sorted(str(p.relative_to(target)).replace("\\", "/") for p in target.rglob("*") if p.is_file())
    if a.delete_source:
        shutil.rmtree(src)
        result["deleted_source"] = str(src)
    out(result)


if __name__ == "__main__":
    main()
