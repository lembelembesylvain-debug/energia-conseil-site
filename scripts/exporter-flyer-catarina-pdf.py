"""Export BAT imprimeur du flyer Catarina (154 x 216 mm, fond perdu 3 mm) + PNG HD."""
from pathlib import Path
import subprocess
import sys

root = Path(__file__).resolve().parents[1]
html = root / "templates" / "marketing" / "flyer_A5_catarina_valorisation.html"
out_dir = root / "templates" / "marketing"
pdf = out_dir / "flyer_A5_catarina_valorisation.pdf"
recto_png = out_dir / "flyer_A5_catarina_recto.png"
verso_png = out_dir / "flyer_A5_catarina_verso.png"
url = html.resolve().as_uri()

candidates = [
    Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
    Path(r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"),
    Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
]
browser = next((p for p in candidates if p.is_file()), None)
if not browser:
    print("Navigateur introuvable", file=sys.stderr)
    sys.exit(1)

cmd = [
    str(browser),
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    "--hide-scrollbars",
    "--virtual-time-budget=8000",
    f"--print-to-pdf={pdf}",
    url,
]
print(" ".join(cmd))
subprocess.run(cmd, check=True)
print("PDF", pdf, "size", pdf.stat().st_size if pdf.is_file() else 0)

import fitz

doc = fitz.open(pdf)
if doc.page_count != 2:
    raise SystemExit(f"Le PDF doit contenir 2 pages (recto/verso), trouvé : {doc.page_count}")

matrix = fitz.Matrix(300 / 72, 300 / 72)
pix0 = doc[0].get_pixmap(matrix=matrix, alpha=False)
pix1 = doc[1].get_pixmap(matrix=matrix, alpha=False)
pix0.save(str(recto_png))
pix1.save(str(verso_png))
print("PNG recto", recto_png, pix0.width, "x", pix0.height)
print("PNG verso", verso_png, pix1.width, "x", pix1.height)

blob = " ".join(
    [
        str(doc.metadata),
        doc[0].get_text("text"),
        doc[1].get_text("text"),
    ]
).lower()
forbidden = ("iad france", "iadfrance", "iad immobilier", " | iad", "tous droits réservés")
hits = [w for w in forbidden if w in blob]
if "iad" in blob.replace("energia", ""):
    hits.append("iad")
hits = list(dict.fromkeys(hits))
if hits:
    raise SystemExit(f"Occurrence IAD encore présente dans le PDF : {hits}")

print("Controle IAD : OK")
print("meta title", doc.metadata.get("title"))
full = doc[0].get_text("text") + doc[1].get_text("text")
print("Email", "contact@catarinamartins-immobilier.fr" in full)
print("Site", "catarinamartins-immobilier.fr" in full)
print("Indépendante", "indépendante" in full.lower() or "independante" in full.lower())
doc.close()
