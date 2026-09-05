"""Projections menuiseries Pereira : redimensionne, légende obligatoire, copies galerie."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ASSETS = Path(
    r"C:\Users\lembe\.cursor\projects\c-Users-lembe-energia-conseil-site-energia-conseil-site\assets"
)
ROOT = Path(__file__).resolve().parents[1] / "public" / "test-maison-pereira"

TITRE = "Après — projection visuelle indicative du remplacement de la menuiserie (Matériau : PVC)"
DISCLAIMER = (
    "Image simulée — ne constitue pas une photo réelle après travaux, "
    "une mesure thermique, un relevé définitif ou un engagement de résultat."
)

# index, categorie, source generated, avant file, dest projection, dest galerie avant, dest galerie apres
JOBS = [
    (
        1,
        "fenetre",
        "pereira-menuiserie-fenetre-baie-encastree.png",
        "interieur-baie-encastree.jpg",
        "projection-menuiserie-pvc-baie-encastree.jpg",
    ),
    (
        2,
        "fenetre",
        "pereira-menuiserie-fenetre-evier.png",
        "interieur-evier.jpg",
        "projection-menuiserie-pvc-evier.jpg",
    ),
    (
        3,
        "fenetre",
        "pereira-menuiserie-fenetre-etagere.png",
        "interieur-etagere.jpg",
        "projection-menuiserie-pvc-etagere.jpg",
    ),
    (
        4,
        "fenetre",
        "pereira-menuiserie-fenetre-coin-radiateur.png",
        "interieur-coin-radiateur.jpg",
        "projection-menuiserie-pvc-coin-radiateur.jpg",
    ),
    (
        5,
        "fenetre",
        "pereira-menuiserie-fenetre-facade-porche.png",
        "facade-porche.png",
        "projection-menuiserie-pvc-facade-porche.jpg",
    ),
    (
        6,
        "porte-fenetre",
        "pereira-menuiserie-porte-fenetre-voliere.png",
        "interieur-voliere.jpg",
        "projection-menuiserie-pvc-porte-fenetre-voliere.jpg",
    ),
    (
        7,
        "porte-entree",
        "pereira-menuiserie-porte-entree-facade.png",
        "facade-angle.png",
        "projection-menuiserie-pvc-porte-entree-facade.jpg",
    ),
]


def font(name: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(name, size)
    except OSError:
        return ImageFont.load_default()


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.ImageFont, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=fnt) <= max_w:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def to_rgb(im: Image.Image) -> Image.Image:
    if im.mode == "RGB":
        return im
    if im.mode in ("RGBA", "LA"):
        bg = Image.new("RGB", im.size, (15, 23, 42))
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert("RGB")


def label(im: Image.Image) -> Image.Image:
    base = im.convert("RGBA")
    w, h = base.size
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay, "RGBA")
    title_f = font("arialbd.ttf", max(16, w // 48))
    body_f = font("arial.ttf", max(13, w // 56))
    banner_h = max(108, int(h * 0.18))
    d.rectangle([0, h - banner_h, w, h], fill=(15, 23, 42, 220))
    d.rectangle([0, 0, w, 48], fill=(15, 23, 42, 200))
    d.text((14, 12), TITRE, font=title_f, fill=(253, 224, 71, 255))
    title_lines = wrap(d, TITRE, title_f, w - 28)
    disc_lines = wrap(d, DISCLAIMER, body_f, w - 28)
    ty = h - banner_h + 12
    for line in title_lines:
        d.text((14, ty), line, font=title_f, fill=(253, 224, 71, 255))
        ty += int(title_f.size * 1.3)
    ty += 4
    for line in disc_lines:
        d.text((14, ty), line, font=body_f, fill=(226, 232, 240, 255))
        ty += int(body_f.size * 1.25)
    return Image.alpha_composite(base, overlay).convert("RGB")


def save_jpeg(im: Image.Image, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, format="JPEG", quality=90, optimize=True)


def main() -> None:
    dest_dir = ROOT / "projections"
    galerie = ROOT / "galerie"
    dest_dir.mkdir(parents=True, exist_ok=True)
    galerie.mkdir(parents=True, exist_ok=True)
    for index, _cat, src_name, avant_name, dest_name in JOBS:
        src = ASSETS / src_name
        avant = ROOT / "avant" / avant_name
        if not src.exists():
            raise FileNotFoundError(src)
        if not avant.exists():
            raise FileNotFoundError(avant)
        avant_im = to_rgb(Image.open(avant))
        im = to_rgb(Image.open(src))
        im = im.resize(avant_im.size, Image.Resampling.LANCZOS)
        out = label(im)
        dest = dest_dir / dest_name
        save_jpeg(out, dest)
        pad = str(index).zfill(2)
        save_jpeg(avant_im, galerie / f"avant-menuiserie-{pad}.jpg")
        save_jpeg(out, galerie / f"apres-menuiserie-{pad}.jpg")
        print("saved", dest.name, out.size, "galerie", pad)


if __name__ == "__main__":
    main()
