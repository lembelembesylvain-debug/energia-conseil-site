"""Copie les projections réalistes Pereira et appose les mentions obligatoires."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ASSETS = Path(r"C:\Users\lembe\.cursor\projects\c-Users-lembe-energia-conseil-site-energia-conseil-site\assets")
ROOT = Path(__file__).resolve().parents[1] / "public" / "test-maison-pereira"

JOBS = [
    ("pereira-apres-voliere.png", "interieur-voliere.jpg", "projection-realiste-iti-voliere.jpg"),
    ("pereira-apres-fenetre.png", "interieur-fenetre.jpg", "projection-realiste-iti-fenetre.jpg"),
    ("pereira-apres-evier.png", "interieur-evier.jpg", "projection-realiste-iti-evier.jpg"),
    ("pereira-apres-frigo.png", "interieur-frigo.jpg", "projection-realiste-iti-frigo.jpg"),
    ("pereira-apres-etagere.png", "interieur-etagere.jpg", "projection-realiste-iti-etagere.jpg"),
    ("pereira-apres-voliere-baie.png", "interieur-voliere-baie.jpg", "projection-realiste-iti-voliere-baie.jpg"),
    ("pereira-apres-coin-radiateur.png", "interieur-coin-radiateur.jpg", "projection-realiste-iti-coin-radiateur.jpg"),
    ("pereira-apres-stockage.png", "interieur-stockage.jpg", "projection-realiste-iti-stockage.jpg"),
    ("pereira-apres-loire.png", "interieur-loire.jpg", "projection-realiste-iti-loire.jpg"),
    ("pereira-apres-baie-encastree.png", "interieur-baie-encastree.jpg", "projection-realiste-iti-baie-encastree.jpg"),
]

TITRE = "Après — projection visuelle indicative de l’ITI 12 cm"
DISCLAIMER = (
    "Image simulée — ne constitue pas une photo réelle après travaux, "
    "une mesure thermographique ou un engagement de résultat."
)


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


def label(im: Image.Image) -> Image.Image:
    base = im.convert("RGBA")
    w, h = base.size
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay, "RGBA")
    title_f = font("arialbd.ttf", max(18, w // 42))
    body_f = font("arial.ttf", max(14, w // 52))
    banner_h = max(96, int(h * 0.16))
    d.rectangle([0, h - banner_h, w, h], fill=(15, 23, 42, 220))
    d.rectangle([0, 0, w, 44], fill=(15, 23, 42, 200))
    d.text((14, 12), TITRE, font=title_f, fill=(253, 224, 71, 255))
    lines = wrap(d, DISCLAIMER, body_f, w - 28)
    ty = h - banner_h + 14
    d.text((14, ty), TITRE, font=title_f, fill=(253, 224, 71, 255))
    ty += int(title_f.size * 1.35)
    for line in lines:
        d.text((14, ty), line, font=body_f, fill=(226, 232, 240, 255))
        ty += int(body_f.size * 1.25)
    return Image.alpha_composite(base, overlay).convert("RGB")


def main() -> None:
    dest_dir = ROOT / "projections"
    dest_dir.mkdir(parents=True, exist_ok=True)
    for src_name, avant_name, dest_name in JOBS:
        src = ASSETS / src_name
        avant = ROOT / "avant" / avant_name
        if not src.exists():
            raise FileNotFoundError(src)
        im = Image.open(src).convert("RGB")
        if avant.exists():
            target = Image.open(avant).size
            im = im.resize(target, Image.Resampling.LANCZOS)
        out = label(im)
        dest = dest_dir / dest_name
        out.save(dest, quality=90)
        print("saved", dest.name, out.size)


if __name__ == "__main__":
    main()
