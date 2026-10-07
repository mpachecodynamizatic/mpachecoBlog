#!/usr/bin/env python3
"""Extrae titulo, categoria, texto e imagenes de un .docx de draf/<post>.

Uso: python extraer_docx.py <carpeta-post>
Escribe las imagenes en <carpeta-post>/images/imagen-NN.ext (orden del documento)
e imprime un JSON con title, category, body (Markdown) e images.
"""
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

IMG_MD = re.compile(r'!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)(?:\{[^}]*\})?')
IMG_HTML = re.compile(r'<img\b[^>]*?>', re.I)
CAT_LINE = re.compile(r'^\s*(?:\*\*|__)?\s*categor[ií]a\s*(?:\*\*|__)?\s*:\s*(?:\*\*|__)?\s*(.+?)\s*(?:\*\*|__)?\s*$', re.I)


sys.stdout.reconfigure(encoding="utf-8")


def fail(msg):
    print(json.dumps({"error": msg}, ensure_ascii=False))
    sys.exit(1)


def sniff_ext(data):
    # Word often stores BMP/EMF data under a .png name; trust the bytes, not the name.
    if data.startswith(b"\x89PNG"):
        return ".png"
    if data.startswith(b"\xff\xd8"):
        return ".jpeg"
    if data.startswith(b"GIF8"):
        return ".gif"
    if data.startswith(b"BM"):
        return ".bmp"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    if b"<svg" in data[:512]:
        return ".svg"
    return None


def clean_title(raw):
    t = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', raw)
    t = re.sub(r'[*_`]+', '', t).strip()
    t = re.sub(r'^t[ií]tulo\s*:\s*', '', t, flags=re.I).strip()
    return t


def attr(tag, name):
    m = re.search(name + r'\s*=\s*"([^"]*)"', tag, re.I)
    return m.group(1) if m else ""


def main():
    if len(sys.argv) != 2:
        fail("Uso: extraer_docx.py <carpeta-post>")
    folder = Path(sys.argv[1])
    if not folder.is_dir():
        fail(f"No existe la carpeta {folder}")
    docs = sorted(p for p in folder.glob("*.docx") if not p.name.startswith("~$"))
    if len(docs) != 1:
        fail(f"Se esperaba un unico .docx en {folder} y hay {len(docs)}: {[d.name for d in docs]}")
    if not shutil.which("pandoc"):
        fail("pandoc no esta instalado o no esta en el PATH")

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        proc = subprocess.run(
            ["pandoc", str(docs[0]), "-t", "markdown", "-s", "--wrap=none",
             "--extract-media=" + str(tmp), "-o", str(tmp / "out.md")],
            capture_output=True, text=True)
        if proc.returncode != 0:
            fail("pandoc fallo: " + proc.stderr.strip())
        text = (tmp / "out.md").read_text(encoding="utf-8")

        title = ""
        m = re.match(r'---\s*\n(.*?)\n---\s*\n', text, re.S)
        if m:
            tm = re.search(r'^title:\s*(.+)$', m.group(1), re.M)
            if tm:
                title = tm.group(1).strip().strip('"\'')
            text = text[m.end():]

        images = []
        counter = [0]

        def store(src, alt):
            src_path = Path(src)
            if not src_path.is_absolute():
                src_path = tmp / src
            if not src_path.exists():
                matches = list(tmp.rglob(Path(src).name))
                if not matches:
                    return None
                src_path = matches[0]
            counter[0] += 1
            data = src_path.read_bytes()
            ext = sniff_ext(data) or src_path.suffix.lower()
            dest = folder / "images"
            dest.mkdir(exist_ok=True)
            if ext == ".bmp":
                try:
                    from PIL import Image
                    name = f"imagen-{counter[0]:02d}.png"
                    Image.open(src_path).save(dest / name, "PNG", optimize=True)
                except Exception:
                    name = f"imagen-{counter[0]:02d}.bmp"
                    (dest / name).write_bytes(data)
            else:
                name = f"imagen-{counter[0]:02d}{ext}"
                (dest / name).write_bytes(data)
            images.append({"file": f"images/{name}", "alt_original": alt})
            return f"![{alt}](images/{name})"

        def repl_md(mo):
            return store(mo.group(2), mo.group(1)) or mo.group(0)

        def repl_html(mo):
            return store(attr(mo.group(0), "src"), attr(mo.group(0), "alt")) or mo.group(0)

        text = IMG_HTML.sub(repl_html, text)
        text = IMG_MD.sub(repl_md, text)

        category = ""
        lines = []
        for line in text.splitlines():
            cm = CAT_LINE.match(line)
            if cm and not category:
                category = cm.group(1).strip()
                continue
            lines.append(line)
        body = "\n".join(lines).strip()

        if not title:
            hm = re.search(r'^#\s+(.+)$', body, re.M)
            if hm:
                title = hm.group(1).strip()
                body = (body[:hm.start()] + body[hm.end():]).strip()
            else:
                for line in body.splitlines():
                    if line.strip() and not line.startswith("!["):
                        title = line.strip().lstrip("#").strip()
                        body = body.replace(line, "", 1).strip()
                        break

        title = clean_title(title)
        # The Word often repeats the title as a bold line in the body; drop it.
        out = []
        dropped = False
        for line in body.splitlines():
            if not dropped and title and clean_title(line) == title:
                dropped = True
                continue
            out.append(line)
        body = "\n".join(out).strip()
        body = re.sub(r'\n{3,}', '\n\n', body)
        print(json.dumps({"source": docs[0].name, "title": title, "category": category,
                          "images": images, "body": body}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
