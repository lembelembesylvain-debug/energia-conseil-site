"""
Identité visuelle centrale ENERGIA CONSEIL IA® (CRM).

Le logo officiel unique est `scripts_ia/assets/LOGO.png`.
Ce module ne recopie pas le fichier dans les dossiers clients.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Callable, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader

PROJECT_ROOT = Path(__file__).resolve().parent.parent
_SCRIPTS_IA_LOGO = Path(r"C:\scripts_ia\assets\LOGO.png")
_LOCAL_LOGO = PROJECT_ROOT / "public" / "assets" / "LOGO.png"
LOGO_PATH = _SCRIPTS_IA_LOGO if _SCRIPTS_IA_LOGO.is_file() else _LOCAL_LOGO

NOM = "ENERGIA CONSEIL IA®"
SLOGAN = "Audit Énergétique Intelligence Artificielle"
ADRESSE = "16 Rue Cuvier, 69006 Lyon"
TELEPHONE = "06 10 59 68 98"
EMAIL = "contact@energia-conseil-ia.com"
SITE = "www.energia-conseil-ia.com"
SIRET = "94181942700019"
SIRET_AFFICHE = "941 819 427 00019"
RCS = "Lyon 941 819 427"
FORME = "SASU"
CAPITAL = "100 €"
INPI = "5213845"
APE = "7112B"
TVA = "FR01941819427"
MENTION_PI = (
    "Algorithmes de modélisation thermique et méthodologie d'audit propriétaires protégés "
    "par le droit d'auteur (Code de la propriété intellectuelle). Plateforme exploitée sous "
    "licence de marque exclusive ENERGIA CONSEIL IA®. Reproduction et diffusion interdites "
    "sans autorisation."
)

COORDONNEES = {
    "nom": NOM,
    "slogan": SLOGAN,
    "adresse": ADRESSE,
    "telephone": TELEPHONE,
    "email": EMAIL,
    "site": SITE,
    "siret": SIRET,
    "rcs": RCS,
    "forme": FORME,
    "capital": CAPITAL,
}

COULEURS = {
    "primary": "#0F172A",
    "secondary": "#10B981",
    "accent": "#0F766E",
    "alert": "#F97316",
    "bg_light": "#F8FAFC",
    "text_dark": "#1E293B",
    "text_muted": "#64748B",
    "white": "#FFFFFF",
    "border": "#E2E8F0",
}

PRIMARY = colors.HexColor(COULEURS["primary"])
SECONDARY = colors.HexColor(COULEURS["secondary"])
ACCENT = colors.HexColor(COULEURS["accent"])
ALERT = colors.HexColor(COULEURS["alert"])
BG_LIGHT = colors.HexColor(COULEURS["bg_light"])
TEXT_DARK = colors.HexColor(COULEURS["text_dark"])
TEXT_MUTED = colors.HexColor(COULEURS["text_muted"])
WHITE = colors.HexColor(COULEURS["white"])
BORDER = colors.HexColor(COULEURS["border"])

LIGNES_PIED = (
    f"{NOM} — Marque déposée et protégée INPI n° {INPI}",
    f"SASU au capital de {CAPITAL} — RCS {RCS} — SIRET : {SIRET_AFFICHE}",
    f"Code APE / NAF : {APE} (Ingénierie, études techniques) — N° TVA Intracommunautaire : {TVA}",
    f"Siège social : {ADRESSE}",
    MENTION_PI,
)
PIED_DE_PAGE = " — ".join(LIGNES_PIED)

HEADER_LOGO_MAX_W = 42 * mm
HEADER_LOGO_MAX_H = 18 * mm
FOOTER_LOGO_MAX_W = 22 * mm
FOOTER_LOGO_MAX_H = 9 * mm
COVER_LOGO_MAX_W = 52 * mm
COVER_LOGO_MAX_H = 30 * mm

HEADER_HEIGHT = 24 * mm
FOOTER_HEIGHT = 32 * mm
DOC_TOP_MARGIN = 28 * mm
DOC_BOTTOM_MARGIN = 36 * mm


@lru_cache(maxsize=1)
def logo_reader() -> ImageReader:
    if not LOGO_PATH.is_file():
        raise FileNotFoundError(f"Logo officiel introuvable : {LOGO_PATH}")
    return ImageReader(str(LOGO_PATH))


def logo_natural_size() -> tuple[int, int]:
    width, height = logo_reader().getSize()
    return int(width), int(height)


def fit_logo(max_width: float, max_height: float) -> tuple[float, float]:
    iw, ih = logo_natural_size()
    if iw <= 0 or ih <= 0:
        return max_width, max_height
    ratio = ih / float(iw)
    width = max_width
    height = width * ratio
    if height > max_height:
        height = max_height
        width = height / ratio
    return width, height


def draw_logo(canvas, x: float, y: float, max_width: float, max_height: float) -> tuple[float, float]:
    width, height = fit_logo(max_width, max_height)
    canvas.drawImage(
        logo_reader(),
        x,
        y,
        width=width,
        height=height,
        mask="auto",
        preserveAspectRatio=True,
        anchor="sw",
    )
    return width, height


def _draw_wrapped(canvas, texte: str, x: float, y: float, max_width: float, font_size: float, leading: float) -> float:
    canvas.setFont("Helvetica", font_size)
    mots = texte.split()
    ligne = ""
    for mot in mots:
        candidat = mot if not ligne else f"{ligne} {mot}"
        if canvas.stringWidth(candidat, "Helvetica", font_size) <= max_width:
            ligne = candidat
            continue
        if ligne:
            canvas.drawString(x, y, ligne)
            y -= leading
        ligne = mot
    if ligne:
        canvas.drawString(x, y, ligne)
        y -= leading
    return y


def draw_page_chrome(
    canvas,
    doc,
    *,
    titre_document: str = "",
    mention: str | None = None,
) -> None:
    canvas.saveState()
    page_w, page_h = A4

    canvas.setFillColor(WHITE)
    canvas.rect(0, page_h - HEADER_HEIGHT, page_w, HEADER_HEIGHT, fill=1, stroke=0)

    logo_w, logo_h = fit_logo(HEADER_LOGO_MAX_W, HEADER_LOGO_MAX_H)
    logo_y = page_h - HEADER_HEIGHT + (HEADER_HEIGHT - logo_h) / 2.0
    draw_logo(canvas, 14 * mm, logo_y, HEADER_LOGO_MAX_W, HEADER_LOGO_MAX_H)

    canvas.setFillColor(PRIMARY)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawRightString(page_w - 14 * mm, page_h - 8.5 * mm, titre_document or NOM)
    canvas.setFillColor(TEXT_MUTED)
    canvas.setFont("Helvetica", 6.5)
    canvas.drawRightString(page_w - 14 * mm, page_h - 13.5 * mm, SLOGAN)

    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.15)
    canvas.line(0, page_h - HEADER_HEIGHT, page_w, page_h - HEADER_HEIGHT)
    canvas.setStrokeColor(SECONDARY)
    canvas.setLineWidth(2.2)
    canvas.line(14 * mm, page_h - HEADER_HEIGHT, 14 * mm + logo_w, page_h - HEADER_HEIGHT)

    canvas.setFillColor(BG_LIGHT)
    canvas.rect(0, 0, page_w, FOOTER_HEIGHT, fill=1, stroke=0)
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(0.8)
    canvas.line(0, FOOTER_HEIGHT, page_w, FOOTER_HEIGHT)

    footer_w, footer_h = fit_logo(FOOTER_LOGO_MAX_W, FOOTER_LOGO_MAX_H)
    footer_y = (FOOTER_HEIGHT - footer_h) / 2.0
    draw_logo(canvas, 14 * mm, footer_y, FOOTER_LOGO_MAX_W, FOOTER_LOGO_MAX_H)

    text_x = 14 * mm + footer_w + 3 * mm
    canvas.setFillColor(TEXT_MUTED)
    canvas.setFont("Helvetica", 5.6)
    max_w = page_w - text_x - 28 * mm
    y_ligne = FOOTER_HEIGHT - 4.2 * mm
    for ligne in LIGNES_PIED:
        y_ligne = _draw_wrapped(canvas, ligne, text_x, y_ligne, max_w, 5.6, 2.15 * mm)
    if mention:
        canvas.setFont("Helvetica-Bold", 6)
        canvas.setFillColor(PRIMARY)
        canvas.drawString(text_x, 3.2 * mm, mention)

    canvas.setFillColor(PRIMARY)
    canvas.setFont("Helvetica-Bold", 7)
    canvas.drawRightString(page_w - 14 * mm, FOOTER_HEIGHT - 5 * mm, f"Page {doc.page}")
    canvas.restoreState()


def header_footer_callback(
    titre_document: str = "",
    mention: Optional[str] = None,
) -> Callable:
    def _callback(canvas, doc) -> None:
        draw_page_chrome(canvas, doc, titre_document=titre_document, mention=mention)

    return _callback
