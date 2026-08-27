#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur autonome — Rapport de rénovation énergétique (~85 pages A4 portrait)
Client : Mme Clyve ANDRIOT — Longère pisé, 220 m², 71290 La Genête
ENERGIA CONSEIL IA®

Usage :
    python generate_rapport_clyve.py

Sources exploitées (aucune donnée inventée) :
    - FIL ROUGE (audit BATIAUDIT V1.2.16.2 — visite 06/06/2025)
    - Étude BAO « Ma maison » (15/11/2024)
    - Devis toiture EIRL Yoann Suchet n°96 (19/06/2023) — HISTORIQUE

Règles de prudence appliquées :
    - Aucun chiffre n'est inventé : ce qui manque est marqué « À confirmer ».
    - Les visuels thermographiques sont des SIMULATIONS (jamais des mesures).
    - Aucune catégorie MaPrimeRénov' n'est déduite (RFR non fourni).
    - Les aides sont présentées comme « estimations conditionnelles » uniquement.
    - Le devis toiture 2023 est présenté comme HISTORIQUE à réactualiser 2026.
    - PV 6 kWc / batterie 7 kWh = objectifs du brief client -> hypothèses à confirmer.
"""

from __future__ import annotations

import io
import sys
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Sequence, Tuple, Any

# ── Sortie UTF-8 sûre sous Windows ───────────────────────────────────────────
if sys.platform == "win32":
    try:
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfgen import canvas as canvas_mod
from reportlab.platypus import (
    Flowable,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTES / CHARTE GRAPHIQUE
# ─────────────────────────────────────────────────────────────────────────────

ROOT = Path(__file__).resolve().parent
BASE = ROOT / "clients" / "ANDRIOT_Clyve"
IMAGES = BASE / "images"
SOURCES = BASE / "sources"
DEVIS_PNG = BASE / "extracted" / "devis_toiture_page.png"
OUTPUT_DIR = BASE / "output"

PDF_NAME = "rapport_renovation_clyve_andriot.pdf"  # alias historique (copie du dossier technique)
TECHNICAL_PDF_NAME = "dossier_technique_annexes_clyve_andriot.pdf"
SYNTHESIS_PDF_NAME = "synthese_decisionnelle_clyve_andriot.pdf"

# MODE CLIENT PREMIUM : rapport commercial destinataire cliente.
# Masque noms de code internes, sociétés fictives et devis fictifs.
MODE_CLIENT_PREMIUM = True

C = {
    "teal": colors.HexColor("#0F766E"),       # vert profond
    "green": colors.HexColor("#10B981"),      # vert moyen
    "night": colors.HexColor("#0F172A"),      # bleu nuit
    "gray": colors.HexColor("#F1F5F9"),       # gris clair (fonds uniquement)
    "teal_light": colors.HexColor("#CCFBF1"),
    "green_light": colors.HexColor("#D1FAE5"),
    "yellow": colors.HexColor("#FEF3C7"),     # jaune léger (mise en avant)
    "yellow_border": colors.HexColor("#F59E0B"),
    "muted": colors.HexColor("#334155"),      # slate foncé — lisible sur blanc
    "border": colors.HexColor("#0F766E"),
    "white": colors.white,
    "warn_bg": colors.HexColor("#FFFBEB"),
    "warn_border": colors.HexColor("#F59E0B"),
    "crit_bg": colors.HexColor("#FEF2F2"),
    "crit_border": colors.HexColor("#DC2626"),
    "info_bg": colors.HexColor("#F0FDFA"),
    "note_bg": colors.HexColor("#EEF2FF"),
    "row_alt": colors.HexColor("#F1F5F9"),
    "orange": colors.HexColor("#EA580C"),
}

EMAIL_OFFICIEL = "contact@energia-conseil-ia.com"
MARQUE = "ENERGIA CONSEIL IA®"
MARQUE_LICENCE = "Marque exploitée sous licence."
FOOTER_TEXT = (
    "Projet Clyve Andriot — Document d'accompagnement — "
    "Données à valider par entreprises RGE"
)
CONTACT_BLOC = (
    f"{MARQUE} — 16 rue Cuvier, 69006 Lyon — "
    f"06 10 59 68 98 — {EMAIL_OFFICIEL}"
)

CONTENT_WIDTH = 17 * cm
IMG_MAX_W = 16 * cm

# ─────────────────────────────────────────────────────────────────────────────
# POLICES
# ─────────────────────────────────────────────────────────────────────────────


def register_fonts() -> Tuple[str, str]:
    """Montserrat / Inter si présents dans assets/fonts, sinon Helvetica."""
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    fonts_dir = ROOT / "assets" / "fonts"
    title_font, body_font = "Helvetica-Bold", "Helvetica"
    candidates_title = ["Montserrat-Bold.ttf", "Inter-Bold.ttf"]
    candidates_body = ["Inter-Regular.ttf", "Montserrat-Regular.ttf"]
    try:
        for f in candidates_title:
            p = fonts_dir / f
            if p.is_file():
                name = p.stem
                pdfmetrics.registerFont(TTFont(name, str(p)))
                title_font = name
                break
        for f in candidates_body:
            p = fonts_dir / f
            if p.is_file():
                name = p.stem
                pdfmetrics.registerFont(TTFont(name, str(p)))
                body_font = name
                break
    except Exception:
        title_font, body_font = "Helvetica-Bold", "Helvetica"
    return title_font, body_font


FONT_TITLE, FONT_BODY = register_fonts()

# ─────────────────────────────────────────────────────────────────────────────
# DONNÉES CLIENT &amp; SOURCES (STRICTEMENT ISSUES DES DOCUMENTS)
# ─────────────────────────────────────────────────────────────────────────────

CLIENT = {
    "nom": "Mme Clyve ANDRIOT",
    "foyer": "Personne seule avec 4 enfants (foyer de 5 personnes)",
    "type_bien": "Longère en pisé / maison individuelle",
    "surface": 220,
    "annee": "Avant 1948",
    "adresse": "654 route départementale 975, Grand Veilly, 71290 La Genête (71)",
    "altitude": "193 m",
    "zone_clim": "H1c",
    "niveaux": "1 niveau (plain-pied), 6 pièces",
    "visite_fil": "06/06/2025 (audit FIL ROUGE, BATIAUDIT V1.2.16.2)",
    "etude_bao": "15/11/2024 (étude BAO « Ma maison »)",
    "ref": "RAPPORT-2026-ANDRIOT",
}

# Photos réelles du bien
PHOTOS_REELLES = [
    ("FACADE AVANT .png", "Façade avant"),
    ("FACADE ARRIERE .JPG", "Façade arrière"),
    ("PIGNON NORD .JPG", "Pignon Nord"),
    ("PIGNON SUD.JPG", "Pignon Sud"),
    ("TOITURE EXTERIEUR.jpg", "Toiture (vue extérieure)"),
]

# Simulations thermographiques (JAMAIS des mesures réelles)
THERMO_SIMULATIONS = [
    ("farmhouse-facade-thermal-imaging.jpg", "Simulation thermique — façade longère"),
    ("farmhouse-infrared-heat-loss-scan (1).jpg", "Simulation infrarouge — déperditions"),
    ("house-facade-thermal-comparison.jpg", "Simulation comparative de façade"),
    ("roof-thermal-audit-visualization.jpg", "Simulation thermique — toiture"),
    ("pignon-de-maison-en-thermographie-infrarouge.jpg", "Simulation infrarouge — pignon"),
    ("thermographic-analysis-of-gable-wall.jpg", "Simulation thermique — mur pignon"),
]

# Simulations avant / après (projections illustratives)
BEFORE_AFTER_SIMULATIONS = [
    ("farmhouse-renovation-before-and-after.jpg", "Projection avant/après — longère"),
    ("house-energy-renovation-before-after.jpg", "Projection avant/après — rénovation énergétique"),
    ("maison-ancienne-avant-renovation-thermique.jpg", "Projection — état avant rénovation thermique"),
    ("pignon-nord-de-maison-renovee.jpg", "Projection — pignon Nord rénové"),
    ("renovation-pignon-maison-avant-apres.jpg", "Projection avant/après — pignon"),
    ("rustic-farmhouse-before-and-after-renovation (1).jpg", "Projection avant/après — ferme rustique"),
    ("toiture-ancienne-degradee-et-toiture-renovee-avec-panneaux.jpg",
     "Projection — toiture rénovée avec panneaux (illustratif)"),
]

THERMO_TITLE = (
    "Simulation visuelle des zones de déperdition – "
    "à confirmer par diagnostic sur site"
)
THERMO_WARNING = (
    "Simulation visuelle indicative, ne remplace pas une thermographie "
    "infrarouge sur site."
)

# ── FIL ROUGE (audit — visite 06/06/2025) ────────────────────────────────────
FIL = {
    "ubat_avant": "1,667 W/(m².K)",
    "ubat_base": "0,356 W/(m².K)",
    "ubat_apres_sc1": "0,337 W/(m².K)",
    "conso_avant_ep": "680 kWhEP/m².an",
    "conso_avant_ef": "499 kWhEF/m².an",
    "cout_annuel": "8 100 € à 10 990 €",
    # Répartition avant travaux (énergie primaire)
    "rep_chauffage_bois_ep": "359,4 EP",
    "rep_chauffage_elec_ep": "287,0 EP",
    "rep_ecs_ep": "30,0 EP",
    "rep_ecl_ep": "4,3 EP",
    "cout_chauffage": "7 540 € à 10 220 €",
    "cout_ecs": "490 € à 670 €",
    "cout_ecl": "70 € à 100 €",
    # Scénario 1 « en une fois »
    "sc1_total": "~ 237 090 € TTC",
    "sc1_total_avec_pv": "~ 255 090 € TTC",  # 237 090 + option PV 18 000
    "pv_option_ttc": "18 000 € TTC",
    "sc1_ubat_apres": "0,337 W/(m².K)",
    "sc1_gain": "-84 % (-573 kWhEP/m².an)",
    "sc1_depense_apres": "1 090 € à 1 520 € / an",
    # Scénario 2 par étapes
    "sc2_e1": "~ 97 290 € TTC",
    "sc2_e2": "~ 107 200 € TTC",
    "sc2_e3": "~ 24 100 € TTC",
    "sc2_e4": "~ 8 500 € TTC",
}

# Postes du scénario 1 (estimations TTC de l'audit — NE SONT PAS des devis)
FIL_SC1_POSTES = [
    ("Menuiseries — fenêtres", "Bois triple vitrage Uw~1,1 ; 9 ouvrants ; dépose totale + volets roulants", "~ 22 000 €"),
    ("Menuiseries — portes", "2 portes bois hautes performances (Ud~1,2) ; quincaillerie 3 points", "~ 5 600 €"),
    ("Murs — ITE garage", "Chaux-chanvre projeté 24 cm (R=5,5) ; 25 m²", "~ 4 500 €"),
    ("Murs — ITE pisé", "Chaux-chanvre projeté 24 cm (R=5,5) sur murs pisé ; 160 m²", "~ 28 800 €"),
    ("Toiture — isolation rampants", "Laine minérale 30 cm (R=6,5) ; 275 m²", "~ 27 500 €"),
    ("Plancher bas", "Isolation périphérique PSE extrudé 16 cm (R=4,0) ; 137 m²", "~ 8 200 €"),
    ("Ventilation", "VMC Double Flux Hygro B (efficacité 85 %) ; 180 m³/h", "~ 6 500 €"),
    ("Chauffage — PAC", "PAC Air/Eau double service 15 kW ; SCOP 4,5 / COP ECS 3,5", "~ 18 000 €"),
    ("Chauffage — dépose", "Neutralisation des prises électriques dédiées", "~ 600 €"),
    ("Chauffage — plancher chauffant", "Plancher chauffant hydraulique BT 137 m² raccordé PAC", "~ 11 500 €"),
    ("Eau chaude — ballons thermo.", "2 ballons thermodynamiques (200 L + 300 L -> 500 L)", "~ 8 500 €"),
]

FIL_SC1_INDUITS = [
    ("Finitions menuiseries", "Habillages int./ext., étanchéité périphérique, retouches", "~ 3 500 €"),
    ("Finitions portes", "Seuils étanches, habillages, retouches", "~ 1 200 €"),
    ("Enduit chaux garage", "Enduit chaux finition 2,5 cm ; 25 m²", "~ 1 250 €"),
    ("Enduit chaux murs", "Enduit chaux 2,5 cm + pare-pluie perspirant ; 160 m²", "~ 8 000 €"),
    ("Réfection charpente + couverture", "Reconstruction panne sablière, chevrons, couverture tuiles canal ; 275 m²", "~ 70 000 €"),
    ("Finitions plancher bas", "Étanchéité périphérique + protection isolant ; 137 m²", "~ 2 740 €"),
    ("Réseau VMC", "Percements murs pisé, réseau gainé isolé, raccordement", "~ 3 200 €"),
    ("Mise en service PAC", "Raccordements hydrauliques, régulation, mise en service", "~ 5 500 €"),
]

# ── BAO (étude « Ma maison » 15/11/2024) ─────────────────────────────────────
BAO = {
    "date": "15/11/2024",
    "conso_ep": "432 kWhEP/m²",
    "conso_ef": "54 161 kWh/an",
    "depense_annuelle": "~ 8 727 € / an",
    "cep_ecopret": "508 kWh/m² (contexte éco-PTZ)",
    "zone": "H1c — altitude 193 m",
}

BAO_PRECOS = [
    ("1", "Iso FERMACELLE A + Polyuréthane BCD", "17 228 €", "8 490 €/an", "237 €/an", "72,74 ans"),
    ("2", "Isolation rampants BCD + combles A", "15 027 €", "5 312 €/an", "3 415 €/an", "4,40 ans"),
    ("3", "Remplacement fenêtres (bois)", "4 174 €", "8 344 €/an", "383 €/an", "10,91 ans"),
    ("4", "ITE chanvre BCD + ITI LDV A", "30 158 €", "6 878 €/an", "1 848 €/an", "16,32 ans"),
    ("5", "Mise en place VMR", "1 899 €", "8 739 €/an", "- 12 €/an", "—"),
    ("ÉT.1", "ÉTAPE 1 — Isolation + ventilation", "69 017 €", "3 407 €/an", "5 320 €/an", "12,97 ans"),
    ("6", "Remplacement chaudière par PAC Air/Eau", "29 540 €", "2 159 €/an", "6 567 €/an", "4,50 ans"),
    ("ÉT.2", "ÉTAPE 2 — Cumul étape 1 + PAC Air/Eau", "75 825 €", "902 €/an", "7 825 €/an", "9,69 ans"),
]

# ── DEVIS TOITURE (HISTORIQUE — 19/06/2023) ──────────────────────────────────
DEVIS = {
    "entreprise": "EIRL Yoann Suchet",
    "numero": "n°96",
    "date": "19/06/2023",
    "objet": "Réfection de toiture",
    "surface": "310 m²",
    "tuile": "Tuile IMERYS Oméga 10 vieux toit",
    "ht": "37 080,60 €",
    "tva": "3 708,06 € (TVA 10 %)",
    "ttc": "40 788,66 €",
    "validite": "15 jours (expirée depuis longtemps)",
}


# ─────────────────────────────────────────────────────────────────────────────
# STYLES
# ─────────────────────────────────────────────────────────────────────────────


def build_styles() -> dict:
    base = getSampleStyleSheet()
    s = {}
    s["h1"] = ParagraphStyle("h1", parent=base["Heading1"], fontName=FONT_TITLE,
                             fontSize=19, textColor=C["teal"], spaceBefore=2, spaceAfter=10, leading=23)
    s["h2"] = ParagraphStyle("h2", parent=base["Heading2"], fontName=FONT_TITLE,
                             fontSize=13.5, textColor=C["night"], spaceBefore=12, spaceAfter=6, leading=17)
    s["h3"] = ParagraphStyle("h3", parent=base["Heading3"], fontName=FONT_TITLE,
                             fontSize=11, textColor=C["teal"], spaceBefore=8, spaceAfter=4, leading=14)
    s["body"] = ParagraphStyle("body", parent=base["Normal"], fontName=FONT_BODY,
                               fontSize=9.7, textColor=C["night"], alignment=TA_JUSTIFY,
                               leading=14, spaceAfter=5)
    s["body_c"] = ParagraphStyle("body_c", parent=s["body"], alignment=TA_CENTER)
    s["sm"] = ParagraphStyle("sm", parent=s["body"], fontSize=8.3, leading=11.5, spaceAfter=3)
    s["muted"] = ParagraphStyle("muted", parent=s["sm"], textColor=C["muted"])
    s["muted_c"] = ParagraphStyle("muted_c", parent=s["muted"], alignment=TA_CENTER)
    s["caption"] = ParagraphStyle(
        "caption", parent=s["sm"], alignment=TA_CENTER,
        fontSize=8, spaceBefore=3, textColor=C["night"],
    )
    s["source"] = ParagraphStyle("source", parent=s["muted"], fontName=FONT_BODY, fontSize=7.8,
                                 textColor=C["muted"], leading=10)
    # Couverture CLIENT_PREMIUM : fond blanc → textes bleu nuit / vert profond uniquement
    s["cover_title"] = ParagraphStyle(
        "cover_title", parent=base["Title"], fontName=FONT_TITLE,
        fontSize=22, textColor=C["night"], alignment=TA_CENTER, leading=28, spaceAfter=6,
    )
    s["cover_sub"] = ParagraphStyle(
        "cover_sub", parent=base["Title"], fontName=FONT_TITLE,
        fontSize=13, textColor=C["teal"], alignment=TA_CENTER, leading=18, spaceAfter=4,
    )
    s["cover_txt"] = ParagraphStyle(
        "cover_txt", parent=s["body"], fontSize=11,
        textColor=C["night"], alignment=TA_CENTER, leading=15,
    )
    s["cover_caption"] = ParagraphStyle(
        "cover_caption", parent=s["body"], fontSize=8.5,
        textColor=C["night"], alignment=TA_CENTER, leading=11, spaceBefore=4, spaceAfter=6,
    )
    s["toc"] = ParagraphStyle("toc", parent=s["body"], fontSize=10, alignment=TA_LEFT, spaceAfter=3, leading=15)
    return s


S = build_styles()


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS FLOWABLES
# ─────────────────────────────────────────────────────────────────────────────


def p(text: str, style: Optional[ParagraphStyle] = None) -> Paragraph:
    return Paragraph(text, style or S["body"])


def sp(h: float = 0.3) -> Spacer:
    return Spacer(1, h * cm)


def h1(text: str) -> Paragraph:
    return Paragraph(text, S["h1"])


def h2(text: str) -> Paragraph:
    return Paragraph(text, S["h2"])


def h3(text: str) -> Paragraph:
    return Paragraph(text, S["h3"])


def source_note(text: str) -> Table:
    """Encadré discret indiquant l'origine des données."""
    para = Paragraph(f"<b>Source :</b> {text}", S["source"])
    t = Table([[para]], colWidths=[CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["gray"]),
        ("BOX", (0, 0), (-1, -1), 0.4, C["muted"]),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return t


def vigilance_box(title: str, text: str, kind: str = "warn") -> Table:
    """Encadré « Point de vigilance » (warn/crit/info)."""
    bg = {"warn": C["warn_bg"], "crit": C["crit_bg"], "info": C["info_bg"]}.get(kind, C["warn_bg"])
    bd = {"warn": C["warn_border"], "crit": C["crit_border"], "info": C["teal"]}.get(kind, C["warn_border"])
    icon = {"warn": "\u00BB", "crit": "\u00BB", "info": "\u00BB"}.get(kind, "\u00BB")
    head = Paragraph(f"<b>{icon} {title}</b>",
                     ParagraphStyle("vt", parent=S["body"], fontName=FONT_TITLE,
                                    fontSize=10.5, textColor=bd, spaceAfter=3))
    txt = Paragraph(text, ParagraphStyle("vb", parent=S["sm"], textColor=C["night"]))
    t = Table([[head], [txt]], colWidths=[CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 1, bd),
        ("LINEBEFORE", (0, 0), (0, -1), 4, bd),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


def callout(text: str, kind: str = "info") -> Table:
    bg = {"info": C["info_bg"], "note": C["note_bg"], "green": C["green_light"],
          "warn": C["warn_bg"], "crit": C["crit_bg"]}.get(kind, C["info_bg"])
    bd = {"info": C["teal"], "note": colors.HexColor("#6366F1"), "green": C["green"],
          "warn": C["warn_border"], "crit": C["crit_border"]}.get(kind, C["teal"])
    para = Paragraph(text, ParagraphStyle("co", parent=S["sm"], textColor=C["night"]))
    t = Table([[para]], colWidths=[CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 0.6, bd),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return t


def data_table(rows: Sequence[Sequence[Any]],
               col_widths: Optional[Sequence[float]] = None,
               header: bool = True,
               total_rows: Optional[Sequence[int]] = None,
               font_size: float = 8.6) -> Table:
    ncol = len(rows[0])
    cw = col_widths or [CONTENT_WIDTH / ncol] * ncol
    # Convertir chaînes en Paragraph pour le wrapping
    body_style = ParagraphStyle("cell", parent=S["sm"], fontSize=font_size, leading=font_size + 3)
    head_style = ParagraphStyle("cellh", parent=S["sm"], fontSize=font_size, leading=font_size + 3,
                                fontName=FONT_TITLE, textColor=C["white"])
    data = []
    for r, row in enumerate(rows):
        new_row = []
        for cell in row:
            if isinstance(cell, (Paragraph, Table, Image, Spacer)):
                new_row.append(cell)
            else:
                st = head_style if (header and r == 0) else body_style
                new_row.append(Paragraph(str(cell), st))
        data.append(new_row)
    t = Table(data, colWidths=cw, repeatRows=1 if header else 0)
    cmds = [
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]
    if header:
        cmds += [
            ("BACKGROUND", (0, 0), (-1, 0), C["teal"]),
            ("LINEBELOW", (0, 0), (-1, 0), 1, C["night"]),
        ]
    start = 1 if header else 0
    for i in range(start, len(data)):
        if (i - start) % 2 == 1:
            cmds.append(("BACKGROUND", (0, i), (-1, i), C["row_alt"]))
    for tr in (total_rows or []):
        cmds += [
            ("BACKGROUND", (0, tr), (-1, tr), C["teal_light"]),
            ("FONTNAME", (0, tr), (-1, tr), FONT_TITLE),
        ]
    t.setStyle(TableStyle(cmds))
    return t


def kpi_row(items: Sequence[Tuple[str, str]]) -> Table:
    cells = []
    for label, val in items:
        cells.append(Paragraph(
            f'<para align="center"><font size="7.5" color="#475569">{label}</font><br/>'
            f'<b><font size="14" color="#0F766E">{val}</font></b></para>',
            S["body_c"]))
    t = Table([cells], colWidths=[CONTENT_WIDTH / len(items)] * len(items))
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["info_bg"]),
        ("BOX", (0, 0), (-1, -1), 0.5, C["teal_light"]),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, C["teal_light"]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    return t


def bullet_list(items: Sequence[str], style: Optional[ParagraphStyle] = None) -> ListFlowable:
    st = style or S["body"]
    return ListFlowable(
        [ListItem(Paragraph(it, st), leftIndent=6) for it in items],
        bulletType="bullet", bulletColor=C["teal"], leftIndent=14, bulletFontSize=8,
    )


def safe_image(filename_or_path: Any, caption: str = "", max_w: float = IMG_MAX_W,
               max_h: float = 20 * cm) -> List[Any]:
    """
    Insère l'image si le fichier existe (mise à l'échelle en conservant le ratio).
    Sinon insère un encadré-placeholder honnête (le document reste complet).
    """
    if isinstance(filename_or_path, Path):
        path = filename_or_path
    else:
        path = IMAGES / str(filename_or_path)
    out: List[Any] = []
    if path.is_file():
        try:
            from reportlab.lib.utils import ImageReader
            iw, ih = ImageReader(str(path)).getSize()
            ratio = ih / float(iw) if iw else 0.66
            w = max_w
            h = w * ratio
            if h > max_h:
                h = max_h
                w = h / ratio if ratio else max_w
            img = Image(str(path), width=w, height=h)
            img.hAlign = "CENTER"
            out.append(img)
        except Exception:
            out.append(_image_placeholder(path.name, caption))
    else:
        out.append(_image_placeholder(path.name, caption))
    if caption:
        out.append(Paragraph(caption, S["caption"]))
    return out


def _image_placeholder(name: str, caption: str) -> Table:
    txt = Paragraph(
        f'<para align="center"><font color="#0F172A">'
        f"<b>[ Visuel à intégrer ]</b><br/><br/>"
        f"Fichier attendu : <i>{name}</i><br/>"
        f"À joindre au dossier lors de la finalisation."
        f"</font></para>",
        S["body_c"])
    t = Table([[txt]], colWidths=[IMG_MAX_W], rowHeights=[7.5 * cm])
    t.hAlign = "CENTER"
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["gray"]),
        ("BOX", (0, 0), (-1, -1), 0.8, C["muted"]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    return t


# ─────────────────────────────────────────────────────────────────────────────
# CANVAS NUMÉROTÉ (en-tête + pied de page + pagination X/Y)
# ─────────────────────────────────────────────────────────────────────────────


class NumberedCanvas(canvas_mod.Canvas):
    """Pagination + en-tête / pied. Bandeau couverture uniquement si cover_first=True."""

    cover_first = True  # surchargé par factory pour les previews internes

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_states = []

    def showPage(self):
        self._saved_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        total = len(self._saved_states)
        for i, state in enumerate(self._saved_states):
            self.__dict__.update(state)
            self._draw_decorations(i + 1, total)
            super().showPage()
        super().save()

    def _draw_decorations(self, page: int, total: int):
        w, h = A4
        is_cover = bool(getattr(self, "cover_first", True)) and (page == 1)
        self.saveState()
        if is_cover:
            # Bandeau supérieur pleine largeur — texte blanc uniquement
            banner_h = 28 * mm
            self.setFillColor(C["teal"])
            self.rect(0, h - banner_h, w, banner_h, fill=1, stroke=0)
            self.setFillColor(C["white"])
            self.setFont(FONT_TITLE, 13)
            self.drawCentredString(w / 2, h - 12 * mm, MARQUE)
            self.setFont(FONT_BODY, 9)
            self.drawCentredString(w / 2, h - 19 * mm, "Rénovation énergétique intelligente")
            # Pas de pied pâle : les coordonnées figurent dans le flux (bleu nuit)
            self.restoreState()
            return
        # En-tête
        self.setFont(FONT_TITLE, 8.5)
        self.setFillColor(C["teal"])
        self.drawString(20 * mm, h - 12 * mm, MARQUE)
        self.setFont(FONT_BODY, 7.5)
        self.setFillColor(C["muted"])
        self.drawRightString(w - 20 * mm, h - 12 * mm,
                             f"Rapport rénovation énergétique — Réf. {CLIENT['ref']}")
        self.setStrokeColor(C["teal"])
        self.setLineWidth(1.2)
        self.line(20 * mm, h - 14 * mm, w - 20 * mm, h - 14 * mm)
        # Pied de page
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(20 * mm, 15 * mm, w - 20 * mm, 15 * mm)
        self.setFont(FONT_BODY, 7)
        self.setFillColor(C["muted"])
        self.drawString(20 * mm, 11 * mm, FOOTER_TEXT)
        self.setFont(FONT_BODY, 7.5)
        self.setFillColor(C["teal"])
        self.drawRightString(w - 20 * mm, 11 * mm, f"Page {page} / {total}")
        self.restoreState()


def make_canvas(cover_first: bool = True):
    """Factory canvas : cover_first=False pour les previews de sections internes."""
    class _C(NumberedCanvas):
        pass
    _C.cover_first = cover_first
    return _C


# ─────────────────────────────────────────────────────────────────────────────
# CONSTRUCTION DES SECTIONS (chaque fonction retourne une liste de flowables)
# ─────────────────────────────────────────────────────────────────────────────


def section_cover() -> List[Any]:
    """Couverture CLIENT_PREMIUM — fond blanc, bandeau teal (canvas), textes lisibles."""
    st: List[Any] = []
    # Espace sous le bandeau canvas — topMargin déjà >= 32 mm
    st.append(sp(0.35))
    st.append(Paragraph("RAPPORT PERSONNALISÉ", S["cover_title"]))
    st.append(Paragraph("DE RÉNOVATION ÉNERGÉTIQUE", S["cover_title"]))
    st.append(sp(0.25))
    st.append(Paragraph("Projet Clyve Andriot", S["cover_sub"]))
    st.append(Paragraph(
        "Longère en pisé — 220 m² — La Genête (71)",
        S["cover_sub"]))
    st.append(sp(0.35))

    photo_candidates = [
        IMAGES / "FACADE AVANT .png",
        IMAGES / "FACADE ARRIERE .JPG",
        IMAGES / "PIGNON SUD.JPG",
        IMAGES / "TOITURE EXTERIEUR.jpg",
    ]
    photo = next((p for p in photo_candidates if p.is_file()), None)
    if photo is not None:
        st.extend(safe_image(
            photo,
            "État initial du bien — photographie issue du dossier client",
            max_w=12.5 * cm,
            max_h=7.2 * cm,
        ))
        # Forcer légende en bleu nuit (pas de gris pâle)
        if st and isinstance(st[-1], Paragraph):
            st[-1] = Paragraph(
                "État initial du bien — photographie issue du dossier client",
                S["cover_caption"],
            )
    else:
        st.append(_cover_photo_placeholder())
        st.append(Paragraph(
            "État initial du bien — photographie issue du dossier client",
            S["cover_caption"],
        ))

    st.append(sp(0.25))
    disc = Paragraph(
        '<para align="center"><font color="#FFFFFF" size="8.5">'
        "Document d'accompagnement : données techniques, aides et budgets "
        "à confirmer par les entreprises RGE, organismes compétents et financeurs."
        "</font></para>",
        S["cover_txt"])
    box = Table([[disc]], colWidths=[15.5 * cm])
    box.hAlign = "CENTER"
    box.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["night"]),
        ("BOX", (0, 0), (-1, -1), 0, C["night"]),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    st.append(box)
    st.append(sp(0.55))
    st.append(Paragraph(
        f"<b>{MARQUE}</b><br/>"
        "16 rue Cuvier, 69006 Lyon<br/>"
        "06 10 59 68 98<br/>"
        f"{EMAIL_OFFICIEL}<br/>"
        f"<font size='8'><i>{MARQUE_LICENCE}</i></font>",
        ParagraphStyle(
            "cov_coord", parent=S["cover_txt"], fontSize=10,
            textColor=C["night"], leading=14,
        ),
    ))
    st.append(sp(0.2))
    st.append(Paragraph(
        f"Document d'accompagnement — {datetime.now().strftime('%d/%m/%Y')} — "
        f"Réf. {CLIENT['ref']}",
        ParagraphStyle(
            "cov_ref", parent=S["cover_txt"], fontSize=8.5,
            textColor=C["night"],
        ),
    ))
    return st


def _cover_photo_placeholder() -> Table:
    txt = Paragraph(
        '<para align="center"><font color="#0F172A">'
        "<b>Photographie du bien</b><br/>"
        "Fichier attendu : FACADE AVANT .png"
        "</font></para>",
        S["cover_txt"],
    )
    t = Table([[txt]], colWidths=[12.5 * cm], rowHeights=[6.5 * cm])
    t.hAlign = "CENTER"
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["gray"]),
        ("BOX", (0, 0), (-1, -1), 1.2, C["teal"]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return t


def section_confidentiality() -> List[Any]:
    st = [h1("1. Confidentialité, portée et limites du document")]
    st.append(p(
        "Le présent rapport a été établi par <b>ENERGIA CONSEIL IA®</b> pour "
        f"{CLIENT['nom']}, dans le cadre de l'accompagnement à la rénovation "
        "énergétique de sa longère en pisé située à La Genête (71). Il constitue "
        "un <b>document de travail</b> destiné à structurer la réflexion, comparer "
        "des scénarios et préparer la consultation des entreprises RGE."))
    st.append(vigilance_box(
        "Nature exacte de ce document",
        "Ce rapport <b>n'est ni un devis, ni un audit réglementaire, ni un DPE, "
        "ni une étude thermique opposable</b>. Il synthétise et met en perspective "
        "des documents existants (audit FIL ROUGE, étude BAO, devis toiture 2023). "
        "Toutes les valeurs chiffrées de travaux doivent être <b>confirmées par "
        "des devis d'entreprises RGE</b> avant tout engagement.", "crit"))
    st.append(sp(0.2))
    st.append(h2("Sources exploitées"))
    st.append(data_table([
        ["Document", "Date", "Émetteur / outil"],
        ["Audit énergétique « FIL ROUGE »", CLIENT["visite_fil"].split(" (")[0], "BATIAUDIT V1.2.16.2"],
        ["Étude « BAO — Ma maison »", BAO["date"], "Bureau d'études (BAO)"],
        ["Devis toiture (HISTORIQUE)", DEVIS["date"], f"{DEVIS['entreprise']} {DEVIS['numero']}"],
    ], col_widths=[8 * cm, 3.5 * cm, 5.5 * cm]))
    st.append(sp(0.2))
    st.append(h2("Règles de prudence appliquées"))
    st.append(bullet_list([
        "<b>Aucune donnée n'est inventée</b> : toute information manquante est "
        "explicitement notée « À confirmer lors de la visite / du devis artisan ».",
        "Les <b>visuels thermographiques sont des simulations</b> illustratives ; "
        "ils ne remplacent pas une thermographie infrarouge réalisée sur site.",
        "<b>Aucune catégorie MaPrimeRénov'</b> n'est déterminée : le revenu fiscal "
        "de référence (RFR) n'a pas été communiqué.",
        "Les <b>aides et financements sont conditionnels</b> : aucun reste à "
        "charge définitif, aucune mensualité, aucun délai de déblocage ni "
        "autofinancement n'est garanti dans ce rapport.",
        "Le <b>devis toiture de 2023 est historique</b> : il doit être réactualisé "
        "en 2026 et ne peut être considéré comme valable en l'état.",
        "Les objectifs <b>photovoltaïque (6 kWc) et batterie (7 kWh)</b> proviennent "
        "du brief client : ce sont des hypothèses de dimensionnement à confirmer.",
    ], S["sm"]))
    st.append(sp(0.2))
    st.append(callout(
        "<b>Confidentialité.</b> Ce document contient des informations relatives "
        "au logement et au foyer. Il est strictement réservé à sa destinataire et "
        "aux intervenants mandatés du projet. Toute diffusion à un tiers requiert "
        "l'accord préalable de la cliente.", "note"))
    st.append(source_note(
        "En-tête et règles internes ENERGIA CONSEIL IA® ; documents client listés ci-dessus."))
    return st


def section_toc() -> List[Any]:
    st = [h1("2. Sommaire détaillé")]
    st.append(p(
        "Ce rapport est organisé en sections thématiques, de la présentation du "
        "bien jusqu'aux annexes documentaires. Le sommaire ci-dessous permet de "
        "naviguer entre l'accompagnement ENERGIA, le diagnostic, les scénarios "
        "de travaux et le volet financier."))
    entries = [
        ("1", "Confidentialité, portée et limites"),
        ("2", "Sommaire détaillé"),
        ("2 bis", "ENERGIA CONSEIL IA® — Notre accompagnement"),
        ("3", "Synthèse pour décision (3 scénarios)"),
        ("4", "Présentation du logement &amp; vigilance pisé/humidité"),
        ("5", "État énergétique initial"),
        ("6", "Diagnostic visuel — photographies par façade"),
        ("7", "Simulations thermographiques (illustratives)"),
        ("8", "Analyse des déperditions thermiques"),
        ("9", "Principes techniques du pisé &amp; points de vigilance"),
        ("10", "État des devis existants — devis toiture 2023 (historique)"),
        ("11", "Devis manquants à obtenir"),
        ("12", "SCÉNARIO 1 — Sécurisation toiture &amp; confort"),
        ("13", "SCÉNARIO 2 — Enveloppe performante (avant changement de chauffage)"),
        ("14", "SCÉNARIO 3 — Rénovation globale bas carbone"),
        ("15", "Option solaire 6 kWc / batterie 7 kWh (hypothèse)"),
        ("16", "Tableau comparatif des 3 scénarios"),
        ("17", "Aides &amp; financement — étude Fabien (conditionnelle)"),
        ("18", "Planning indicatif"),
        ("19", "Plan de suivi post-travaux"),
        ("20", "Glossaire, méthodologie &amp; inventaire documentaire"),
        ("21", "Référentiels publics et sources d'information"),
        ("22", "Annexes (photos, simulations, extraits, devis, check-lists)"),
    ]
    if not MODE_CLIENT_PREMIUM:
        entries.append(
            ("23", "Simulations budgétaires par lot — préparation consultation artisans"),
        )
    rows = [["§", "Section"]]
    for num, title in entries:
        rows.append([num, title])
    st.append(sp(0.2))
    st.append(data_table(rows, col_widths=[1.6 * cm, 15.4 * cm], font_size=9.2))
    st.append(sp(0.2))
    st.append(callout(
        "Les pages sont numérotées en pied de page (Page X / Y). Chaque grande "
        "section commence sur une nouvelle page pour faciliter l'impression et "
        "l'annotation manuscrite lors des visites d'entreprises.", "info"))
    return st


def section_synthese() -> List[Any]:
    st = [h1("3. Synthèse pour décision")]
    st.append(p(
        f"{CLIENT['nom']} occupe une <b>longère en pisé de {CLIENT['surface']} m²</b> "
        f"(construction {CLIENT['annee'].lower()}) avec un foyer de 5 personnes. "
        "Le bâti est <b>énergivore</b> : chauffage bois + convecteurs électriques, "
        "eau chaude par ballons électriques, ventilation par ouverture des fenêtres, "
        "toiture non isolée en tuiles canal, murs pisé non isolés."))
    st.append(kpi_row([
        ("Surface", f"{CLIENT['surface']} m²"),
        ("Conso. avant (FIL ROUGE)", "680 EP"),
        ("Coût énergie/an", "8,1–11,0 k€"),
        ("Foyer", "5 pers."),
    ]))
    st.append(sp(0.2))
    st.append(h2("Trois scénarios de travail proposés"))
    st.append(p(
        "Pour éclairer la décision, trois trajectoires sont présentées. Elles "
        "s'appuient sur les postes chiffrés par l'audit FIL ROUGE et l'étude BAO. "
        "<b>Les montants ci-dessous sont des estimations d'audit, pas des devis.</b>"))
    st.append(data_table([
        ["Scénario", "Périmètre principal", "Ordre de grandeur (à confirmer)"],
        ["1 — Sécurisation toiture &amp; confort",
         "Réfection/isolation toiture, menuiseries, ventilation, premiers gestes",
         "Selon devis — base toiture historique ~ 40,8 k€ TTC (2023)"],
        ["2 — Enveloppe performante",
         "Isolation murs pisé + toiture + planchers + menuiseries + ventilation, "
         "AVANT changement de chauffage",
         "Étapes FIL ROUGE : ~ 97,3 k€ puis ~ 107,2 k€ TTC"],
        ["3 — Rénovation globale bas carbone",
         "Enveloppe complète + PAC Air/Eau + plancher chauffant + ballons thermo.",
         "FIL ROUGE « en une fois » : ~ 237,1 k€ TTC<br/>+ option PV 18 k€ = ~ 255,1 k€ (total de travail)"],
    ], col_widths=[4.6 * cm, 7.4 * cm, 5 * cm]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Ordre des travaux : l'isolation d'abord",
        "Le changement de chauffage (PAC) ne doit intervenir <b>qu'après</b> "
        "l'isolation de l'enveloppe : une PAC dimensionnée sur un bâti non isolé "
        "serait surdimensionnée et beaucoup plus coûteuse. C'est pourquoi le "
        "scénario 2 (enveloppe) précède logiquement l'installation d'une PAC.", "warn"))
    st.append(callout(
        "<b>Aides &amp; financement :</b> aucune catégorie MaPrimeRénov' n'est retenue "
        "ici (RFR non communiqué). Les aides éventuelles sont des estimations "
        "conditionnelles. Le Scénario Toiture &amp; Combles prévoit un budget de "
        "travail d'environ <b>50 788 €</b>, pouvant faire l'objet d'une "
        "<b>étude</b> avec le partenaire Fabien (enveloppe indicative 6 000 € à "
        "75 000 €). Aucun financement, délai ou mensualité n'est garanti "
        "(voir section 17).", "info"))
    st.append(source_note(
        "FIL ROUGE (scénarios p.8 à p.19) ; BAO (vue économique p.15) ; "
        "devis toiture historique 2023. RAC / économies : montage Fabien section 17."))
    return st


def _step_card(num: str, title: str, body: str) -> Table:
    """Carte d'étape méthodologique premium (numéro + titre + texte)."""
    num_style = ParagraphStyle(
        "stepnum", parent=S["body"], fontName=FONT_TITLE, fontSize=16,
        textColor=C["white"], alignment=TA_CENTER, leading=20,
    )
    title_style = ParagraphStyle(
        "stept", parent=S["body"], fontName=FONT_TITLE, fontSize=11,
        textColor=C["teal"], spaceAfter=4, leading=14,
    )
    body_style = ParagraphStyle(
        "stepb", parent=S["sm"], textColor=C["night"], leading=12,
    )
    badge = Table(
        [[Paragraph(num, num_style)]],
        colWidths=[1.4 * cm], rowHeights=[1.4 * cm],
    )
    badge.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["teal"]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BOX", (0, 0), (-1, -1), 0, C["teal"]),
    ]))
    content = [Paragraph(title, title_style), Paragraph(body, body_style)]
    inner = Table([[badge, content]], colWidths=[1.8 * cm, CONTENT_WIDTH - 1.8 * cm])
    inner.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 8),
        ("LEFTPADDING", (1, 0), (1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    wrap = Table([[inner]], colWidths=[CONTENT_WIDTH])
    wrap.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["gray"]),
        ("BOX", (0, 0), (-1, -1), 0.8, C["teal"]),
        ("LINEBEFORE", (0, 0), (0, -1), 5, C["night"]),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    return wrap


def _engagement_card(icon: str, title: str, text: str) -> Table:
    """Encadré d'engagement de service (réassurance)."""
    head = Paragraph(
        f"<b>{icon}  {title}</b>",
        ParagraphStyle("engh", parent=S["body"], fontName=FONT_TITLE,
                       fontSize=10.5, textColor=C["white"], leading=14),
    )
    body = Paragraph(
        text,
        ParagraphStyle("engb", parent=S["sm"], textColor=C["night"], leading=12),
    )
    head_cell = Table([[head]], colWidths=[CONTENT_WIDTH - 0.4 * cm])
    head_cell.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["night"]),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    body_cell = Table([[body]], colWidths=[CONTENT_WIDTH - 0.4 * cm])
    body_cell.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["teal_light"]),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    t = Table([[head_cell], [body_cell]], colWidths=[CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1.2, C["teal"]),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def _prest_contact_footer() -> Table:
    """Bloc contact bas de page — accompagnement commercial."""
    txt = Paragraph(
        f"<b>{MARQUE}</b><br/>"
        f"16 rue Cuvier, 69006 Lyon<br/>"
        f"06 10 59 68 98<br/>"
        f"{EMAIL_OFFICIEL}<br/>"
        f"<font size='7'><i>{MARQUE_LICENCE}</i></font>",
        ParagraphStyle(
            "prest_ct", parent=S["body"], fontSize=8.5, leading=12,
            textColor=C["night"], alignment=TA_CENTER,
        ),
    )
    t = Table([[txt]], colWidths=[CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 1.2, C["teal"]),
        ("LINEABOVE", (0, 0), (-1, 0), 3, C["night"]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


def _prest_bloc(num: str, titre: str, bullets: Sequence[str],
                mention: Optional[str] = None) -> Table:
    """Bloc de prestation premium (fond blanc, titre nuit, accent teal)."""
    head = Paragraph(
        f"<font color='#0F766E'><b>{num}</b></font>  "
        f"<font color='#0F172A'><b>{titre}</b></font>",
        ParagraphStyle("pbh", parent=S["body"], fontName=FONT_TITLE,
                       fontSize=9.5, leading=12, spaceAfter=2),
    )
    items = "<br/>".join(f"• {b}" for b in bullets)
    body = Paragraph(
        items,
        ParagraphStyle("pbb", parent=S["body"], fontSize=7.9, leading=10.6,
                       textColor=C["night"], spaceAfter=1),
    )
    rows: List[List[Any]] = [[head], [body]]
    if mention:
        rows.append([Paragraph(
            f"<i><font color='#0F172A'>{mention}</font></i>",
            ParagraphStyle("pbm", parent=S["body"], fontSize=7.2, leading=9.6,
                           textColor=C["night"]),
        )])
    t = Table(rows, colWidths=[CONTENT_WIDTH])
    cmds = [
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("BOX", (0, 0), (-1, -1), 0.9, C["teal"]),
        ("LINEBEFORE", (0, 0), (0, -1), 4, C["night"]),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (0, 0), 5),
        ("BOTTOMPADDING", (0, 0), (0, 0), 1),
        ("TOPPADDING", (0, 1), (-1, -1), 1),
        ("BOTTOMPADDING", (0, -1), (-1, -1), 5),
    ]
    if mention:
        cmds.append(("BACKGROUND", (0, 2), (0, 2), colors.HexColor("#F0FDFA")))
    t.setStyle(TableStyle(cmds))
    return t


def section_prestations_energia() -> List[Any]:
    """Section commerciale premium — 2 pages — après sommaire, avant synthèse."""
    st: List[Any] = []
    body_night = ParagraphStyle(
        "acc_body", parent=S["body"], fontSize=8.6, leading=11.5,
        textColor=C["night"], spaceAfter=4,
    )

    # ── PAGE 1 ──────────────────────────────────────────────────────────────
    st.append(Paragraph(
        "ENERGIA CONSEIL IA® — NOTRE ACCOMPAGNEMENT",
        ParagraphStyle("acc_h0", parent=S["body"], fontName=FONT_TITLE,
                       fontSize=9.5, textColor=C["teal"], alignment=TA_CENTER,
                       spaceAfter=3),
    ))
    st.append(Paragraph(
        "ENERGIA CONSEIL IA®",
        ParagraphStyle("acc_h1", parent=S["body"], fontName=FONT_TITLE,
                       fontSize=17, textColor=C["night"], alignment=TA_CENTER,
                       leading=20, spaceAfter=2),
    ))
    st.append(Paragraph(
        "Votre projet de rénovation, structuré de A à Z",
        ParagraphStyle("acc_h2", parent=S["body"], fontName=FONT_TITLE,
                       fontSize=11.5, textColor=C["teal"], alignment=TA_CENTER,
                       spaceAfter=6),
    ))
    st.append(Paragraph(
        "ENERGIA CONSEIL IA® accompagne les propriétaires dans la compréhension "
        "de leur logement, la définition d'un parcours de rénovation cohérent et "
        "la préparation des décisions nécessaires à un projet de travaux. Notre "
        "rôle consiste à rendre les sujets techniques, administratifs et "
        "financiers plus lisibles afin de permettre une décision éclairée.",
        body_night))
    st.append(sp(0.1))

    st.append(_prest_bloc(
        "01", "DIAGNOSTIC &amp; STRUCTURATION DU PROJET",
        [
            "Analyse des documents, photos, équipements et consommations disponibles.",
            "Identification des priorités : toiture, humidité, isolation, ventilation, "
            "chauffage et solaire.",
            "Comparaison de scénarios de rénovation.",
            "Simulations visuelles avant/après à vocation illustrative.",
        ],
        "Les simulations visuelles et thermographiques sont indicatives. Elles ne "
        "remplacent pas une thermographie infrarouge sur site, un audit réglementaire, "
        "un DPE ou une étude thermique opposable.",
    ))
    st.append(sp(0.08))
    st.append(_prest_bloc(
        "02", "CONCEPTION DU PARCOURS DE TRAVAUX",
        [
            "Définition d'un ordre de travaux cohérent.",
            "Prise en compte des contraintes des bâtiments anciens.",
            "Pour le pisé : vigilance sur humidité, perspirance, soubassements, "
            "enduits compatibles et ventilation.",
            "Préparation des informations techniques utiles aux entreprises.",
        ],
    ))
    st.append(sp(0.08))
    st.append(_prest_bloc(
        "03", "CONSULTATION &amp; COORDINATION",
        [
            "Préparation des lots : toiture, isolation, menuiseries, ventilation, "
            "chauffage, eau chaude sanitaire et photovoltaïque.",
            "Lecture comparative des devis fournis.",
            "Aide à la coordination des décisions et des étapes du projet.",
        ],
        "Le choix des entreprises, la signature des devis et l'exécution des "
        "travaux relèvent de la cliente et des professionnels concernés.",
    ))
    st.append(sp(0.08))
    st.append(_prest_bloc(
        "04", "AIDES &amp; FINANCEMENT",
        [
            "Préparation des éléments nécessaires à l'étude des aides : "
            "MaPrimeRénov', CEE, éco-PTZ et aides locales.",
            "Lecture pédagogique du reste à financer après réception des devis "
            "et documents nécessaires.",
            "Orientation possible vers un partenaire de financement.",
        ],
        "Les aides et solutions de financement sont conditionnelles. Elles "
        "dépendent du dossier, des devis, de l'éligibilité, des règles applicables "
        "et de la décision des organismes concernés.",
    ))
    st.append(sp(0.15))
    st.append(_prest_contact_footer())
    st.append(PageBreak())

    # ── PAGE 2 ──────────────────────────────────────────────────────────────
    st.append(Paragraph(
        "Notre méthode pour le projet Clyve Andriot",
        ParagraphStyle("acc_m1", parent=S["body"], fontName=FONT_TITLE,
                       fontSize=15, textColor=C["night"], alignment=TA_CENTER,
                       spaceAfter=3),
    ))
    st.append(Paragraph(
        "ENERGIA CONSEIL IA® — parcours d'accompagnement dédié",
        ParagraphStyle("acc_m2", parent=S["body"], fontSize=9, textColor=C["teal"],
                       alignment=TA_CENTER, spaceAfter=8),
    ))
    st.append(Paragraph(
        "Pour la longère en pisé de Mme Clyve ANDRIOT (220 m², La Genête — 71), "
        "nous structurons le projet en cinq étapes claires, progressives et "
        "adaptées aux contraintes du bâti ancien.",
        body_night))
    st.append(sp(0.12))

    etapes = [
        ("1", "Comprendre le logement",
         "Analyse des documents, photos, usages et priorités techniques du bien."),
        ("2", "Définir la stratégie de rénovation",
         "Comparaison des scénarios : sécurisation, enveloppe performante "
         "et rénovation globale."),
        ("3", "Consulter les entreprises et actualiser les devis",
         "Préparation des lots et obtention de devis actualisés auprès "
         "des professionnels concernés."),
        ("4", "Étudier les aides et le financement",
         "Analyse conditionnelle après réception du RFR, des devis et des "
         "pièces demandées ; orientation possible vers le partenaire Fabien."),
        ("5", "Suivre les décisions et les résultats après travaux",
         "Organisation des décisions, suivi des étapes et lecture des "
         "résultats après mise en service."),
    ]
    for num, titre, desc in etapes:
        badge = Paragraph(
            f"<font color='white'><b>{num}</b></font>",
            ParagraphStyle("en", parent=S["body"], fontName=FONT_TITLE,
                           fontSize=13, alignment=TA_CENTER, textColor=C["white"]),
        )
        badge_t = Table([[badge]], colWidths=[1.05 * cm], rowHeights=[1.05 * cm])
        badge_t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), C["teal"]),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        content = [
            Paragraph(
                f"<font color='#0F172A'><b>{titre}</b></font>",
                ParagraphStyle("et", parent=S["body"], fontName=FONT_TITLE,
                               fontSize=10.5, textColor=C["night"], spaceAfter=1),
            ),
            Paragraph(
                desc,
                ParagraphStyle("ed", parent=S["body"], fontSize=8.5, leading=11.5,
                               textColor=C["night"]),
            ),
        ]
        row = Table([[badge_t, content]], colWidths=[1.4 * cm, CONTENT_WIDTH - 1.4 * cm])
        row.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#CBD5E1")),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        st.append(row)
        st.append(sp(0.14))

    st.append(sp(0.2))
    st.append(callout(
        "<b>Notre engagement :</b> transformer un projet complexe en feuille "
        "de route claire, progressive et adaptée au logement.",
        "green"))
    st.append(sp(0.15))
    st.append(vigilance_box(
        "Rappel de prudence",
        "Ce rapport est un document d'accompagnement non contractuel. Les devis, "
        "les aides et les financements restent à valider par la cliente, "
        "les entreprises et les organismes compétents. "
        f"{MARQUE} n'est ni entreprise exécutante, ni auditeur réglementaire, "
        "ni organisme de financement. {0}".format(MARQUE_LICENCE),
        "info"))
    st.append(sp(0.3))
    st.append(_prest_contact_footer())
    return st


def section_logement() -> List[Any]:
    st = [h1("4. Présentation du logement &amp; vigilance pisé/humidité")]
    st.append(h2("Fiche d'identité du bien"))
    st.append(data_table([
        ["Caractéristique", "Valeur (source documents)"],
        ["Propriétaire occupante", CLIENT["nom"]],
        ["Composition du foyer", CLIENT["foyer"]],
        ["Type de bien", CLIENT["type_bien"]],
        ["Surface", f"{CLIENT['surface']} m²"],
        ["Année de construction", CLIENT["annee"]],
        ["Adresse", CLIENT["adresse"]],
        ["Altitude", CLIENT["altitude"]],
        ["Zone climatique", CLIENT["zone_clim"]],
        ["Configuration", CLIENT["niveaux"]],
        ["Structure des murs", "Pisé ~60 cm (FIL ROUGE) — 50 à 80 cm (BAO)"],
        ["Toiture", "Tuiles canal, non isolée"],
        ["Plancher bas", "Terre-plein, structure bois/paille"],
        ["Visite / audit FIL ROUGE", CLIENT["visite_fil"]],
        ["Étude BAO", CLIENT["etude_bao"]],
    ], col_widths=[6 * cm, 11 * cm]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Point de vigilance — Pisé &amp; humidité",
        "Le pisé (terre crue compactée) est un matériau <b>perspirant</b> et "
        "sensible à l'eau. Trois règles d'or : (1) ne jamais bloquer la migration "
        "de vapeur avec des enduits ou isolants étanches (ciment, PSE collé sans "
        "précaution) ; (2) préserver et améliorer le drainage en pied de mur ; "
        "(3) privilégier des matériaux <b>perspirants et bio-sourcés</b> "
        "(chaux-chanvre, enduits chaux, fibre de bois). Un diagnostic humidité "
        "en pied de mur est recommandé avant toute ITE.", "warn"))
    st.append(callout(
        "L'audit FIL ROUGE retient d'ailleurs une <b>ITE chaux-chanvre projeté "
        "24 cm (R=5,5)</b> et des <b>enduits chaux</b> avec pare-pluie perspirant : "
        "des choix cohérents avec la nature du bâti pisé.", "green"))
    st.append(source_note("FIL ROUGE (état initial, scénario 1) ; BAO (caractéristiques bâti)."))
    return st


def section_etat_energetique() -> List[Any]:
    st = [h1("5. État énergétique initial")]
    st.append(p(
        "Avant travaux, la performance du logement est faible. Les deux études "
        "convergent sur un constat d'inconfort et de surconsommation, avec toutefois "
        "des chiffres différents (méthodes et dates distinctes)."))
    st.append(h2("Indicateurs clés — audit FIL ROUGE (06/06/2025)"))
    st.append(data_table([
        ["Indicateur", "Valeur"],
        ["Ubat avant travaux", FIL["ubat_avant"]],
        ["Ubat base (référence)", FIL["ubat_base"]],
        ["Consommation (énergie primaire)", FIL["conso_avant_ep"]],
        ["Consommation (énergie finale)", FIL["conso_avant_ef"]],
        ["Coût énergie annuel estimé", FIL["cout_annuel"]],
    ], col_widths=[9 * cm, 8 * cm]))
    st.append(sp(0.2))
    st.append(h3("Répartition des consommations avant travaux (énergie primaire)"))
    st.append(data_table([
        ["Usage", "Énergie primaire", "Coût annuel estimé"],
        ["Chauffage — bois bûches", FIL["rep_chauffage_bois_ep"], FIL["cout_chauffage"]],
        ["Chauffage — électricité", FIL["rep_chauffage_elec_ep"], "(inclus ci-dessus)"],
        ["Eau chaude sanitaire (ECS)", FIL["rep_ecs_ep"], FIL["cout_ecs"]],
        ["Éclairage", FIL["rep_ecl_ep"], FIL["cout_ecl"]],
        ["TOTAL", "~ 680 EP", FIL["cout_annuel"]],
    ], col_widths=[6.5 * cm, 5 * cm, 5.5 * cm], total_rows=[5]))
    st.append(sp(0.2))
    st.append(h2("Équipements existants (FIL ROUGE)"))
    st.append(data_table([
        ["Poste", "Équipement", "État"],
        ["Chauffage principal", "Convecteur électrique ancien", "Bon"],
        ["Chauffage d'appoint", "Cuisinière / foyer fermé / poêle bûche / insert", "Mauvais"],
        ["Eau chaude sanitaire", "Ballon électrique 200 L", "Mauvais"],
        ["Ventilation", "Par ouverture des fenêtres", "Non fonctionnelle"],
        ["Pilotage / régulation", "Aucun pilotage", "Absent"],
    ], col_widths=[4.5 * cm, 9 * cm, 3.5 * cm]))
    st.append(sp(0.2))
    st.append(h2("Comparaison FIL ROUGE / BAO — un écart à documenter"))
    st.append(data_table([
        ["Indicateur", "FIL ROUGE (2025)", "BAO (2024)"],
        ["Consommation énergie primaire", "680 kWhEP/m².an", "432 kWhEP/m²"],
        ["Énergie finale", "499 kWhEF/m².an", "54 161 kWh/an"],
        ["Dépense annuelle estimée", "8 100 – 10 990 €", "~ 8 727 €"],
        ["Cep (contexte éco-PTZ, BAO)", "—", "508 kWh/m²"],
    ], col_widths=[6 * cm, 5.5 * cm, 5.5 * cm]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Point de vigilance — Écart entre les deux études",
        "Les deux études affichent des consommations différentes "
        "(<b>680 kWhEP/m² côté FIL ROUGE, 432 kWhEP/m² côté BAO</b>). Cet écart "
        "s'explique par des méthodes de calcul, des hypothèses et des dates "
        "différentes. Il n'est pas anormal, mais il doit être <b>arbitré et "
        "documenté</b> avant tout chiffrage final. Ce rapport présente les deux "
        "sources sans trancher.", "warn"))
    st.append(source_note(
        "FIL ROUGE p.6–8 et résultats scénarios ; BAO p.11, p.21 (éco-PTZ)."))
    return st


def section_diagnostic_visuel() -> List[Any]:
    st = [h1("6. Diagnostic visuel — photographies par façade")]
    st.append(p(
        "Les photographies ci-après documentent l'état extérieur du bien au moment "
        "de la visite. Elles servent de base au repérage des zones sensibles "
        "(pieds de murs, encadrements, jonctions toiture/murs) et complètent les "
        "observations de l'auditeur. Ce sont des <b>photographies réelles</b>, à "
        "distinguer des simulations de la section suivante."))
    st.append(source_note(
        "Photographies transmises dans le dossier client (répertoire images/)."))
    st.append(PageBreak())
    for i, (fname, label) in enumerate(PHOTOS_REELLES):
        st.append(h2(f"6.{i + 1} — {label}"))
        st.extend(safe_image(fname, f"Photo réelle — {label}"))
        st.append(sp(0.2))
        st.append(p(
            f"Vue « {label.lower()} » du bien. Points à observer en visite : "
            "état des enduits, présence de fissures, remontées d'humidité en pied "
            "de mur, état des menuiseries et des appuis, jonctions avec la toiture. "
            "<i>Observations détaillées à confirmer lors de la visite technique.</i>"))
        st.append(callout(
            "Éléments à relever par l'entreprise RGE : nature exacte de l'enduit "
            "existant, épaisseur du mur, présence d'un soubassement, largeur des "
            "débords de toiture — autant de paramètres qui conditionnent la "
            "faisabilité et le coût de l'ITE.", "info"))
        if i < len(PHOTOS_REELLES) - 1:
            st.append(PageBreak())
    return st


def section_thermographie() -> List[Any]:
    st = [h1("7. Simulations thermographiques (illustratives)")]
    st.append(vigilance_box(
        THERMO_TITLE,
        THERMO_WARNING + " Les images de cette section sont des <b>simulations "
        "visuelles</b> destinées à illustrer pédagogiquement les zones "
        "habituellement déperditives d'une longère non isolée (toiture, murs, "
        "pignons, menuiseries). Elles ne reposent sur aucune mesure réelle du "
        "bien et ne préjugent pas de l'état thermique effectif.", "crit"))
    st.append(sp(0.2))
    st.append(p(
        "Une thermographie infrarouge réelle nécessite des conditions précises "
        "(écart de température intérieur/extérieur suffisant, absence de soleil "
        "direct, caméra étalonnée). Elle pourra être réalisée sur site si "
        "nécessaire pour objectiver les ponts thermiques."))
    st.append(source_note(
        "Visuels de simulation (répertoire images/). Aucune mesure sur site."))
    st.append(PageBreak())
    for i, (fname, label) in enumerate(THERMO_SIMULATIONS):
        st.append(h2(f"7.{i + 1} — {label}"))
        st.append(callout("<b>" + THERMO_TITLE + "</b>", "crit"))
        st.extend(safe_image(fname, THERMO_TITLE))
        st.append(sp(0.15))
        st.append(callout(THERMO_WARNING, "warn"))
        st.append(p(
            "Lecture pédagogique : sur une longère en pisé non isolée, les "
            "déperditions se concentrent typiquement au niveau de la toiture "
            "(air chaud ascendant), des murs (grande surface), des pignons "
            "exposés et des menuiseries anciennes. La simulation illustre ce "
            "principe général. <i>Les zones réelles seront confirmées par "
            "diagnostic sur site.</i>"))
        if i < len(THERMO_SIMULATIONS) - 1:
            st.append(PageBreak())
    return st


def section_deperditions() -> List[Any]:
    st = [h1("8. Analyse des déperditions thermiques")]
    st.append(p(
        "L'analyse des déperditions permet de hiérarchiser les priorités de "
        "travaux. Sur un bâti ancien en pisé non isolé, les postes les plus "
        "déperditifs sont généralement la toiture et les murs. Le tableau "
        "ci-dessous présente une <b>répartition indicative typique</b>, à "
        "confirmer par l'étude thermique détaillée."))
    st.append(vigilance_box(
        "Répartition indicative — à confirmer",
        "Les pourcentages ci-dessous sont des <b>ordres de grandeur pédagogiques</b> "
        "pour un bâti ancien non isolé. Ils ne proviennent pas d'un calcul "
        "spécifique au bien et doivent être confirmés par l'étude thermique et "
        "les relevés sur site.", "warn"))
    st.append(data_table([
        ["Poste de déperdition", "Ordre de grandeur indicatif", "Priorité"],
        ["Toiture (non isolée)", "25 – 30 %", "Très élevée"],
        ["Murs (pisé non isolé)", "20 – 25 %", "Élevée"],
        ["Renouvellement d'air / infiltrations", "20 – 25 %", "Élevée"],
        ["Menuiseries (fenêtres, portes)", "10 – 15 %", "Moyenne"],
        ["Plancher bas (terre-plein)", "7 – 10 %", "Moyenne"],
        ["Ponts thermiques", "5 – 10 %", "À traiter en continuité"],
    ], col_widths=[7.5 * cm, 5.5 * cm, 4 * cm]))
    st.append(sp(0.2))
    st.append(h2("Ce que disent les études sur le bien"))
    st.append(p(
        "L'audit FIL ROUGE mesure un <b>Ubat avant travaux de 1,667 W/(m².K)</b>, "
        "très supérieur à l'Ubat base de référence (0,356). Après une rénovation "
        "globale (scénario 1), l'Ubat descendrait à <b>0,337 W/(m².K)</b>, soit une "
        "réduction de consommation de <b>-84 % (-573 kWhEP/m².an)</b>."))
    st.append(kpi_row([
        ("Ubat avant", "1,667"),
        ("Ubat base", "0,356"),
        ("Ubat après (sc.1)", "0,337"),
        ("Gain conso.", "-84 %"),
    ]))
    st.append(sp(0.2))
    st.append(p(
        "L'étude BAO confirme le fort potentiel : l'isolation des rampants + "
        "combles présente à elle seule un temps de retour brut de <b>4,4 ans</b> "
        "(économie ~3 415 €/an pour ~15 027 €). L'étape 1 « Isolation + "
        "ventilation » (~69 017 €) réduirait la consommation à ~3 407 €/an."))
    st.append(callout(
        "<b>Enseignement clé :</b> agir en priorité sur l'enveloppe (toiture puis "
        "murs) offre le meilleur rapport gain/coût et prépare le terrain pour un "
        "changement de chauffage efficace. Le changement de chauffage seul, sur un "
        "bâti non isolé, est bien moins rentable.", "green"))
    st.append(source_note(
        "FIL ROUGE (Ubat, gains scénario 1) ; BAO (vue économique p.15, "
        "temps de retour)."))
    return st


def section_pise() -> List[Any]:
    st = [h1("9. Principes techniques du pisé &amp; points de vigilance")]
    st.append(p(
        "Le pisé est une technique de construction en <b>terre crue compactée</b>, "
        "très répandue dans la région. Ses qualités (inertie thermique, régulation "
        "hygrométrique, matériau local et sain) s'accompagnent de contraintes "
        "spécifiques qu'il faut respecter pour ne pas endommager le bâti."))
    st.append(h2("Comportement hygrothermique"))
    st.append(bullet_list([
        "<b>Inertie thermique élevée :</b> les murs épais (~60 cm) stockent la "
        "chaleur et lissent les variations de température, avantage en été.",
        "<b>Perspirance :</b> le mur laisse migrer la vapeur d'eau. Cette "
        "respiration doit être préservée : tout revêtement étanche piège "
        "l'humidité dans le mur et le fragilise.",
        "<b>Sensibilité à l'eau liquide :</b> remontées capillaires, infiltrations "
        "de toiture et rejaillissement en pied de mur sont les principaux risques.",
    ], S["sm"]))
    st.append(vigilance_box(
        "Point de vigilance — Humidité du pisé",
        "Avant toute isolation, vérifier et traiter les sources d'humidité : "
        "état de la couverture et des débords, gouttières, drainage périphérique, "
        "absence de ciment en pied de mur. Une ITE posée sur un mur humide "
        "aggrave le problème. Un <b>diagnostic humidité</b> est recommandé.", "warn"))
    st.append(h2("Matériaux compatibles recommandés"))
    st.append(data_table([
        ["Application", "Solution perspirante adaptée"],
        ["Isolation des murs (ITE)", "Chaux-chanvre projeté, blocs de chanvre, fibre de bois"],
        ["Enduits extérieurs", "Enduit à la chaux (jamais ciment sur pisé)"],
        ["Isolation toiture / rampants", "Laine de bois, laine minérale avec pare-vapeur adapté"],
        ["Finitions intérieures", "Enduits terre ou chaux, peintures perspirantes"],
    ], col_widths=[6 * cm, 11 * cm]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Point de vigilance — Ventilation indispensable",
        "Isoler et rendre étanche à l'air un logement <b>sans installer de "
        "ventilation performante</b> dégrade la qualité de l'air et favorise les "
        "désordres liés à l'humidité (condensation, moisissures). La ventilation "
        "actuelle (ouverture des fenêtres) est jugée non fonctionnelle : une VMC "
        "(double flux Hygro B dans le scénario global) est indispensable.", "crit"))
    st.append(source_note(
        "Principes techniques du bâti pisé ; choix matériaux cohérents avec les "
        "préconisations FIL ROUGE (chaux-chanvre, enduits chaux, pare-pluie "
        "perspirant)."))
    return st


# Détail pédagogique par poste (spécifications strictement issues du FIL ROUGE)
POSTES_DETAIL = [
    ("Toiture — réfection & isolation des rampants",
     "Réfection complète charpente + couverture tuiles canal (reconstruction "
     "panne sablière, remplacement chevrons défaillants) ; isolation des rampants "
     "par laine minérale 30 cm (R=6,5). Surface : 275 m² (audit) — 310 m² (devis 2023).",
     "La toiture est le premier poste de déperdition et l'enjeu majeur de mise "
     "hors d'eau. Une couverture saine conditionne la durabilité de tout le reste "
     "(isolation, éventuel photovoltaïque).",
     ("Écart de surface 275 / 310 m² à arbitrer avant chiffrage. Coordonner avec "
      "une éventuelle pose de panneaux PV pour éviter dépose/repose ultérieure.", "warn"),
     "~ 27 500 € (rampants) + ~ 70 000 € (charpente+couverture) — estimations d'audit"),
    ("Murs pisé — ITE chaux-chanvre",
     "Isolation thermique par l'extérieur des murs pisé : préparation du support, "
     "ossature secondaire bois, projection mécanique chaux-chanvre 24 cm (R=5,5), "
     "puis enduit chaux de finition 2,5 cm avec pare-pluie perspirant. Surface : 160 m².",
     "Technique adaptée au pisé : matériaux bio-sourcés perspirants qui préservent "
     "les qualités hygrothermiques du bâti ancien tout en réduisant fortement les "
     "déperditions par les murs.",
     ("Ne jamais utiliser d'enduit ciment sur pisé. Traiter l'humidité en pied de "
      "mur avant l'ITE. Vérifier la nature de l'enduit existant.", "warn"),
     "~ 28 800 € (ITE) + ~ 8 000 € (enduit chaux) — estimations d'audit"),
    ("Mur garage — ITE complémentaire",
     "Isolation thermique par l'extérieur du mur donnant sur garage non chauffé, "
     "chaux-chanvre projeté 24 cm (R=5,5) + enduit chaux ; 25 m².",
     "Assure la continuité de l'isolation en périphérie et supprime un pont "
     "thermique vers un local non chauffé.",
     ("Vérifier la jonction avec l'ITE des murs pisé pour éviter toute "
      "discontinuité d'isolation.", "info"),
     "~ 4 500 € (ITE) + ~ 1 250 € (enduit) — estimations d'audit"),
    ("Plancher bas — isolation périphérique",
     "Isolation du plancher bas sur terre-plein par isolation périphérique en "
     "polystyrène extrudé 16 cm (R=4,0) + traitement des ponts thermiques ; 137 m².",
     "Améliore le confort (moins de pieds froids) et supprime les ponts "
     "thermiques à la jonction plancher / murs pisé.",
     ("Structure existante bois/paille sur terre-plein : faire valider la solution "
      "et la compatibilité avec l'humidité du sol par l'entreprise.", "warn"),
     "~ 8 200 € + ~ 2 740 € (finitions) — estimations d'audit"),
    ("Menuiseries — fenêtres & volets",
     "Remplacement de l'ensemble des fenêtres et portes-fenêtres par menuiseries "
     "bois triple vitrage (Uw~1,1), pose en dépose totale avec volets roulants "
     "intégrés ; 9 ouvrants (surface ~15,3 m²).",
     "Réduit les déperditions et améliore le confort thermique et acoustique. "
     "Supprime les ponts thermiques des menuiseries anciennes.",
     ("À poser après/avec l'isolation des murs pour un traitement cohérent des "
      "tableaux et de l'étanchéité à l'air.", "info"),
     "~ 22 000 € + ~ 3 500 € (finitions) — estimations d'audit"),
    ("Menuiseries — portes",
     "Remplacement de 2 portes d'entrée et service par portes bois hautes "
     "performances (Ud~1,2), dépose totale, isolation périphérique renforcée, "
     "quincaillerie sécurisée 3 points.",
     "Améliore l'étanchéité à l'air des entrées principales, le confort et la "
     "sécurité.",
     ("Soigner les seuils étanches et les habillages pour éviter les ponts "
      "thermiques et les infiltrations.", "info"),
     "~ 5 600 € + ~ 1 200 € (finitions) — estimations d'audit"),
    ("Ventilation — VMC Double Flux Hygro B",
     "Installation d'une VMC Double Flux Hygro B avec récupération de chaleur "
     "(efficacité 85 %), caisson classe A, réseau gainé isolé, bouches "
     "hygroréglables, débit adapté 180 m³/h, filtres F7.",
     "Indispensable après l'amélioration de l'étanchéité à l'air : maîtrise le "
     "renouvellement d'air, récupère la chaleur et préserve la qualité de l'air "
     "et la santé du bâti.",
     ("Sans ventilation performante, une enveloppe étanchéifiée favorise la "
      "condensation et les désordres d'humidité, particulièrement sur pisé.", "crit"),
     "~ 6 500 € + ~ 3 200 € (réseau) — estimations d'audit"),
    ("Chauffage — PAC Air/Eau & plancher chauffant",
     "Installation d'une PAC Air/Eau double service (chauffage + ECS) 15 kW, "
     "SCOP 4,5 / COP ECS 3,5, raccordée à un plancher chauffant hydraulique basse "
     "température 137 m² ; dépose des radiateurs électriques ; neutralisation des "
     "prises dédiées.",
     "Remplace un chauffage électrique/bois peu performant par une solution bas "
     "carbone très efficace, compatible avec le plancher chauffant basse "
     "température.",
     ("Dimensionner la PAC APRÈS l'isolation de l'enveloppe : sur bâti non isolé, "
      "surdimensionnement et surcoût de 4 000 à 6 000 €.", "warn"),
     "~ 18 000 € (PAC) + ~ 11 500 € (plancher) + ~ 600 € + ~ 5 500 € (mise en "
     "service) — estimations d'audit"),
    ("Eau chaude sanitaire — ballons thermodynamiques",
     "Remplacement des 2 ballons électriques (200 L + 300 L) par 2 ballons "
     "thermodynamiques équivalents (500 L cumulés) à COP optimisé ; dépose des "
     "anciens ballons et raccordements.",
     "Réduit fortement la consommation d'eau chaude, poste important pour un "
     "foyer de 5 personnes.",
     ("Prévoir l'emplacement et l'apport d'air nécessaires au bon fonctionnement "
      "des ballons thermodynamiques.", "info"),
     "~ 8 500 € — estimation d'audit"),
]


def section_details_postes() -> List[Any]:
    st = [h1("9 bis. Détail technique des postes de travaux")]
    st.append(p(
        "Cette section décrit poste par poste les travaux envisagés dans le "
        "scénario global (FIL ROUGE), leurs spécifications techniques, leur "
        "intérêt et les points de vigilance associés. Les <b>spécifications sont "
        "issues de l'audit</b> ; les montants restent des <b>estimations d'audit "
        "à confirmer par devis RGE 2026</b> (jamais des devis)."))
    st.append(callout(
        "L'ordre de lecture suit l'ordre technique recommandé : enveloppe "
        "(toiture, murs, planchers) -> menuiseries -> ventilation -> chauffage "
        "-> eau chaude. Le photovoltaïque, en option, est traité en section 15.",
        "info"))
    st.append(source_note(
        "FIL ROUGE — détail des travaux énergétiques et induits (scénario 1)."))
    st.append(PageBreak())
    for i, (titre, spec, interet, vig, cout) in enumerate(POSTES_DETAIL):
        st.append(h2(f"9 bis.{i + 1} — {titre}"))
        st.append(h3("Description (spécifications d'audit)"))
        st.append(p(spec))
        st.append(h3("Pourquoi ce poste"))
        st.append(p(interet))
        st.append(h3("Repère de coût (estimation d'audit)"))
        st.append(callout(f"<b>{cout}.</b> Estimation d'audit, non contractuelle — "
                          "à confirmer par devis RGE 2026.", "note"))
        st.append(sp(0.15))
        st.append(vigilance_box("Point de vigilance — " + titre.split(" — ")[0], vig[0], vig[1]))
        if i < len(POSTES_DETAIL) - 1:
            st.append(PageBreak())
    return st


def section_devis_existants() -> List[Any]:
    st = [h1("10. État des devis existants — devis toiture 2023")]
    st.append(vigilance_box(
        "Devis historique de 2023 — expiré — à actualiser avant tout engagement",
        f"Le devis toiture de <b>{DEVIS['entreprise']} ({DEVIS['numero']}, "
        f"{DEVIS['date']})</b> est un <b>devis historique de 2023 — expiré — "
        "à actualiser avant tout engagement</b>. Sa validité d'origine "
        f"({DEVIS['validite']}) est dépassée et ses prix ne sont plus d'actualité. "
        "Il ne peut en aucun cas être considéré comme une offre en vigueur.", "crit"))
    st.append(h2("Données du devis historique"))
    st.append(data_table([
        ["Élément", "Valeur (devis 2023)"],
        ["Entreprise", f"{DEVIS['entreprise']} — {DEVIS['numero']}"],
        ["Date", DEVIS["date"]],
        ["Objet", DEVIS["objet"]],
        ["Surface", DEVIS["surface"]],
        ["Type de tuile", DEVIS["tuile"]],
        ["Montant HT", DEVIS["ht"]],
        ["TVA", DEVIS["tva"]],
        ["Montant TTC", DEVIS["ttc"]],
        ["Validité", DEVIS["validite"]],
        ["Statut RGE de l'entreprise", "À confirmer (non précisé dans la source)"],
    ], col_widths=[6 * cm, 11 * cm], total_rows=[8]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Écart de surface toiture à arbitrer",
        "La <b>surface du devis (310 m²)</b> diffère de la <b>surface retenue par "
        "l'audit FIL ROUGE (275 m²)</b> pour l'isolation des rampants et la "
        "réfection de couverture. Cet écart de 35 m² doit être <b>arbitré avant "
        "chiffrage final</b> (mesures sur site, périmètre exact des surfaces "
        "concernées).", "warn"))
    st.append(callout(
        "Le détail ligne à ligne du devis 2023 figure sur le document original "
        "annexé (image du devis). Ce rapport n'en reproduit pas les lignes pour "
        "éviter toute confusion avec un chiffrage à jour : seuls les totaux et "
        "caractéristiques principales sont rappelés ci-dessus.", "info"))
    st.append(source_note(
        f"Devis {DEVIS['entreprise']} {DEVIS['numero']} du {DEVIS['date']} "
        "(document historique, extrait image en annexe)."))
    return st


def section_devis_manquants() -> List[Any]:
    st = [h1("11. Devis manquants à obtenir")]
    st.append(p(
        "Pour transformer les estimations d'audit en chiffrage engageant, il faut "
        "consulter des entreprises <b>RGE</b> et obtenir <b>2 à 3 devis par poste</b>. "
        "La liste ci-dessous récapitule les devis à collecter, par corps d'état, "
        "dans l'ordre logique des travaux."))
    st.append(data_table([
        ["Poste", "Devis à obtenir (RGE)", "Priorité"],
        ["Toiture", "Réfection charpente + couverture + isolation rampants (devis 2026)", "1 — Urgent"],
        ["Murs", "ITE chaux-chanvre murs pisé + mur garage + enduits chaux", "2"],
        ["Plancher bas", "Isolation périphérique terre-plein", "3"],
        ["Menuiseries", "Fenêtres bois triple vitrage + volets + 2 portes", "4"],
        ["Ventilation", "VMC Double Flux Hygro B", "5"],
        ["Chauffage", "PAC Air/Eau + plancher chauffant hydraulique", "6 (après isolation)"],
        ["Eau chaude", "2 ballons thermodynamiques (500 L cumulés)", "7"],
        ["Solaire (option)", "PV 6 kWc + batterie 7 kWh — budget travail 18 000 € TTC", "8 (option)"],
        ["Diagnostic humidité", "Étude humidité pied de mur pisé (recommandée)", "Préalable"],
    ], col_widths=[3.5 * cm, 9.5 * cm, 4 * cm]))
    st.append(sp(0.2))
    st.append(callout(
        "<b>Bonnes pratiques de consultation :</b> demander des devis détaillés "
        "(quantités, R visés, marques, garanties), vérifier la certification RGE "
        "en cours de validité, exiger l'assurance décennale, et comparer à "
        "périmètre identique. Un même poste peut varier fortement d'une entreprise "
        "à l'autre.", "green"))
    st.append(vigilance_box(
        "Point de vigilance — Dimensionnement PAC",
        "Le devis PAC ne doit être finalisé <b>qu'après</b> la réalisation de "
        "l'isolation, ou sur la base des performances d'enveloppe post-travaux. "
        "Dimensionner la PAC sur le bâti actuel (non isolé) conduirait à un "
        "surdimensionnement coûteux et à un fonctionnement dégradé.", "warn"))
    st.append(source_note(
        "Postes issus des scénarios FIL ROUGE et préconisations BAO ; "
        "bonnes pratiques de consultation ENERGIA CONSEIL IA®."))
    return st


def _sc_intro(num: str, titre: str, sous_titre: str) -> List[Any]:
    return [h1(f"{num}. {titre}"), callout(f"<b>{sous_titre}</b>", "info")]


def section_scenario1() -> List[Any]:
    st = _sc_intro(
        "12", "SCÉNARIO 1 — Sécurisation toiture &amp; confort",
        "Objectif : sécuriser le clos-couvert et gagner en confort par des gestes "
        "prioritaires, en s'appuyant notamment sur la question toiture.")
    st.append(p(
        "Ce scénario traite en priorité la <b>toiture</b> (poste le plus "
        "déperditif et enjeu de mise hors d'eau) et les premiers gestes de confort. "
        "Il constitue une première étape pragmatique lorsque le budget global n'est "
        "pas mobilisable immédiatement."))
    st.append(h2("Périmètre indicatif"))
    st.append(bullet_list([
        "Réfection charpente + couverture (tuiles canal) et isolation des rampants "
        "(R=6,5) — surface à arbitrer entre 275 m² (audit) et 310 m² (devis 2023).",
        "Remplacement des menuiseries les plus dégradées (fenêtres, portes) — "
        "à prioriser selon état constaté.",
        "Mise en place d'une ventilation adaptée pour accompagner l'étanchéité à "
        "l'air apportée par les menuiseries.",
    ], S["sm"]))
    st.append(h2("Repères chiffrés (à confirmer par devis 2026)"))
    st.append(data_table([
        ["Poste", "Repère de coût (source)", "Nature"],
        ["Toiture (réfection + couverture)", "Devis historique 2023 : 40 788,66 € TTC", "À réactualiser 2026"],
        ["Isolation rampants (275 m², R=6,5)", "FIL ROUGE : ~ 27 500 € TTC", "Estimation d'audit"],
        ["Menuiseries fenêtres (9 ouvrants)", "FIL ROUGE : ~ 22 000 € TTC", "Estimation d'audit"],
        ["Menuiseries portes (2)", "FIL ROUGE : ~ 5 600 € TTC", "Estimation d'audit"],
        ["Ventilation (VMC DF Hygro B)", "FIL ROUGE : ~ 6 500 € TTC", "Estimation d'audit"],
    ], col_widths=[6 * cm, 7 * cm, 4 * cm]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Attention — total non additionné volontairement",
        "Les repères ci-dessus proviennent de <b>sources différentes</b> (devis "
        "historique 2023 vs estimations d'audit 2025) et de <b>périmètres de "
        "surface différents</b>. Les additionner produirait un total trompeur. "
        "Le montant global du scénario 1 sera établi par les <b>devis 2026</b>.", "crit"))
    st.append(callout(
        "Ce scénario ne permet pas, à lui seul, d'atteindre une performance "
        "élevée : il sécurise le bâti et améliore le confort, mais l'isolation des "
        "murs et le changement de chauffage restent à programmer (scénarios 2 et 3).",
        "info"))
    st.append(h2("Étude de financement — partenaire Fabien"))
    st.append(p(
        "Pour ce Scénario Toiture &amp; Combles, un budget de travail d'environ "
        "<b>50 788 €</b> peut être soumis à <b>étude</b> auprès du partenaire "
        "<b>Fabien</b> (enveloppe indicative 6 000 € à 75 000 €). Toute "
        "acceptation, tout délai et tout déblocage dépendent du dossier et du "
        "prêteur — <b>rien n'est garanti</b> dans ce rapport (détail en section 17)."))
    st.append(callout(
        "<b>Orientation :</b> Fabien — partenaire courtier en financement de travaux. "
        "Voir section 17 — Solutions de financement — étude avec notre partenaire Fabien.",
        "info"))
    st.append(source_note(
        "Devis toiture historique 2023 ; FIL ROUGE (postes rampants, menuiseries, "
        "ventilation). Budget de travail 50 788 € : chiffrage indicatif soumis "
        "à étude Fabien (aucun accord ni délai garanti)."))
    return st


def section_scenario2() -> List[Any]:
    st = _sc_intro(
        "13", "SCÉNARIO 2 — Enveloppe performante",
        "Recommandé AVANT tout changement de chauffage : isoler l'enveloppe pour "
        "réduire les besoins, puis dimensionner le chauffage sur un bâti performant.")
    st.append(p(
        "Ce scénario vise une <b>enveloppe performante</b> : isolation des murs "
        "pisé, de la toiture et du plancher bas, remplacement des menuiseries et "
        "ventilation double flux. Il correspond à la logique « par étapes » de "
        "l'audit FIL ROUGE et à l'étape 1 « isolation + ventilation » de la BAO."))
    st.append(h2("Repères FIL ROUGE — rénovation par étapes"))
    st.append(data_table([
        ["Étape (FIL ROUGE)", "Contenu principal", "Coût estimé TTC", "Gain conso."],
        ["Étape 1", "Menuiseries, portes, ITE garage, ITE murs pisé, "
                    "plancher bas, plancher chauffant", FIL["sc2_e1"], "-18 %"],
        ["Étape 2", "Réfection toiture + isolation rampants, VMC Double Flux", FIL["sc2_e2"], "-71 %"],
    ], col_widths=[3.2 * cm, 8.3 * cm, 3 * cm, 2.5 * cm]))
    st.append(sp(0.2))
    st.append(h2("Repères BAO — étape isolation + ventilation"))
    st.append(data_table([
        ["Préconisation BAO", "Coût TTC", "Conso après", "Économie/an", "Retour brut"],
        ["Isolation rampants + combles", "15 027 €", "—", "3 415 €", "4,40 ans"],
        ["ITE chanvre + ITI LDV", "30 158 €", "—", "1 848 €", "16,32 ans"],
        ["Fenêtres bois", "4 174 €", "—", "383 €", "10,91 ans"],
        ["VMR (ventilation)", "1 899 €", "—", "- 12 €", "—"],
        ["ÉTAPE 1 — Isolation + ventilation", "69 017 €", "3 407 €/an", "5 320 €", "12,97 ans"],
    ], col_widths=[6 * cm, 2.6 * cm, 2.8 * cm, 2.8 * cm, 2.8 * cm], total_rows=[5]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Écart FIL ROUGE / BAO à arbitrer",
        "Les deux études structurent les étapes différemment et ne chiffrent pas "
        "exactement les mêmes lots (ex. la BAO parle d'ITE chanvre + ITI laine de "
        "verre ; le FIL ROUGE d'ITE chaux-chanvre 24 cm). Ces <b>écarts de "
        "périmètre et de coût</b> doivent être arbitrés avant le chiffrage final. "
        "Ce rapport présente les deux visions sans les fusionner.", "warn"))
    st.append(vigilance_box(
        "Point de vigilance — Ventilation &amp; pisé",
        "L'amélioration de l'étanchéité à l'air (menuiseries, enduits) impose une "
        "ventilation mécanique performante pour préserver la qualité de l'air et "
        "la santé du mur pisé. La VMC double flux Hygro B est le choix retenu par "
        "l'audit pour ce scénario.", "warn"))
    st.append(callout(
        "<b>Pourquoi ce scénario avant la PAC ?</b> Une enveloppe performante "
        "réduit fortement les besoins de chauffage. La PAC (scénario 3) peut alors "
        "être dimensionnée plus petite, moins chère et plus efficace. C'est "
        "l'ordre technique recommandé.", "green"))
    st.append(source_note(
        "FIL ROUGE (scénario 2 par étapes, p.8a à p.19) ; BAO (vue économique p.15, "
        "synoptique p.16)."))
    return st


def section_scenario3() -> List[Any]:
    st = _sc_intro(
        "14", "SCÉNARIO 3 — Rénovation globale bas carbone",
        "Scénario complet « en une fois » recommandé par l'auditeur : enveloppe "
        "complète + PAC Air/Eau + plancher chauffant + ballons thermodynamiques.")
    st.append(p(
        "Ce scénario correspond à la <b>rénovation globale « en une fois »</b> de "
        "l'audit FIL ROUGE. Il traite l'ensemble des postes et vise une "
        "performance élevée, avec abandon des énergies fossiles/bois peu "
        "performantes au profit d'une solution bas carbone (PAC Air/Eau)."))
    st.append(kpi_row([
        ("Coût estimé (audit)", "~237 k€"),
        ("+ Option PV (travail)", "+ 18 k€"),
        ("Total travail global+PV", "~255 k€"),
        ("Gain conso.", "-84 %"),
    ]))
    st.append(sp(0.2))
    st.append(h2("Détail des postes — travaux énergétiques (estimations d'audit TTC)"))
    st.append(data_table(
        [["Poste", "Spécification", "Coût estimé TTC"]] + [list(x) for x in FIL_SC1_POSTES],
        col_widths=[4.3 * cm, 9.7 * cm, 3 * cm]))
    st.append(PageBreak())
    st.append(h2("14 (suite). Travaux induits (estimations d'audit TTC)"))
    st.append(data_table(
        [["Poste", "Spécification", "Coût estimé TTC"]] + [list(x) for x in FIL_SC1_INDUITS],
        col_widths=[4.3 * cm, 9.7 * cm, 3 * cm]))
    st.append(sp(0.2))
    st.append(callout(
        f"<b>Total estimé par l'audit FIL ROUGE (hors PV) :</b> {FIL['sc1_total']} "
        "(travaux énergétiques + induits). Il s'agit d'une <b>estimation d'audit "
        "à la date de réalisation, pas d'un devis</b> ; les coûts évolueront et "
        "devront être confirmés par les entreprises RGE en 2026.", "crit"))
    st.append(h2("Option photovoltaïque — budget de travail"))
    st.append(data_table([
        ["Lot", "Périmètre", "Budget de travail", "Statut"],
        ["LOT PHOTOVOLTAÏQUE + BATTERIE",
         "6 kWc + batterie 7 kWh",
         FIL["pv_option_ttc"],
         "Hypothèse à valider par devis installateur"],
    ], col_widths=[4.5 * cm, 4 * cm, 3.5 * cm, 5 * cm], font_size=8.4))
    st.append(sp(0.15))
    st.append(callout(
        f"<b>Budget de travail scénario global + option PV :</b> "
        f"{FIL['sc1_total']} (FIL ROUGE) + {FIL['pv_option_ttc']} (option PV) "
        f"= <b>{FIL['sc1_total_avec_pv']}</b>. "
        "Ce total est une <b>simulation budgétaire de travail</b>, "
        "<b>non contractuelle</b> — il ne constitue <b>pas un devis</b>.",
        "green"))
    st.append(p(
        "<b>Budget de travail transmis par le porteur du projet — simulation "
        "non contractuelle.</b> Étude de structure, orientation, ombrages, "
        "raccordement et devis d'installateur qualifié requis. "
        "Aucun rendement, prime, économie ou rentabilité n'est garanti."))
    st.append(h2("Résultats attendus après travaux (FIL ROUGE)"))
    st.append(data_table([
        ["Indicateur", "Valeur après travaux"],
        ["Ubat", FIL["sc1_ubat_apres"]],
        ["Économie d'énergie", FIL["sc1_gain"]],
        ["Réduction énergie finale", "-80 % (-401 kWhEF/m².an)"],
        ["Réduction GES", "-86 % (-18 kg CO2/m².an)"],
        ["Dépense énergie estimée après", FIL["sc1_depense_apres"]],
    ], col_widths=[8.5 * cm, 8.5 * cm]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Point de vigilance — Dimensionnement PAC (rappel)",
        "Dans ce scénario global, la PAC Air/Eau 15 kW (SCOP 4,5) est dimensionnée "
        "en cohérence avec l'enveloppe rénovée. Toute réalisation partielle "
        "(chauffage sans isolation complète) invaliderait ce dimensionnement. "
        "Le plancher chauffant basse température est adapté à la PAC.", "warn"))
    st.append(callout(
        "<b>Recommandation de l'auditeur :</b> une rénovation globale en une seule "
        "étape est jugée préférable (coût maîtrisé, performance optimale, "
        "cohérence des lots, éligibilité aux aides). À mettre en regard de la "
        "capacité de financement, traitée en section 17.", "green"))
    st.append(source_note(
        "FIL ROUGE (scénario 1 « en une fois », p.9 à p.11 ; résultats p.10). "
        "Option PV 18 000 € TTC : budget de travail transmis par le porteur du projet."))
    return st


def section_solaire() -> List[Any]:
    st = [h1("15. Option solaire — 6 kWc / batterie 7 kWh")]
    st.append(callout(
        "<b>Photovoltaïque + stockage :</b> 6 kWc · batterie 7 kWh · "
        "budget de travail <b>18 000 € TTC</b>.",
        "green"))
    st.append(sp(0.1))
    st.append(vigilance_box(
        "Mentions obligatoires — option photovoltaïque",
        "<b>Budget de travail transmis par le porteur du projet — simulation "
        "non contractuelle.</b><br/>"
        "<b>Étude de structure, orientation, ombrages, raccordement et devis "
        "d'installateur qualifié requis.</b><br/>"
        "<b>Aucun rendement, prime, économie ou rentabilité n'est garanti.</b>",
        "crit"))
    st.append(h2("Périmètre de l'option (budget de travail 18 000 € TTC)"))
    st.append(bullet_list([
        "Installation photovoltaïque de <b>6 kWc</b> ;",
        "Batterie de stockage de <b>7 kWh</b> ;",
        "Onduleur ou micro-onduleurs ;",
        "Protections électriques, pose, raccordement et mise en service ;",
        "Pilotage de l'autoconsommation.",
    ], S["sm"]))
    st.append(h2("Tableau du lot"))
    st.append(data_table([
        ["Lot", "Dimensionnement", "Budget de travail", "Statut"],
        ["LOT PHOTOVOLTAÏQUE + BATTERIE",
         "6 kWc + batterie 7 kWh",
         "18 000 € TTC",
         "Hypothèse à valider par devis installateur"],
    ], col_widths=[4.5 * cm, 4 * cm, 3.5 * cm, 5 * cm], font_size=8.6))
    st.append(sp(0.2))
    st.append(h2("Ordre technique &amp; points de vigilance"))
    st.append(bullet_list([
        "Le photovoltaïque intervient <b>en dernier</b>, après réduction des "
        "besoins (isolation) et électrification du chauffage (PAC).",
        "Compatibilité avec la réfection de toiture (document historique 2023 "
        "à réactualiser).",
        "Distinction claire : photovoltaïque ≠ solaire thermique (ECS).",
    ], S["sm"]))
    st.append(h2("Impact sur le budget global de travail (scénario 3)"))
    st.append(data_table([
        ["Poste", "Montant (travail)"],
        ["Scénario global FIL ROUGE (hors PV)", FIL["sc1_total"]],
        ["Option photovoltaïque et stockage", FIL["pv_option_ttc"]],
        ["Total de travail global + option PV", FIL["sc1_total_avec_pv"]],
    ], col_widths=[11 * cm, 6 * cm], total_rows=[3], font_size=9))
    st.append(sp(0.15))
    st.append(callout(
        "Ce total (~ 255 090 € TTC) est une <b>simulation budgétaire de travail</b> "
        "obtenue en additionnant l'estimation d'audit FIL ROUGE et le budget PV "
        "transmis par le porteur du projet. <b>Il ne constitue pas un devis.</b>",
        "warn"))
    st.append(vigilance_box(
        "Point de vigilance — Toiture avant panneaux",
        "La pose de panneaux suppose une <b>toiture saine</b>. Compte tenu de "
        "l'état de la couverture (réfection prévue), l'installation PV doit être "
        "coordonnée avec les travaux de toiture pour éviter de déposer/reposer les "
        "panneaux ultérieurement.", "warn"))
    st.append(source_note(
        "Budget PV 18 000 € TTC : transmis par le porteur du projet. "
        "Total global+PV = 237 090 + 18 000. À confirmer par devis installateur."))
    return st


def section_comparatif() -> List[Any]:
    st = [h1("16. Tableau comparatif des 3 scénarios")]
    st.append(p(
        "Le tableau ci-dessous synthétise les trois trajectoires. Les montants "
        "sont des <b>ordres de grandeur issus des audits</b> (et budget PV de "
        "travail), à confirmer par les devis 2026. Les gains proviennent des "
        "résultats FIL ROUGE."))
    st.append(data_table([
        ["Critère", "Scénario 1<br/>Toiture &amp; confort", "Scénario 2<br/>Enveloppe", "Scénario 3<br/>Global bas carbone"],
        ["Objectif principal", "Sécuriser clos-couvert, confort",
         "Enveloppe performante avant chauffage", "Performance globale, bas carbone"],
        ["Postes clés", "Toiture, menuiseries, ventilation",
         "Murs + toiture + planchers + menuiseries + VMC",
         "Enveloppe + PAC + plancher + ECS<br/>+ option PV 6 kWc / 7 kWh"],
        ["Ordre de grandeur (à confirmer)", "RAC travail : <b>50 788 €</b><br/>(Fabien 6–75 k€)",
         "~ 97,3 k€ puis ~ 107,2 k€ (étapes FIL ROUGE)",
         "~ 237,1 k€ (FIL ROUGE)<br/>+ 18 k€ PV = <b>~ 255,1 k€</b><br/>(total de travail, non devis)"],
        ["Option PV + batterie", "Hors périmètre principal", "Option possible après enveloppe",
         "18 000 € TTC (budget de travail)"],
        ["Gain conso. (FIL ROUGE)", "Économies estimées ~ 250 €/mois",
         "Étape 1 -18 % / Étape 2 -71 %", "-84 % (-573 kWhEP/m².an)"],
        ["Changement de chauffage", "Non (ou différé)", "Après isolation (étape ultérieure)", "Oui (PAC Air/Eau 15 kW)"],
        ["Dépense énergie après", "À confirmer (+ ~250 €/mois d'économies)", "Étape 2 : 2 530–3 480 €/an", "1 090–1 520 €/an"],
        ["Étude financement Fabien", "Étude possible (~ 50 788 €)", "Étudier selon devis 2026", "Étudier selon devis 2026"],
        ["Adapté si", "Budget limité, urgence toiture",
         "Montée en performance progressive", "Capacité de financement globale"],
    ], col_widths=[3.6 * cm, 4 * cm, 4.7 * cm, 4.7 * cm], font_size=8))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Lecture prudente du comparatif",
        "Les colonnes ne sont pas strictement additives ni directement "
        "comparables (périmètres et sources différents). Le total "
        "~ 255 090 € TTC (global + PV) est une <b>simulation de travail</b>, "
        "pas un devis. Le chiffrage engageant viendra des devis RGE 2026.", "warn"))
    st.append(callout(
        "<b>Trajectoire recommandée :</b> l'auditeur privilégie la rénovation "
        "globale (scénario 3). À défaut, une séquence 1 -> 2 -> 3 permet d'étaler "
        "l'effort tout en respectant l'ordre technique (enveloppe avant chauffage).",
        "green"))
    st.append(source_note(
        "FIL ROUGE (scénarios 1 et 2, résultats) ; BAO (étapes) ; "
        "PV 18 000 € TTC = budget de travail transmis par le porteur du projet. "
        "Estimations non contractuelles."))
    return st


def section_aides() -> List[Any]:
    st = [h1("17. Aides &amp; financement — plan de financement")]
    st.append(vigilance_box(
        "Aides publiques = estimations conditionnelles",
        "Le <b>RFR n'ayant pas été communiqué</b>, aucune catégorie MaPrimeRénov' "
        "n'est déterminée ici. Les aides éventuelles restent des "
        "<b>estimations conditionnelles</b>, soumises à l'éligibilité, à "
        "l'instruction ANAH/CEE et aux devis RGE. Le volet "
        "<b>financement Fabien</b> ci-dessous porte sur le "
        "<b>reste à charge à financer</b> du scénario Toiture &amp; Combles.", "warn"))

    st.append(h2("Pourquoi aucune catégorie MaPrimeRénov' n'est retenue"))
    st.append(p(
        "Le montant de MaPrimeRénov' dépend de la <b>catégorie de revenus</b> "
        "(Bleu / Jaune / Violet / Rose), déterminée par le revenu fiscal de "
        "référence (RFR) et la composition du foyer. Le <b>RFR n'ayant pas été "
        "communiqué</b>, aucune catégorie n'est déduite et aucun taux n'est "
        "appliqué. Le foyer compte 5 personnes, ce qui influe sur les plafonds, "
        "mais ne suffit pas à déterminer la catégorie."))
    st.append(callout(
        "<b>Pour objectiver les aides :</b> fournir le dernier avis d'imposition "
        "(RFR) et le nombre de parts. Un accompagnateur agréé (Mon Accompagnateur "
        "Rénov') pourra alors estimer précisément les aides mobilisables.", "info"))

    st.append(h2("Dispositifs potentiellement mobilisables (à instruire)"))
    st.append(data_table([
        ["Dispositif", "Nature", "Statut dans ce rapport"],
        ["MaPrimeRénov' Parcours Accompagné", "Aide (sous conditions de ressources)",
         "Catégorie non déterminée (RFR manquant)"],
        ["Certificats d'économie d'énergie (CEE)", "Prime des fournisseurs d'énergie",
         "Fourchette non estimée (à instruire)"],
        ["Éco-PTZ", "Prêt à taux zéro (financement, pas une aide)",
         "BAO : projet éligible, montant maxi 50 000 €"],
        ["Aides locales (habitat durable)", "Aide locale",
         "FIL ROUGE mentionne « 500 € » pour certains lots"],
        ["TVA réduite 5,5 %", "Taux réduit sur travaux éligibles",
         "À confirmer selon nature des travaux"],
        ["Financement travaux Fabien", "Courtage financement de travaux",
         "6 000 € à 75 000 € — voir encadré ci-après"],
    ], col_widths=[5 * cm, 5.5 * cm, 6.5 * cm]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Éco-PTZ — ce que dit la BAO",
        "L'étude BAO indique que le projet peut bénéficier d'un <b>éco-PTZ d'une "
        "valeur maximale de 50 000 €</b> (zone H1c, gain énergétique conforme). "
        "L'éco-PTZ est un <b>prêt</b> (à rembourser), <b>pas une aide</b>. Il peut "
        "être combiné, selon dossier, avec le financement travaux négocié par Fabien.",
        "warn"))
    st.append(PageBreak())

    # ── Solutions de financement — partenaire Fabien (sobre / prudent)
    st.append(h2("Solutions de financement — étude avec notre partenaire Fabien"))
    header_fab = Paragraph(
        "<b>SOLUTIONS DE FINANCEMENT — ÉTUDE AVEC NOTRE PARTENAIRE FABIEN</b>",
        ParagraphStyle(
            "fabh", parent=S["body"], fontName=FONT_TITLE, fontSize=11,
            textColor=C["white"], alignment=TA_CENTER, leading=15,
        ),
    )
    fab_head = Table([[header_fab]], colWidths=[CONTENT_WIDTH])
    fab_head.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["night"]),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    st.append(fab_head)
    st.append(sp(0.2))
    st.append(p(
        f"{MARQUE} peut orienter la cliente vers son partenaire <b>Fabien</b>, "
        "courtier en financement de travaux, afin d'étudier des solutions "
        "adaptées au projet et à la situation du foyer."))
    st.append(sp(0.1))
    st.append(data_table([
        ["Point d'étude", "Précision"],
        ["Enveloppe de projet étudiable",
         "Étude possible pour des projets de financement travaux compris "
         "entre <b>6 000 €</b> et <b>75 000 €</b>."],
        ["Regroupement de crédits",
         "Étude possible d'un regroupement de crédits lorsque cela est pertinent."],
        ["Délai de traitement",
         "Objectif de traitement rapide après réception des pièces complètes, "
         "signature des documents et accord du financeur."],
        ["Budget de travail Scénario 1 (indicatif)",
         "Environ <b>50 788 €</b> — chiffrage de travail, à confirmer par devis 2026."],
    ], col_widths=[5.5 * cm, 11.5 * cm], font_size=8.8))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Mention légale obligatoire — aucune garantie de financement",
        "Toute solution de financement est soumise à l'étude du dossier, aux "
        "conditions contractuelles, à la capacité de remboursement de la cliente "
        "et à l'acceptation du ou des organismes prêteurs. <b>Aucun accord, taux, "
        "délai de déblocage, montant ou mensualité n'est garanti.</b>",
        "crit"))
    st.append(sp(0.15))
    st.append(callout(
        "<b>Contact orientation financement :</b> Fabien — partenaire courtier "
        "en financement de travaux. Les coordonnées et le montage précis sont "
        "communiqués lors de l'orientation, après constitution du dossier.",
        "info"))
    st.append(sp(0.15))
    st.append(h3("Lecture indicative — Scénario Toiture &amp; Combles"))
    st.append(p(
        "Pour le Scénario 1, le budget de travail d'environ 50 788 € entre dans "
        "la fourchette d'étude (6 000 € à 75 000 €). Les économies d'énergie "
        "estimées (~ 250 €/mois) restent <b>indicatives</b> et ne constituent "
        "ni une mensualité, ni une opération autofinancée, ni une baisse de "
        "mensualité assurée."))
    st.append(vigilance_box(
        "Précisions de lecture",
        "Les aides publiques éventuelles (MaPrimeRénov', CEE…) restent "
        "conditionnelles tant que le RFR n'est pas instruit. "
        f"{MARQUE} n'est pas un organisme de financement.",
        "warn"))
    st.append(source_note(
        "Orientation partenaire Fabien (courtier financement travaux). "
        "Budget de travail ~ 50 788 € : chiffrage indicatif Scénario Toiture "
        "&amp; Combles. Aucun accord ni délai garanti. BAO (éco-PTZ). "
        "Aides MPR/CEE conditionnelles (RFR)."))
    return st


def section_planning() -> List[Any]:
    st = [h1("18. Planning indicatif")]
    st.append(p(
        "Le planning ci-dessous est <b>indicatif</b> et devra être ajusté selon "
        "les disponibilités des entreprises, la météo (ITE sensible en hiver) et "
        "l'instruction administrative. Il respecte l'ordre technique : "
        "diagnostic -> enveloppe -> ventilation -> chauffage -> solaire."))
    st.append(data_table([
        ["Phase", "Contenu", "Repère de durée (indicatif)"],
        ["0 — Préparation", "Diagnostic humidité, mesures, consultation RGE (2–3 devis/poste), "
         "constitution du dossier d'aides", "1 à 3 mois"],
        ["1 — Toiture", "Réfection charpente + couverture + isolation rampants", "À confirmer par devis"],
        ["2 — Murs &amp; planchers", "ITE chaux-chanvre murs pisé, enduits chaux, plancher bas", "À confirmer par devis"],
        ["3 — Menuiseries", "Fenêtres + volets + 2 portes", "À confirmer par devis"],
        ["4 — Ventilation", "VMC Double Flux Hygro B", "À confirmer par devis"],
        ["5 — Chauffage", "PAC Air/Eau + plancher chauffant (après isolation)", "À confirmer par devis"],
        ["6 — Eau chaude", "2 ballons thermodynamiques", "À confirmer par devis"],
        ["7 — Solaire (option)", "PV 6 kWc + batterie 7 kWh — 18 000 € TTC (budget de travail)", "Devis installateur requis"],
        ["8 — Réception", "Réception des travaux, mise en service, suivi", "Fin de chantier"],
    ], col_widths=[3.6 * cm, 9.4 * cm, 4 * cm]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Point de vigilance — Saison des travaux d'ITE",
        "Les enduits et l'ITE chaux-chanvre sont sensibles au gel et à la pluie. "
        "Il est préférable de programmer ces lots en <b>période clémente</b> "
        "(printemps à automne) pour garantir la qualité de mise en œuvre.", "warn"))
    st.append(vigilance_box(
        "Ne pas engager les travaux avant l'accord des aides",
        "Si des aides (MaPrimeRénov', etc.) sont visées, <b>les travaux ne doivent "
        "pas démarrer avant l'accord officiel</b> du dossier. Un démarrage anticipé "
        "peut entraîner la perte des aides. À valider avec l'accompagnateur.", "crit"))
    st.append(source_note(
        "Ordre technique des travaux ; contraintes de mise en œuvre du pisé/ITE. "
        "Durées à confirmer par les entreprises."))
    return st


def section_suivi() -> List[Any]:
    st = [h1("19. Plan de suivi post-travaux")]
    st.append(p(
        "Après travaux, un suivi permet de vérifier l'atteinte des performances, "
        "d'assurer la bonne santé du bâti pisé et d'optimiser l'usage des nouveaux "
        "équipements (PAC, VMC, ballons thermodynamiques, éventuel PV)."))
    st.append(h2("Actions de suivi recommandées"))
    st.append(data_table([
        ["Échéance", "Action de suivi", "Objectif"],
        ["Réception", "Levée des réserves, remise des DOE, attestations RGE, garanties", "Sécuriser le dossier"],
        ["Mise en service", "Réglage PAC, équilibrage VMC, paramétrage régulation", "Performance réelle"],
        ["1er hiver", "Relevé des consommations, ressenti de confort par pièce", "Comparer aux prévisions"],
        ["6–12 mois", "Contrôle humidité pieds de murs pisé, état des enduits chaux", "Santé du bâti"],
        ["Annuel", "Entretien PAC, remplacement filtres VMC, contrôle ballons", "Durabilité"],
        ["Si PV installé", "Suivi de production et d'autoconsommation", "Optimiser l'usage"],
    ], col_widths=[3.2 * cm, 9.3 * cm, 4.5 * cm]))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Point de vigilance — Humidité après ITE",
        "Durant la première année suivant une ITE sur pisé, surveiller "
        "l'apparition d'éventuelles traces d'humidité ou de sels en pied de mur. "
        "Un séchage progressif est normal ; toute anomalie persistante doit être "
        "signalée à l'entreprise.", "warn"))
    st.append(callout(
        "<b>Documents à conserver :</b> devis signés, factures, attestations RGE, "
        "fiches techniques des matériaux (R, marques), DOE, garanties décennales "
        "et fabricants, PV de réception. Ils seront utiles pour les demandes de "
        "paiement d'aides et en cas de litige.", "green"))
    st.append(source_note(
        "Bonnes pratiques de suivi et d'entretien ; spécificités du bâti pisé."))
    return st


def section_glossaire() -> List[Any]:
    st = [h1("20. Glossaire, méthodologie &amp; inventaire documentaire")]
    st.append(h2("20.1 — Glossaire"))
    st.append(data_table([
        ["Terme", "Définition"],
        ["Ubat", "Coefficient de déperdition moyen de l'enveloppe (W/m².K). Plus il est bas, mieux le bâtiment est isolé."],
        ["kWhEP / kWhEF", "Énergie primaire / énergie finale. L'EP intègre le rendement de production et de transport."],
        ["R (résistance thermique)", "Capacité d'un isolant à freiner la chaleur (m².K/W). Plus R est élevé, plus l'isolation est performante."],
        ["Uw / Ud", "Coefficient de transmission thermique d'une fenêtre (Uw) ou d'une porte (Ud). Plus bas = plus isolant."],
        ["ITE / ITI", "Isolation Thermique par l'Extérieur / par l'Intérieur."],
        ["Pisé", "Technique de construction en terre crue compactée ; matériau perspirant sensible à l'eau."],
        ["Perspirance", "Capacité d'une paroi à laisser migrer la vapeur d'eau ; essentielle pour le bâti ancien."],
        ["PAC Air/Eau", "Pompe à chaleur produisant de l'eau chaude pour le chauffage (et l'ECS). SCOP = rendement saisonnier."],
        ["VMC Double Flux", "Ventilation récupérant la chaleur de l'air extrait pour préchauffer l'air entrant."],
        ["MaPrimeRénov'", "Aide publique à la rénovation, sous conditions de ressources (catégories de couleur)."],
        ["CEE", "Certificats d'économie d'énergie : primes versées par les fournisseurs d'énergie."],
        ["Éco-PTZ", "Prêt à taux zéro pour financer des travaux de rénovation (financement, pas une aide)."],
        ["RGE", "Reconnu Garant de l'Environnement : qualification exigée des entreprises pour l'accès aux aides."],
        ["kWc", "Kilowatt-crête : puissance maximale d'une installation photovoltaïque."],
    ], col_widths=[4 * cm, 13 * cm], font_size=8.4))
    st.append(PageBreak())
    st.append(h2("20.2 — Méthodologie du rapport"))
    st.append(p(
        "Ce rapport a été constitué par recoupement de trois documents sources "
        "(audit FIL ROUGE, étude BAO, devis toiture 2023). La démarche a consisté à :"))
    st.append(bullet_list([
        "extraire les données chiffrées de chaque source en conservant leur origine ;",
        "signaler systématiquement les écarts entre sources plutôt que les masquer ;",
        "distinguer photographies réelles et simulations visuelles ;",
        "ne produire aucune estimation d'aide en l'absence du RFR ;",
        "marquer « À confirmer » toute donnée absente ou incertaine ;",
        "présenter des scénarios sans figer de budget engageant.",
    ], S["sm"]))
    st.append(vigilance_box(
        "Limites méthodologiques",
        "Les estimations d'audit ne sont pas des devis. Les répartitions de "
        "déperditions données à titre pédagogique ne résultent pas d'un calcul "
        "spécifique au bien. Les simulations thermographiques sont illustratives. "
        "Seuls les devis RGE 2026 et une étude thermique à jour feront foi.", "warn"))
    st.append(h2("20.3 — Inventaire documentaire (documents à réunir)"))
    st.append(data_table([
        ["Document", "Utilité", "Statut"],
        ["Avis d'imposition (RFR)", "Déterminer la catégorie d'aides", "À fournir"],
        ["Justificatif de propriété / taxe foncière", "Éligibilité aides", "À fournir"],
        ["Devis RGE 2026 par poste (2–3/poste)", "Chiffrage engageant", "À obtenir"],
        ["Devis toiture réactualisé 2026", "Remplacer le devis 2023 expiré", "À obtenir"],
        ["Diagnostic humidité pisé", "Sécuriser l'ITE", "Recommandé"],
        ["Étude solaire (si option PV)", "Dimensionnement 6 kWc / 7 kWh", "Si option retenue"],
        ["Attestations RGE + décennale", "Conformité et garanties", "À collecter"],
        ["Plans / croquis du logement", "Métrés précis", "À compléter"],
    ], col_widths=[6 * cm, 7 * cm, 4 * cm]))
    st.append(source_note(
        "Synthèse méthodologique ENERGIA CONSEIL IA® ; exigences des dispositifs "
        "d'aides et bonnes pratiques de dossier."))
    return st


def section_referentiels_publics() -> List[Any]:
    """Référentiels publics — formulations autorisées uniquement (pas de partenariat)."""
    date_consult = datetime.now().strftime("%d/%m/%Y")
    st: List[Any] = []
    st.append(h1("21. Référentiels publics et sources d'information"))
    st.append(p(
        "Les scénarios présentés s'appuient sur les documents fournis par le client, "
        "les audits et devis disponibles, ainsi que sur les informations publiques "
        "applicables au moment de l'étude, notamment celles de France Rénov', de "
        "l'Anah, de l'ADEME et des dispositifs réglementaires concernés."))
    st.append(sp(0.15))
    st.append(callout(
        "Les aides, critères d'éligibilité et montants éventuels sont donnés "
        "<b>à titre indicatif</b> et doivent être confirmés avant tout engagement "
        "auprès des plateformes et organismes compétents.",
        "warn"))
    st.append(sp(0.1))
    st.append(callout(
        "Pour une rénovation d'ampleur, le client est invité à prendre contact "
        "avec un <b>conseiller France Rénov'</b> et à vérifier les démarches "
        "obligatoires avant le dépôt de son dossier.",
        "info"))
    st.append(sp(0.2))
    st.append(h2("Cadre de lecture des sources publiques"))
    st.append(bullet_list([
        f"<b>{MARQUE}</b> n'est ni un organisme public, ni un opérateur "
        "France Rénov', ni un Mon Accompagnateur Rénov', ni une entreprise RGE. "
        f"{MARQUE_LICENCE}",
        "Les contenus de ce rapport ne constituent ni un audit réglementaire, "
        "ni un DPE, ni une thermographie réelle, ni une étude thermique opposable.",
        "Aucune affiliation du type « partenaire officiel France Rénov' », "
        "« partenaire ADEME », « agréé Anah » ou « certifié ADEME » n'est "
        "revendiquée dans ce document.",
        "Aucun logo France Rénov', Anah, ADEME ou République française n'est "
        "reproduit dans ce rapport.",
    ], S["sm"]))
    st.append(sp(0.2))
    st.append(h2("Sources publiques mobilisées (indicatif)"))
    st.append(data_table([
        ["Source / référentiel", "Usage dans ce rapport", "Date de consultation"],
        ["France Rénov' (service public)",
         "Repères généraux sur le parcours de rénovation et l'orientation "
         "vers un conseiller",
         date_consult],
        ["Anah — dispositifs MaPrimeRénov'",
         "Cadre général des aides (catégories, plafonds) — montants non "
         "chiffrés ici faute de RFR",
         date_consult],
        ["ADEME — informations publiques",
         "Repères pédagogiques sur la rénovation énergétique et le bâti",
         date_consult],
        ["Documents client (FIL ROUGE, BAO, devis 2023)",
         "Données techniques et chiffrages d'audit / historiques du dossier",
         "Voir dates des documents sources"],
    ], col_widths=[5 * cm, 8 * cm, 4 * cm], font_size=8.4))
    st.append(sp(0.15))
    st.append(vigilance_box(
        "Confirmation obligatoire avant dépôt",
        "Lorsque les données publiques n'ont pas été récupérées ou vérifiées "
        "pour le dossier, ou lorsqu'elles évoluent : "
        "<b>À confirmer auprès des sources officielles avant dépôt du dossier.</b> "
        "Chaque montant d'aide, critère d'éligibilité ou démarche administrative "
        "doit être revalidé sur les plateformes compétentes à la date du dépôt.",
        "crit"))
    st.append(sp(0.25))
    # Pied de section imposé
    pied = Paragraph(
        "<i>France Rénov' est le service public de la rénovation de l'habitat, "
        "géré par l'Anah. Les Espaces conseil apportent une information gratuite, "
        "neutre et indépendante.</i>",
        ParagraphStyle(
            "fr_pied", parent=S["sm"], fontSize=8, leading=11,
            textColor=C["night"], alignment=TA_CENTER,
        ),
    )
    pied_t = Table([[pied]], colWidths=[CONTENT_WIDTH])
    pied_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["gray"]),
        ("BOX", (0, 0), (-1, -1), 0.6, C["teal"]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ]))
    st.append(pied_t)
    st.append(sp(0.15))
    st.append(source_note(
        f"Formulations autorisées — référentiels publics. "
        f"Consultation indicative des sources publiques : {date_consult}. "
        "Aucune donnée n'est présentée comme garantie par France Rénov' ou l'ADEME."))
    return st


def section_annexes() -> List[Any]:
    st = [h1("22. Annexes")]
    st.append(p(
        "Les annexes regroupent les visuels (photographies et simulations), les "
        "extraits de synthèse des études, l'extrait du devis toiture historique, "
        "ainsi que des check-lists opérationnelles pour la consultation des "
        "entreprises et la constitution du dossier."))
    st.append(data_table([
        ["Annexe", "Contenu"],
        ["A", "Photographies réelles du bien (rappel)"],
        ["B", "Simulations thermographiques (rappel + avertissements)"],
        ["C", "Projections avant/après (illustratives)"],
        ["D", "Extraits de synthèse — FIL ROUGE"],
        ["E", "Extraits de synthèse — BAO"],
        ["F", "Extrait du devis toiture historique 2023"],
        ["G", "Check-list de consultation des entreprises RGE"],
        ["H", "Check-list des documents à réunir"],
        ["I", "Rappel des points de vigilance"],
    ], col_widths=[2.5 * cm, 14.5 * cm]))
    st.append(PageBreak())

    # Annexe A — photos réelles (une par page)
    st.append(h2("Annexe A — Photographies réelles du bien"))
    st.append(p("Rappel des vues transmises. Photographies réelles (non retouchées)."))
    st.append(PageBreak())
    for fname, label in PHOTOS_REELLES:
        st.append(h3(f"Annexe A — {label}"))
        st.extend(safe_image(fname, f"Photo réelle — {label}"))
        st.append(sp(0.2))
        st.append(p(f"Vue « {label.lower()} ». À utiliser pour le repérage lors des visites."))
        st.append(PageBreak())

    # Annexe B — simulations thermographiques (une par page)
    st.append(h2("Annexe B — Simulations thermographiques"))
    st.append(callout("<b>" + THERMO_TITLE + "</b>", "crit"))
    st.append(callout(THERMO_WARNING, "warn"))
    st.append(PageBreak())
    for fname, label in THERMO_SIMULATIONS:
        st.append(h3(f"Annexe B — {label}"))
        st.append(callout("<b>" + THERMO_TITLE + "</b>", "crit"))
        st.extend(safe_image(fname, THERMO_TITLE))
        st.append(callout(THERMO_WARNING, "warn"))
        st.append(PageBreak())

    # Annexe C — avant/après (une par page)
    st.append(h2("Annexe C — Projections avant / après (illustratives)"))
    st.append(callout(
        "Les visuels suivants sont des <b>projections illustratives</b> du type de "
        "résultat visé. Ils ne représentent pas le bien réel après travaux et ne "
        "constituent pas un engagement esthétique ou technique.", "warn"))
    st.append(PageBreak())
    for fname, label in BEFORE_AFTER_SIMULATIONS:
        st.append(h3(f"Annexe C — {label}"))
        st.extend(safe_image(fname, f"Projection illustrative — {label}"))
        st.append(callout(
            "Projection illustrative — ne représente pas le bien réel après travaux.",
            "warn"))
        st.append(PageBreak())

    # Annexe D — extraits FIL ROUGE
    st.append(h2("Annexe D — Extraits de synthèse : FIL ROUGE"))
    st.append(data_table([
        ["Élément", "Valeur"],
        ["Outil / version", "BATIAUDIT V1.2.16.2"],
        ["Date de visite", "06/06/2025"],
        ["Ubat avant / base / après (sc.1)", "1,667 / 0,356 / 0,337 W/(m².K)"],
        ["Conso avant (EP / EF)", "680 / 499 kWh/m².an"],
        ["Coût énergie annuel", "8 100 € à 10 990 €"],
        ["Scénario 1 « en une fois »", "~ 237 090 € TTC — gain -84 %"],
        ["Option PV + batterie (budget de travail)", "18 000 € TTC"],
        ["Total de travail global + PV (non devis)", "~ 255 090 € TTC"],
        ["Scénario 2 (étapes)", "~ 97 290 € / 107 200 € / 24 100 € / 8 500 € TTC"],
        ["Recommandation auditeur", "Rénovation globale en une seule étape"],
    ], col_widths=[7 * cm, 10 * cm]))
    st.append(sp(0.2))
    st.append(source_note("Audit FIL ROUGE — pages de synthèse et scénarios."))
    st.append(PageBreak())

    # Annexe E — extraits BAO
    st.append(h2("Annexe E — Extraits de synthèse : BAO"))
    st.append(data_table([
        ["Élément", "Valeur"],
        ["Date de l'étude", "15/11/2024"],
        ["Conso initiale (EP)", "432 kWhEP/m²"],
        ["Énergie finale totale", "54 161 kWh/an"],
        ["Dépense annuelle", "~ 8 727 € / an"],
        ["Cep initial (contexte éco-PTZ)", "508 kWh/m²"],
        ["Zone / altitude", "H1c / 193 m"],
        ["Étape 1 (isolation + ventilation)", "69 017 € — conso ~3 407 €/an"],
        ["Étape 2 (cumul + PAC Air/Eau)", "75 825 € — conso ~902 €/an"],
        ["Éco-PTZ", "Projet éligible — maxi 50 000 €"],
    ], col_widths=[7 * cm, 10 * cm]))
    st.append(sp(0.2))
    st.append(callout(
        "Rappel : certains montants BAO sont « aide déduite » et restent "
        "conditionnels. L'écart de consommation avec le FIL ROUGE (432 vs 680) "
        "est à arbitrer.", "note"))
    st.append(source_note("Étude BAO « Ma maison » — vues économique et énergétique."))
    st.append(PageBreak())

    # Annexe E (suite 1) — BAO vue économique complète
    st.append(h2("Annexe E (suite) — BAO : vue économique complète"))
    st.append(p(
        "Détail des préconisations chiffrées par la BAO (coûts, consommation "
        "résultante, économie annuelle, temps de retour brut). Montants "
        "conditionnels ; certains sont présentés « aide déduite »."))
    st.append(data_table(
        [["N°", "Préconisation", "Coût TTC", "Conso/an", "Économie/an", "Retour brut"]]
        + [list(x) for x in BAO_PRECOS],
        col_widths=[1.4 * cm, 6.6 * cm, 2.7 * cm, 2.3 * cm, 2.3 * cm, 1.7 * cm],
        total_rows=[6, 8], font_size=7.8))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Lecture des temps de retour",
        "Un temps de retour long (ex. ITE : 16 ans) ne signifie pas que le poste "
        "est inutile : l'ITE apporte confort, valorisation et protection du bâti "
        "pisé, au-delà de la seule économie d'énergie. À apprécier globalement.", "info"))
    st.append(source_note("BAO — vue économique (p.15)."))
    st.append(PageBreak())

    # Annexe E (suite 2) — BAO vue énergétique & labels
    st.append(h2("Annexe E (suite) — BAO : vue énergétique & labels"))
    st.append(data_table([
        ["Indicateur", "État actuel", "Étape 1", "Étape 2"],
        ["Total EP (kWh/m².an)", "463,9", "171,6", "67,1"],
        ["Économie EP (%/an)", "—", "63 %", "85,5 %"],
        ["Cep (contexte éco-PTZ)", "508 kWh/m²", "161 kWh/m²", "45 kWh/m²"],
        ["Gain éco-PTZ", "—", "68 %", "91 %"],
        ["CO2 (kgéqCO2/m²)", "17", "5", "1"],
    ], col_widths=[6 * cm, 3.7 * cm, 3.7 * cm, 3.6 * cm]))
    st.append(sp(0.2))
    st.append(callout(
        "La BAO mentionne un <b>label rénovation énergétique</b> (référentiel "
        "Promotelec 2017) et une éligibilité à l'<b>éco-PTZ</b> jusqu'à 50 000 €. "
        "Ces éléments restent conditionnels à l'instruction du dossier.", "note"))
    st.append(source_note("BAO — vue énergétique (p.15), éco-PTZ (p.21/p.29), labels (p.22/p.30)."))
    st.append(PageBreak())

    # Annexe D (suite) — FIL ROUGE scénario 2 par étapes (résultats)
    st.append(h2("Annexe D (suite) — FIL ROUGE : scénario 2 par étapes"))
    st.append(p(
        "Résultats après chaque étape du scénario « par étapes » de l'audit "
        "FIL ROUGE. Les gains sont cumulés par rapport à l'état initial."))
    st.append(data_table([
        ["Étape", "Ubat après", "Gain conso.", "Coût étape TTC", "Dépense après"],
        ["Étape 1", "1,305 W/(m².K)", "-18 % (-119)", "~ 97 290 €", "6 710–9 110 €/an"],
        ["Étape 2", "0,337 W/(m².K)", "-71 % (-481)", "~ 107 200 €", "2 530–3 480 €/an"],
        ["Étape 3", "0,337 W/(m².K)", "-71 % (-481)", "~ 24 100 €", "2 540–3 490 €/an"],
        ["Étape 4", "0,337 W/(m².K)", "-74 % (-500)", "~ 8 500 €", "2 230–3 070 €/an"],
    ], col_widths=[2.3 * cm, 3.5 * cm, 3.5 * cm, 3.6 * cm, 4.1 * cm], font_size=8))
    st.append(sp(0.2))
    st.append(callout(
        "Le contenu détaillé de chaque étape (postes) figure en section 13 "
        "(SCÉNARIO 2). Rappel : ces montants sont des estimations d'audit, non "
        "des devis.", "info"))
    st.append(vigilance_box(
        "Cohérence des étapes",
        "L'étape 1 vise un gain d'au moins 2 classes énergétiques (traitement des "
        "parois), condition des scénarios « par étapes » du cadre réglementaire. "
        "La séquence exacte devra être validée avec l'accompagnateur.", "warn"))
    st.append(source_note("FIL ROUGE — scénario 2, résultats après chaque étape (p.13 à p.19)."))
    st.append(PageBreak())

    # Annexe — Comparatif détaillé des deux études
    st.append(h2("Annexe — Comparatif détaillé des deux études"))
    st.append(p(
        "Les deux études ne partent pas des mêmes hypothèses. Ce tableau facilite "
        "l'arbitrage des écarts avant chiffrage final."))
    st.append(data_table([
        ["Critère", "FIL ROUGE (06/06/2025)", "BAO (15/11/2024)"],
        ["Outil", "BATIAUDIT V1.2.16.2", "Bureau d'études BAO"],
        ["Conso initiale (EP)", "680 kWhEP/m².an", "432–463,9 kWhEP/m²"],
        ["Énergie finale", "499 kWhEF/m².an", "54 161 kWh/an"],
        ["Dépense annuelle", "8 100–10 990 €", "~ 8 727 €"],
        ["Approche murs", "ITE chaux-chanvre 24 cm (R=5,5)", "ITE chanvre + ITI laine de verre"],
        ["Toiture", "Rampants R=6,5 + réfection couverture", "Rampants + combles"],
        ["Chauffage cible", "PAC Air/Eau 15 kW + plancher chauffant", "PAC Air/Eau (étape 2)"],
        ["Éco-PTZ", "Mentionné", "Éligible, maxi 50 000 €"],
    ], col_widths=[3.8 * cm, 6.6 * cm, 6.6 * cm], font_size=8))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Écarts à arbitrer",
        "Consommation initiale (680 vs 432), périmètre des lots d'isolation et "
        "structuration des étapes diffèrent. Ces écarts sont normaux (méthodes/"
        "dates distinctes) mais doivent être <b>arbitrés et documentés</b> avant "
        "le chiffrage final. Ce rapport ne tranche pas.", "warn"))
    st.append(source_note("Recoupement FIL ROUGE / BAO."))
    st.append(PageBreak())

    # Annexe — Repères pédagogiques sur les aides
    st.append(h2("Annexe — Repères pédagogiques sur les aides (sans chiffrage)"))
    st.append(p(
        "Cette page explique, sans produire d'estimation, la logique des "
        "principaux dispositifs. Les montants réels dépendront de l'instruction "
        "du dossier et du RFR (non communiqué)."))
    st.append(data_table([
        ["Dispositif", "Principe (pédagogique)"],
        ["MaPrimeRénov'", "Aide publique modulée par catégorie de revenus (Bleu/Jaune/"
                          "Violet/Rose). Nécessite le RFR et un accompagnateur agréé."],
        ["CEE", "Primes financées par les fournisseurs d'énergie, selon les gestes "
                "réalisés. Montants variables selon les obligés."],
        ["Éco-PTZ", "Prêt à taux zéro (à rembourser) pour financer les travaux. "
                    "Ce n'est PAS une aide. BAO : projet éligible, maxi 50 000 €."],
        ["TVA 5,5 %", "Taux réduit applicable à certains travaux d'amélioration "
                      "énergétique, selon conditions."],
        ["Aides locales", "Aides éventuelles des collectivités (ex. « habitat "
                          "durable »). À vérifier localement."],
    ], col_widths=[3.5 * cm, 13.5 * cm], font_size=8.4))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Aides publiques vs financement Fabien",
        "Aucune somme d'aide publique définitive n'est avancée (RFR manquant). "
        "En revanche, le montage Fabien du Scénario Toiture &amp; Combles "
        "présente un reste à charge de travail de 50 788 € et des économies "
        "estimées à ~ 250 €/mois. Voir section 17.", "warn"))
    st.append(source_note(
        "Repères généraux ; BAO pour l'éco-PTZ ; montage Fabien section 17."))
    st.append(PageBreak())

    # Annexe — Confort, santé & humidité (pisé)
    st.append(h2("Annexe — Confort, santé & humidité dans l'habitat pisé"))
    st.append(p(
        "Au-delà de l'énergie, la rénovation vise le confort et la santé des "
        "occupants (foyer de 5 personnes). Le pisé, bien traité, offre un "
        "excellent confort ; mal traité, il génère des désordres."))
    st.append(bullet_list([
        "<b>Confort d'hiver :</b> l'isolation supprime les parois froides et les "
        "sensations de courant d'air ; le plancher chauffant apporte une chaleur "
        "douce et homogène.",
        "<b>Confort d'été :</b> l'inertie du pisé et l'isolation de toiture "
        "limitent les surchauffes ; la ventilation double flux peut rafraîchir la "
        "nuit.",
        "<b>Qualité de l'air :</b> la VMC évacue l'humidité et les polluants ; "
        "essentielle pour un foyer nombreux.",
        "<b>Santé du bâti :</b> matériaux perspirants et gestion de l'humidité "
        "évitent moisissures et dégradation du pisé.",
    ], S["sm"]))
    st.append(vigilance_box(
        "Point de vigilance — Humidité & santé",
        "L'humidité mal gérée nuit à la fois au bâti (dégradation du pisé) et à la "
        "santé (moisissures, allergies). La combinaison isolation perspirante + "
        "ventilation performante + traitement des remontées est la clé.", "warn"))
    st.append(source_note("Principes de confort et de santé du bâti ancien en pisé."))
    st.append(PageBreak())

    # Annexe — Foire aux questions
    st.append(h2("Annexe — Foire aux questions (FAQ)"))
    faq = [
        ("Ce document est-il un devis ?",
         "Non. C'est un document de travail de synthèse. Seuls les devis "
         "d'entreprises RGE en 2026 auront valeur d'engagement."),
        ("Pourquoi les aides ne sont-elles pas chiffrées ?",
         "Parce que le revenu fiscal de référence (RFR) n'a pas été communiqué : "
         "la catégorie MaPrimeRénov' ne peut donc pas être déterminée."),
        ("Comment financer le Scénario Toiture &amp; Combles ?",
         "Via orientation vers le partenaire Fabien (courtier en financement de "
         "travaux) : étude possible pour un budget de travail d'environ 50 788 € "
         "(enveloppe indicative 6 000 à 75 000 €). Aucun délai, accord, montant "
         "ou mensualité n'est garanti ; les ~ 250 €/mois d'économies restent "
         "indicatifs."),
        ("Le devis toiture de 2023 est-il encore valable ?",
         "Non. C'est un devis historique de 2023 — expiré — à actualiser avant "
         "tout engagement. Sa validité d'origine (15 jours) est dépassée."),
        ("Pourquoi isoler avant de changer le chauffage ?",
         "Pour réduire les besoins et pouvoir installer une PAC plus petite, moins "
         "chère et plus efficace. L'inverse conduit à un surdimensionnement coûteux."),
        ("Les images thermographiques sont-elles réelles ?",
         "Non. Ce sont des simulations visuelles illustratives. Une thermographie "
         "infrarouge réelle peut être réalisée sur site si nécessaire."),
        ("Le photovoltaïque 6 kWc / 7 kWh est-il chiffré ?",
         "Un budget de travail de 18 000 € TTC (6 kWc + batterie 7 kWh) a été "
         "transmis par le porteur du projet. Simulation non contractuelle, à "
         "confirmer par devis d'installateur. Aucune prime ni rentabilité affichée."),
        ("Peut-on démarrer les travaux tout de suite ?",
         "Si des aides sont visées, non : il faut attendre l'accord officiel du "
         "dossier, sous peine de perdre les aides."),
        ("Quelle est la prochaine étape concrète ?",
         "Réunir les documents (dont le RFR), obtenir un diagnostic humidité et "
         "consulter des entreprises RGE pour des devis 2026."),
    ]
    faq_rows = [["Question", "Réponse"]]
    for q, a in faq:
        faq_rows.append([f"<b>{q}</b>", a])
    st.append(data_table(faq_rows, col_widths=[5.5 * cm, 11.5 * cm], font_size=8.4))
    st.append(sp(0.2))
    st.append(source_note("Synthèse des principes du présent rapport."))
    st.append(PageBreak())

    # Annexe F — extrait devis toiture
    st.append(h2("Annexe F — Extrait du devis toiture historique (2023)"))
    st.append(vigilance_box(
        "Document historique — non valable en l'état",
        f"Devis {DEVIS['entreprise']} {DEVIS['numero']} du {DEVIS['date']}. "
        "Validité expirée, prix non actualisés. À remplacer par un devis 2026.", "crit"))
    st.append(data_table([
        ["Élément", "Valeur"],
        ["Objet", DEVIS["objet"]],
        ["Surface", DEVIS["surface"]],
        ["Tuile", DEVIS["tuile"]],
        ["Montant HT", DEVIS["ht"]],
        ["TVA (10 %)", DEVIS["tva"]],
        ["Montant TTC", DEVIS["ttc"]],
    ], col_widths=[7 * cm, 10 * cm], total_rows=[6]))
    st.append(sp(0.2))
    st.append(h3("Image du devis original (si disponible)"))
    st.extend(safe_image(DEVIS_PNG, "Extrait du devis toiture 2023 (document historique)"))
    st.append(source_note(
        f"Devis {DEVIS['entreprise']} {DEVIS['numero']} ({DEVIS['date']}). "
        "Le détail ligne à ligne figure sur le document original."))
    st.append(PageBreak())

    # Annexe G — check-list consultation RGE
    st.append(h2("Annexe G — Check-list de consultation des entreprises RGE"))
    st.append(bullet_list([
        "[ ] Vérifier la certification RGE en cours de validité (par domaine de travaux).",
        "[ ] Demander l'attestation d'assurance décennale à jour.",
        "[ ] Obtenir 2 à 3 devis par poste, à périmètre identique.",
        "[ ] Exiger le détail : quantités, R visés, Uw/Ud, marques, garanties.",
        "[ ] Confirmer la compatibilité pisé (matériaux perspirants, chaux).",
        "[ ] Faire préciser la surface exacte de toiture (arbitrer 275 vs 310 m²).",
        "[ ] Demander le dimensionnement PAC sur bâti isolé (post-travaux).",
        "[ ] Vérifier la prise en compte de la ventilation (VMC) dans le lot.",
        "[ ] Demander le planning prévisionnel et la saison de mise en œuvre.",
        "[ ] Clarifier la coordination toiture / éventuels panneaux PV.",
    ], S["sm"]))
    st.append(PageBreak())

    # Annexe H — check-list documents
    st.append(h2("Annexe H — Check-list des documents à réunir"))
    st.append(bullet_list([
        "[ ] Dernier avis d'imposition (RFR) et nombre de parts.",
        "[ ] Justificatif de propriété / dernière taxe foncière.",
        "[ ] Devis RGE 2026 signés par poste.",
        "[ ] Devis toiture réactualisé 2026.",
        "[ ] Diagnostic humidité du pisé (recommandé).",
        "[ ] Étude solaire si l'option PV est retenue.",
        "[ ] Attestations RGE et assurances décennales des entreprises.",
        "[ ] Plans / croquis et métrés du logement.",
        "[ ] RIB et pièce d'identité pour les demandes d'aides.",
        "[ ] Coordonnées de l'accompagnateur (Mon Accompagnateur Rénov').",
    ], S["sm"]))
    st.append(PageBreak())

    # Annexe H (suite) — Ordre des travaux recommandé
    st.append(h2("Annexe H (suite) — Ordre des travaux recommandé"))
    st.append(p(
        "L'ordre des travaux n'est pas neutre : il conditionne l'efficacité "
        "technique, le bon dimensionnement des équipements et l'accès aux aides. "
        "La logique appliquée dans ce rapport est la suivante."))
    st.append(data_table([
        ["Rang", "Poste", "Pourquoi à ce moment"],
        ["1", "Diagnostic humidité + métrés", "Sécuriser le pisé avant tout"],
        ["2", "Toiture (couverture + rampants)", "Poste n°1 de déperdition, mise hors d'eau"],
        ["3", "Murs pisé (ITE) + planchers", "Grande surface déperditive, confort"],
        ["4", "Menuiseries (fenêtres, portes)", "Étanchéité à l'air, après isolation murs"],
        ["5", "Ventilation (VMC DF)", "Indispensable après étanchéification"],
        ["6", "Chauffage (PAC + plancher)", "Dimensionné sur bâti isolé"],
        ["7", "Eau chaude (ballons thermo.)", "Complète le volet équipements"],
        ["8", "Photovoltaïque (option)", "En dernier, sur toiture saine"],
    ], col_widths=[1.6 * cm, 6.4 * cm, 9 * cm], font_size=8.4))
    st.append(sp(0.2))
    st.append(vigilance_box(
        "Règle d'or",
        "Isolation AVANT chauffage — toujours. Un changement de chauffage sur un "
        "bâti non isolé conduit au surdimensionnement et au gaspillage.", "warn"))
    st.append(source_note("Ordre technique de rénovation ; cohérent avec la recommandation FIL ROUGE."))
    st.append(PageBreak())

    # Annexe H (suite) — Tableau de suivi des devis (à compléter)
    st.append(h2("Annexe H (suite) — Tableau de suivi des devis (à compléter)"))
    st.append(p(
        "Modèle à imprimer et compléter au fil de la consultation des entreprises. "
        "Objectif : comparer à périmètre identique et tracer les échanges."))
    empty = "____________"
    st.append(data_table([
        ["Poste", "Entreprise RGE", "Montant TTC", "RGE ?", "Reçu le"],
        ["Toiture", empty, empty, "O / N", empty],
        ["Murs pisé (ITE)", empty, empty, "O / N", empty],
        ["Planchers", empty, empty, "O / N", empty],
        ["Menuiseries", empty, empty, "O / N", empty],
        ["Ventilation", empty, empty, "O / N", empty],
        ["Chauffage (PAC)", empty, empty, "O / N", empty],
        ["Eau chaude", empty, empty, "O / N", empty],
        ["Solaire (option)", empty, empty, "O / N", empty],
    ], col_widths=[3.6 * cm, 4.9 * cm, 3.2 * cm, 2.3 * cm, 3 * cm], font_size=8.4))
    st.append(sp(0.3))
    st.append(callout(
        "Conseil : obtenir 2 à 3 devis par poste et reporter chacun sur une ligne "
        "distincte pour faciliter la comparaison. Vérifier systématiquement la "
        "validité RGE et l'assurance décennale.", "green"))
    st.append(source_note("Modèle de suivi ENERGIA CONSEIL IA®."))
    st.append(PageBreak())

    # Annexe H (suite) — Notes et observations
    st.append(h2("Annexe H (suite) — Notes et observations (à compléter en visite)"))
    st.append(p(
        "Espace libre pour consigner les observations relevées lors des visites "
        "d'entreprises et des points techniques à trancher."))
    note_lines = [["Sujet", "Observation / décision"]]
    for sujet in ["Humidité / pied de mur", "Surface toiture (275 vs 310 m²)",
                  "État charpente", "Nature enduit existant", "Emplacement PAC",
                  "Emplacement ballons thermo.", "Réseau VMC (passages)",
                  "Option photovoltaïque", "Écart FIL ROUGE / BAO",
                  "Planning souhaité", "Financement (RFR, banque)", "Autre"]:
        note_lines.append([sujet, "____________________________________________"])
    st.append(data_table(note_lines, col_widths=[5 * cm, 12 * cm], font_size=8.6))
    st.append(source_note("Page de travail à compléter."))
    st.append(PageBreak())

    # Annexe I — rappel points de vigilance
    st.append(h2("Annexe I — Rappel des points de vigilance"))
    st.append(vigilance_box(
        "Pisé &amp; humidité",
        "Préserver la perspirance du mur, traiter les sources d'humidité avant "
        "isolation, proscrire le ciment sur pisé, privilégier chaux et bio-sourcés.",
        "warn"))
    st.append(vigilance_box(
        "Ventilation",
        "Une isolation performante impose une ventilation mécanique efficace "
        "(VMC) : sans elle, risque de condensation et de dégradation du bâti.",
        "warn"))
    st.append(vigilance_box(
        "Humidité en pied de mur",
        "Un diagnostic humidité est recommandé avant l'ITE ; surveiller la "
        "première année après travaux.", "warn"))
    st.append(vigilance_box(
        "Dimensionnement PAC",
        "Dimensionner la PAC après isolation de l'enveloppe : sinon "
        "surdimensionnement, surcoût et fonctionnement dégradé.", "warn"))
    st.append(vigilance_box(
        "Aides conditionnelles &amp; financement Fabien",
        "Aucune catégorie MaPrimeRénov' déterminée (RFR manquant). Les aides "
        "publiques restent conditionnelles. Le budget de travail du Scénario "
        "Toiture &amp; Combles (~ 50 788 €) peut faire l'objet d'une étude avec "
        "le partenaire Fabien (enveloppe indicative 6–75 k€). Aucun accord ni "
        "mensualité n'est garanti (voir section 17).", "warn"))
    st.append(vigilance_box(
        "Devis toiture 2023 historique",
        "Devis historique de 2023 — expiré — à actualiser avant tout engagement ; "
        "écart de surface 275/310 m² à arbitrer.", "crit"))
    st.append(sp(0.3))
    st.append(callout(
        "Fin du rapport. Ce document de travail sera complété et actualisé au fur "
        "et à mesure de l'obtention des devis RGE 2026 et des pièces manquantes.",
        "green"))
    st.append(source_note(
        "Synthèse des points de vigilance issus des sections précédentes."))
    st.append(PageBreak())

    # Page de clôture — orientation décision
    st.append(h1("Orientation décision & prochaines étapes"))
    st.append(p(
        "Ce rapport a pour objet d'aider Mme Clyve ANDRIOT à décider d'une "
        "stratégie de rénovation cohérente avec le bâti en pisé, le foyer de "
        "5 personnes et les contraintes de financement à confirmer."))
    st.append(h2("Décisions à arbitrer"))
    st.append(bullet_list([
        "Choisir le scénario prioritaire (1 sécurisation / 2 enveloppe / 3 global).",
        "Confirmer ou non l'option solaire (hypothèse 6 kWc / 7 kWh).",
        "Fournir le RFR pour permettre l'étude conditionnelle des aides.",
        "Lancer le diagnostic humidité / support avant toute ITE sur pisé.",
        "Obtenir des devis RGE 2026 à périmètre comparable (2–3 par poste).",
        "Arbitrer la surface toiture (275 m² audit vs 310 m² devis 2023).",
    ], S["body"]))
    st.append(h2("Cadre de travail"))
    st.append(data_table([
        ["Élément", "Statut"],
        ["Document", "Document de travail — non contractuel"],
        ["Données chiffrées", "Issues de FIL ROUGE, BAO et devis toiture 2023"],
        ["Aides", "Estimations conditionnelles uniquement (RFR manquant)"],
        ["Thermographies", "Simulations illustratives — non mesurées"],
        ["Prochaine échéance", "À confirmer avec la cliente et les entreprises RGE"],
    ], col_widths=[5 * cm, 12 * cm]))
    st.append(sp(0.4))
    st.append(callout(
        "ENERGIA CONSEIL IA accompagne la coordination du projet. Tout "
        "engagement financier repose sur des devis RGE actualisés et, le cas "
        "échéant, sur l'accord écrit des organismes d'aides.",
        "teal"))
    st.append(sp(0.6))
    st.append(p(
        "<b>Fait pour :</b> Mme Clyve ANDRIOT — 654 route départementale 975, "
        "Grand Veilly, 71290 La Genête<br/>"
        "<b>Éditeur :</b> ENERGIA CONSEIL IA — 16 Rue Cuvier, 69006 Lyon<br/>"
        f"<b>Date d'édition :</b> {datetime.now().strftime('%d/%m/%Y')}<br/>"
        "<b>Contact :</b> 06 10 59 68 98 — contact@energia-conseil-ia.com",
        S["sm"]))
    st.append(source_note(
        "Page de clôture du rapport — synthèse décisionnelle sans nouveau chiffre."))
    return st


# ─────────────────────────────────────────────────────────────────────────────
# ASSEMBLAGE
# ─────────────────────────────────────────────────────────────────────────────


def _sim_banner() -> Table:
    """Bandeau obligatoire simulation budgétaire (haut / bas de fiche)."""
    txt = Paragraph(
        "<para align=\"center\"><b>SIMULATION BUDGÉTAIRE INTERNE — "
        "NON CONTRACTUELLE — NE VAUT PAS DEVIS</b></para>",
        ParagraphStyle(
            "simban", parent=S["sm"], fontName=FONT_TITLE, fontSize=9,
            textColor=C["white"], alignment=TA_CENTER, leading=12,
        ),
    )
    t = Table([[txt]], colWidths=[CONTENT_WIDTH])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["crit_border"]),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]))
    return t


def _sim_replace_note() -> Table:
    return callout(
        "<b>À remplacer par des devis réels d'entreprises RGE</b> avant engagement, "
        "financement ou dépôt d'une demande d'aide.",
        "crit",
    )


def _sim_rge_box() -> Table:
    return vigilance_box(
        "Devis RGE réel requis",
        "Cette fiche est une simulation interne de préparation de consultation. "
        "Elle ne constitue ni un devis, ni une offre, ni un engagement de prix. "
        "Seuls des devis d'entreprises RGE, datés et signés, ont valeur "
        "d'engagement pour travaux, financement ou aides.",
        "crit",
    )


def _fiche_lot(
    lot_num: str,
    titre: str,
    objet: str,
    prestations: Sequence[str],
    quantites: Sequence[str],
    exigences: Sequence[str],
    budget_rows: Sequence[Sequence[str]],
    exclusions: Sequence[str],
    prealables: Sequence[str],
    extra_flowables: Optional[Sequence[Any]] = None,
    nom_code: Optional[str] = None,
) -> List[Any]:
    """Une fiche de chiffrage indicatif (1 page environ) — jamais un devis."""
    st: List[Any] = []
    st.append(_sim_banner())
    st.append(sp(0.15))
    if nom_code and not MODE_CLIENT_PREMIUM:
        st.append(h2(f"{nom_code}"))
        st.append(Paragraph(
            "<i>Nom de code interne — simulation budgétaire non contractuelle "
            "— devis RGE réel requis.</i>",
            ParagraphStyle(
                "codename", parent=S["sm"], textColor=C["muted"],
                alignment=TA_CENTER, spaceAfter=6, leading=11,
            ),
        ))
        st.append(callout(
            "<b>Attention :</b> « {0} » est un <b>nom de code interne</b> de "
            "préparation de consultation. Ce n'est <b>ni une société</b>, "
            "<b>ni un artisan</b>, <b>ni un prestataire</b>, <b>ni un devis réel</b>."
            .format(nom_code.replace("—", "-")),
            "warn",
        ))
    else:
        st.append(h2(f"Fiche {lot_num} — {titre}"))
    st.append(_sim_replace_note())
    st.append(sp(0.12))
    st.append(h3("Objet du lot"))
    st.append(p(objet))
    st.append(h3("Prestations incluses (indicatif)"))
    st.append(bullet_list(list(prestations), S["sm"]))
    st.append(h3("Quantités / surfaces à confirmer"))
    st.append(bullet_list(list(quantites), S["sm"]))
    st.append(h3("Exigences techniques"))
    st.append(bullet_list(list(exigences), S["sm"]))
    st.append(h3("Budget indicatif issu des sources"))
    rows = [["Poste", "Budget indicatif", "Source / statut"]]
    rows.extend([list(r) for r in budget_rows])
    st.append(data_table(rows, col_widths=[5.5 * cm, 5.5 * cm, 6 * cm], font_size=8.4))
    st.append(sp(0.12))
    st.append(h3("Exclusions / points à vérifier"))
    st.append(bullet_list(list(exclusions), S["sm"]))
    st.append(h3("Conditions préalables"))
    st.append(bullet_list(list(prealables), S["sm"]))
    if extra_flowables:
        for fl in extra_flowables:
            st.append(fl)
            st.append(sp(0.1))
    st.append(sp(0.12))
    st.append(_sim_rge_box())
    st.append(sp(0.1))
    st.append(_sim_banner())
    st.append(PageBreak())
    return st


def section_simulations_budgetaires() -> List[Any]:
    """Annexe — Simulations budgétaires par lot (préparation consultation artisans)."""
    st: List[Any] = []
    st.append(h1("23. Simulations budgétaires par lot — préparation de consultation artisans"))
    st.append(_sim_banner())
    st.append(sp(0.15))
    st.append(vigilance_box(
        "Ces documents ne sont PAS des devis",
        "Les fiches ci-après sont des <b>simulations budgétaires internes</b> "
        "destinées uniquement à préparer la consultation d'artisans RGE. "
        "Les intitulés du type « Équipe Totoro », « Brigade Naruto », etc. sont "
        "des <b>noms de code internes</b> : ce ne sont <b>ni des sociétés</b>, "
        "<b>ni des artisans</b>, <b>ni des prestataires</b>, <b>ni des devis réels</b>. "
        "Aucun logo, SIRET, signature, adresse, numéro de devis, TVA ou coordonnées "
        "n'y figure en tant qu'offre. Tout chiffrage engageant devra provenir de "
        "<b>devis RGE réels 2026</b>.",
        "crit"))
    st.append(p(
        "Client concerné : Mme Clyve ANDRIOT — longère en pisé, 220 m², "
        "71290 La Genête. Les montants repris des audits FIL ROUGE / BAO ou du "
        "devis historique 2023 sont <b>indicatifs et non contractuels</b>."))
    st.append(_sim_replace_note())
    st.append(PageBreak())

    # ── LOT TOITURE (historique — PAS de nom de code anime)
    st.extend(_fiche_lot(
        "1", "LOT TOITURE / CHARPENTE — référence historique 2023",
        objet=(
            "Réfection de toiture / charpente / couverture pour mise hors d'eau "
            "et préparation de l'isolation des rampants. "
            "<b>Référence documentaire uniquement :</b> devis historique de "
            "couverture du 19/06/2023 (Yoann Suchet — document "
            "<b>expiré</b>). <b>Ce n'est pas une offre actuelle.</b> "
            "Ce lot n'utilise pas de nom de code interne : il reste identifié "
            "comme <b>document historique 2023 à réactualiser</b>."
        ),
        prestations=[
            "Dépose couverture / litelage / évacuations (référence historique).",
            "Remplacement d'éléments de charpente défaillants (chevrons, sablières, "
            "pannes — quantités à confirmer en 2026).",
            "Sous-toiture HPV, litelage, couverture tuiles, zinguerie (selon devis réel).",
            "Abergements et ouvrages de finition de couverture.",
        ],
        quantites=[
            "Surface couverture : 310 m² sur devis historique 2023 — "
            "275 m² mentionnés dans l'audit FIL ROUGE — <b>écart à arbitrer</b>.",
            "Quantités de bois (m³), zinguerie (ml) et accessoires : à relever sur site.",
        ],
        exigences=[
            "Mise hors d'eau durable ; continuité étanchéité / ventilation de toiture.",
            "Compatibilité avec Lot R-01 (rampants) et éventuel Lot S-07 (PV).",
            "Entreprise RGE selon le lot réellement éligible aux aides.",
        ],
        budget_rows=[
            ["Réfection toiture (réf. historique)", "40 788,66 € TTC (2023)",
             "Devis historique expiré — à réactualiser 2026"],
            ["Réfection charpente + couverture (audit)", "~ 70 000 € TTC",
             "FIL ROUGE — estimation d'audit, non devis"],
        ],
        exclusions=[
            "Isolation des rampants (Lot R-01) — non incluse dans cette fiche.",
            "Photovoltaïque / structure PV (Lot S-07).",
            "Échafaudages, accès, imprévus structurels non diagnostiqués.",
            "Toute actualisation de prix 2026 (matières, main-d'œuvre).",
        ],
        prealables=[
            "Visite structure / charpente avant engagement.",
            "Arbitrage surface 275 m² vs 310 m².",
            "<b>Devis historique expiré, à réactualiser en 2026</b> — "
            "ne pas le présenter comme une offre actuelle.",
        ],
        extra_flowables=[
            vigilance_box(
                "Mention obligatoire — devis historique Yoann Suchet",
                "Le chiffrage 40 788,66 € TTC du 19/06/2023 (Yoann Suchet) est une "
                "<b>référence historique expirée</b>. Validité d'origine : 15 jours. "
                "Il doit être <b>réactualisé en 2026</b> par devis RGE réel. "
                "Il ne constitue en aucun cas une offre en vigueur.",
                "crit",
            ),
        ],
    ))

    # ── Lot R-01
    st.extend(_fiche_lot(
        "R-01", "Isolation rampants",
        nom_code="Lot R-01 — Équipe Totoro Isolation",
        objet=(
            "Isolation thermique des rampants de toiture après (ou en cohérence avec) "
            "la réfection de couverture / charpente, pour réduire les déperditions "
            "par le toit (poste majeur sur cette longère)."
        ),
        prestations=[
            "Isolation entre chevrons + complément sous chevrons (selon solution retenue).",
            "Traitement de l'étanchéité à l'air et des ponts thermiques de toiture.",
            "Finitions / protection isolant selon prescriptions du devis réel.",
        ],
        quantites=[
            "Surface : <b>275 m² à confirmer</b> (FIL ROUGE).",
            "Épaisseur / lambda : à définir pour atteindre R cible.",
        ],
        exigences=[
            "Objectif <b>R ≥ 6,5 m².K/W</b> (FIL ROUGE).",
            "Compatibilité avec charpente rénovée et ventilation de toiture.",
            "Entreprise RGE pour éligibilité aides le cas échéant.",
        ],
        budget_rows=[
            ["Isolation rampants R ≥ 6,5", "~ 27 500 € TTC",
             "FIL ROUGE — estimation d'audit, non devis"],
        ],
        exclusions=[
            "Réfection charpente / couverture (fiche toiture historique).",
            "VMC et réseaux (Lot V-04).",
            "Reprises de plâtrerie / peintures intérieures non prévues.",
        ],
        prealables=[
            "Charpente / couverture saines ou réfection concomitante validée.",
            "Mesure précise de la surface de rampants.",
            "Choix du matériau isolant (performance + mise en œuvre).",
        ],
    ))

    # ── Lot M-02
    st.extend(_fiche_lot(
        "M-02", "ITE murs en pisé",
        nom_code="Lot M-02 — Brigade Naruto Chaux-Chanvre",
        objet=(
            "Isolation thermique par l'extérieur des murs en pisé par solution "
            "<b>perspirante chaux-chanvre</b>, y compris mur donnant sur garage "
            "non chauffé, avec enduit chaux de finition."
        ),
        prestations=[
            "Préparation support pisé, ossature secondaire si besoin, projection "
            "chaux-chanvre (indicatif audit : 24 cm, R=5,5).",
            "ITE mur habitation / garage (continuité périphérie).",
            "Enduit chaux de finition perspirant (pare-pluie adapté).",
        ],
        quantites=[
            "Murs pisé : <b>160 m² à confirmer</b>.",
            "Mur côté garage : <b>25 m² à confirmer</b>.",
            "Épaisseur / R : R ≥ 5,5 m².K/W (FIL ROUGE) — à valider sur devis.",
        ],
        exigences=[
            "Matériaux <b>perspirants</b> uniquement (pas de solutions étanches "
            "inadaptées au pisé).",
            "<b>Diagnostic humidité / support obligatoire avant travaux</b>.",
            "Traitement des points singuliers : soubassements, tableaux, débords.",
            "Entreprise expérimentée bâti ancien / pisé + RGE si aides.",
        ],
        budget_rows=[
            ["ITE murs pisé chaux-chanvre", "~ 28 800 € TTC",
             "FIL ROUGE — estimation d'audit"],
            ["ITE mur garage", "~ 4 500 € TTC",
             "FIL ROUGE — estimation d'audit"],
            ["Enduits chaux (indicatif)", "~ 8 000 € + ~ 1 250 € TTC",
             "FIL ROUGE — travaux induits"],
        ],
        exclusions=[
            "Menuiseries (Lot F-03) — coordination des tableaux à prévoir.",
            "Traitement structurel des pathologies lourdes non diagnostiquées.",
            "Décorations intérieures.",
        ],
        prealables=[
            "Diagnostic humidité et état du support pisé.",
            "Validation de la solution chaux-chanvre (ou équivalent perspirant).",
            "Période de mise en œuvre clémente (hors gel / pluie forte).",
        ],
        extra_flowables=[
            vigilance_box(
                "Point de vigilance — pisé &amp; humidité",
                "Ne pas engager l'ITE sans diagnostic humidité/support. "
                "Une isolation non perspirante ou un support humide peut dégrader "
                "le pisé.",
                "warn",
            ),
        ],
    ))

    # ── Lot F-03
    st.extend(_fiche_lot(
        "F-03", "Menuiseries",
        nom_code="Lot F-03 — Escouade Chihiro Menuiseries",
        objet=(
            "Remplacement des menuiseries extérieures pour améliorer l'isolation, "
            "l'étanchéité à l'air et le confort (thermique / acoustique)."
        ),
        prestations=[
            "9 ouvrants bois triple vitrage + volets roulants (indicatif audit).",
            "2 portes performantes (entrée / service) avec isolation périphérique.",
            "Dépose totale, finitions / habillages selon devis réel.",
        ],
        quantites=[
            "9 ouvrants — surface ouvrants indiquée audit : 15,3 m² (à confirmer).",
            "2 portes — surface portes indiquée audit : 3,4 m² (à confirmer).",
            "Uw cible fenêtres : 1,1 W/m².K (FIL ROUGE) — à confirmer.",
            "Ud cible portes : 1,2 W/m².K (FIL ROUGE) — à confirmer.",
        ],
        exigences=[
            "Pose en dépose totale, traitement des ponts thermiques de tableau.",
            "Compatibilité avec ITE chaux-chanvre (Lot M-02) et pisé.",
            "Entreprise RGE menuiseries si aides visées.",
        ],
        budget_rows=[
            ["Fenêtres triple vitrage + volets", "~ 22 000 € TTC",
             "FIL ROUGE — estimation d'audit"],
            ["2 portes performantes", "~ 5 600 € TTC",
             "FIL ROUGE — estimation d'audit"],
            ["Finitions périphériques (indicatif)", "~ 3 500 € + ~ 1 200 € TTC",
             "FIL ROUGE — travaux induits"],
        ],
        exclusions=[
            "Volets hors périmètre non décrits dans l'audit.",
            "Stores intérieurs, quincaillerie décorative hors spec.",
            "Reprises de peinture hors pourtours.",
        ],
        prealables=[
            "Relevé exhaustif des dimensions et types d'ouvrant.",
            "Calepinage avec l'ITE (ordre de pose à valider).",
            "Choix essence / finition bois et type de volets.",
        ],
    ))

    # ── Lot V-04
    st.extend(_fiche_lot(
        "V-04", "Ventilation",
        nom_code="Lot V-04 — Team Kiki Ventilation",
        objet=(
            "Mise en place d'une ventilation mécanique adaptée après renforcement "
            "de l'enveloppe, pour assurer la qualité d'air et maîtriser l'humidité "
            "dans un bâti pisé (foyer de 5 personnes)."
        ),
        prestations=[
            "VMC double flux à étudier (FIL ROUGE : Hygro B, efficacité ~ 85 %, "
            "débit indicatif 180 m³/h).",
            "Réseau gainé isolé, bouches, filtres, raccordements électriques.",
            "Percements / passages — attention particulière murs pisé.",
        ],
        quantites=[
            "Débit et dimensionnement : <b>à étudier selon passages et volumes</b>.",
            "Nombre de bouches extraction / insufflation : à définir sur plans.",
        ],
        exigences=[
            "Ventilation après (ou en cohérence avec) isolation / étanchéité.",
            "Traversées de pisé soignées (étanchéité air / humidité).",
            "Entreprise RGE ventilation si aides visées.",
        ],
        budget_rows=[
            ["VMC Double Flux (équipement)", "~ 6 500 € TTC",
             "FIL ROUGE — estimation d'audit"],
            ["Travaux induits (passages, réseau)", "~ 3 200 € TTC",
             "FIL ROUGE — estimation d'audit"],
        ],
        exclusions=[
            "Désenfumage, VMC existante non inventoriée.",
            "Travaux de plâtrerie hors passages prévus.",
        ],
        prealables=[
            "Étude de faisabilité des passages (combles / cloisons / pisé).",
            "Validation du type de VMC (double flux vs alternative) selon contraintes.",
            "Coordination avec lots enveloppe (R-01, M-02, F-03).",
        ],
    ))

    # ── Lot C-05 PAC / chauffage / ECS (sans plancher = P-06)
    st.extend(_fiche_lot(
        "C-05", "PAC / chauffage / ECS",
        nom_code="Lot C-05 — Capsule Goku Confort",
        objet=(
            "Remplacement du chauffage électrique / bois peu performant et de l'ECS "
            "par une solution bas carbone (PAC air/eau + ECS adaptée au foyer de "
            "5 personnes), <b>uniquement après isolation de l'enveloppe</b>. "
            "Le plancher chauffant est traité séparément (Lot P-06)."
        ),
        prestations=[
            "PAC air/eau (indicatif audit : 15 kW, SCOP 4,5) — "
            "<b>dimensionnement uniquement après isolation</b>.",
            "ECS pour foyer de 5 personnes : solution <b>250 à 300 L à valider</b> "
            "(l'audit évoquait le remplacement de 2 ballons 200 L + 300 L).",
            "Raccordements hydrauliques / électriques, régulation, mise en service.",
            "Formation utilisateur.",
        ],
        quantites=[
            "Puissance PAC : à recalculer post-isolation (ne pas figer 15 kW).",
            "Volume ECS : <b>250 à 300 L à valider</b> selon besoins réels.",
        ],
        exigences=[
            "SCOP / ETAS conformes aux exigences d'aides le cas échéant.",
            "Compatibilité avec émetteurs basse température (dont Lot P-06).",
            "Entreprise RGE chauffage / pompe à chaleur.",
        ],
        budget_rows=[
            ["PAC air/eau", "~ 18 000 € TTC",
             "FIL ROUGE — estimation d'audit"],
            ["Raccordements / mise en service", "~ 5 500 € TTC",
             "FIL ROUGE — à confirmer par devis"],
            ["Ballons thermodynamiques (si retenus)", "~ 8 500 € TTC",
             "FIL ROUGE (2 ballons) — alternative 250–300 L à valider"],
            ["Adaptation / mises au point", "À confirmer",
             "Devis RGE requis"],
        ],
        exclusions=[
            "Plancher chauffant (Lot P-06) — fiche séparée.",
            "Isolation enveloppe (R-01, M-02, F-03) — prérequis.",
            "Photovoltaïque (Lot S-07).",
        ],
        prealables=[
            "Enveloppe isolée et ventilée validée.",
            "Dimensionnement thermique post-travaux.",
            "Coordination avec Lot P-06 si plancher chauffant retenu.",
        ],
        extra_flowables=[
            vigilance_box(
                "Ne pas engager ce lot avant validation de l'enveloppe isolée",
                "Engager une PAC avant isolation conduit à un surdimensionnement, "
                "un surcoût et une efficacité dégradée. Ordre impératif : "
                "lots enveloppe puis Lot C-05 / Lot P-06.",
                "crit",
            ),
        ],
    ))

    # ── Lot P-06 Plancher chauffant
    st.extend(_fiche_lot(
        "P-06", "Plancher chauffant",
        nom_code="Lot P-06 — Équipe One Piece Plancher",
        objet=(
            "Installation d'un plancher chauffant hydraulique basse température "
            "compatible PAC air/eau, sur surface à confirmer, "
            "<b>uniquement après validation de l'enveloppe isolée</b>."
        ),
        prestations=[
            "Plancher chauffant hydraulique basse température "
            "(tubes, collecteurs, régulation par zones — selon devis réel).",
            "Raccordement à la PAC (Lot C-05).",
            "Essais d'étanchéité et mise en service hydraulique.",
        ],
        quantites=[
            "Surface : <b>137 m² à confirmer</b> (FIL ROUGE).",
            "Nombre de boucles / zones : à définir sur plans.",
        ],
        exigences=[
            "Émetteurs basse température compatibles PAC.",
            "Hauteur disponible / faisabilité de mise en œuvre à confirmer.",
            "Entreprise RGE / qualifiée selon lot.",
        ],
        budget_rows=[
            ["Plancher chauffant 137 m²", "~ 11 500 € TTC",
             "FIL ROUGE — estimation d'audit"],
            ["Adaptations / finitions de sol", "À confirmer",
             "Devis RGE requis"],
        ],
        exclusions=[
            "PAC et ECS (Lot C-05).",
            "Revêtements de sol décoratifs hors spec.",
            "Isolation des planchers bas hors périmètre de cette fiche.",
        ],
        prealables=[
            "Enveloppe isolée validée.",
            "Choix définitif plancher vs autres émetteurs BT.",
            "Coordination technique avec Lot C-05.",
        ],
        extra_flowables=[
            vigilance_box(
                "Ne pas engager ce lot avant validation de l'enveloppe isolée",
                "Le plancher chauffant et la PAC doivent être dimensionnés sur un "
                "bâti isolé. Ne pas engager Lot P-06 / Lot C-05 avant les lots "
                "enveloppe.",
                "crit",
            ),
        ],
    ))

    # ── Lot S-07 PV
    st.extend(_fiche_lot(
        "S-07", "Photovoltaïque 6 kWc + batterie 7 kWh",
        nom_code="Lot S-07 — Team Pikachu Solaire",
        objet=(
            "Option photovoltaïque et stockage : <b>18 000 € TTC</b> "
            "(6 kWc + batterie 7 kWh). "
            "<b>Budget de travail transmis par le porteur du projet.</b> "
            "Simulation budgétaire non contractuelle, à confirmer par un devis "
            "d'installateur qualifié."
        ),
        prestations=[
            "Installation photovoltaïque 6 kWc ;",
            "Batterie de stockage 7 kWh ;",
            "Onduleur ou micro-onduleurs ;",
            "Protections électriques, pose, raccordement et mise en service ;",
            "Pilotage de l'autoconsommation ;",
            "Étude préalable : structure, orientation, ombrages, raccordement, "
            "implantation et compatibilité électrique.",
        ],
        quantites=[
            "Puissance visée : <b>6 kWc</b> (hypothèse) — à confirmer.",
            "Stockage visé : <b>7 kWh</b> (hypothèse) — à confirmer.",
            "Surface / implantation : à définir après étude de toiture.",
        ],
        exigences=[
            "<b>Hypothèse client — étude de structure, orientation, ombrages, "
            "raccordement et devis installateur requis.</b>",
            "Compatibilité avec réfection de toiture (fiche historique).",
            "Qualifications RGE / QualiPV selon dispositif d'aide éventuel.",
        ],
        budget_rows=[
            ["LOT PHOTOVOLTAÏQUE + BATTERIE", "18 000 € TTC",
             "Budget de travail — porteur du projet"],
            ["Périmètre", "6 kWc + batterie 7 kWh + onduleur/micro-onduleurs + pose + raccordement + pilotage",
             "Hypothèse à valider par devis installateur"],
            ["Prime / rentabilité / économies garanties / RAC définitif", "Non affiché",
             "Interdit dans cette simulation"],
        ],
        exclusions=[
            "Solaire thermique (ECS) — distinct du photovoltaïque.",
            "Renforcement de charpente non diagnostiqué.",
            "Toute promesse de rentabilité ou d'autoconsommation chiffrée.",
        ],
        prealables=[
            "Toiture saine ou réfection validée (fiche historique 2023 à réactualiser).",
            "Étude structure + ombrages + raccordement.",
            "Devis installateur RGE / qualifié — seul document engageant.",
        ],
        extra_flowables=[
            vigilance_box(
                "Étude préalable obligatoire",
                "Étude préalable obligatoire : structure de toiture, orientation, "
                "ombrages, raccordement, implantation des équipements et "
                "compatibilité électrique.",
                "crit",
            ),
            callout(
                "<b>Budget de travail transmis par le porteur du projet.</b> "
                "Simulation budgétaire non contractuelle, à confirmer par un devis "
                "d'installateur qualifié. Aucune prime, rentabilité, économie "
                "garantie ni reste à charge définitif n'est affiché.",
                "warn",
            ),
        ],
    ))

    # ── Tableau de synthèse
    st.append(_sim_banner())
    st.append(sp(0.15))
    st.append(h2("Tableau de synthèse — lots &amp; noms de code internes"))
    st.append(p(
        "Comparaison des simulations budgétaires internes. Les noms de code "
        "(Totoro, Naruto, Chihiro, Kiki, Goku, One Piece, Pikachu) sont "
        "<b>strictement internes</b> : ils ne désignent aucune société ni artisan. "
        "Tous les montants sont <b>indicatifs</b> et doivent être remplacés par "
        "des devis RGE réels."))
    st.append(data_table([
        ["Lot / nom de code interne", "Budget source (indicatif)", "Statut", "Priorité", "Devis réel nécessaire"],
        ["Toiture / charpente<br/><i>(historique Yoann Suchet 2023 — pas de code)</i>",
         "40 788,66 € TTC (hist. 2023)<br/>ou ~ 70 000 € (FIL ROUGE)",
         "Réf. historique expirée<br/>à réactualiser 2026",
         "1 — Urgent<br/>(hors d'eau)",
         "Oui — réactualisation 2026"],
        ["Lot R-01 — Équipe Totoro Isolation",
         "~ 27 500 € TTC (FIL ROUGE)",
         "Code interne<br/>275 m² / R≥6,5",
         "1 — Lié toiture",
         "Oui"],
        ["Lot M-02 — Brigade Naruto Chaux-Chanvre",
         "~ 28 800 + 4 500 € TTC<br/>(+ enduits)",
         "Code interne<br/>perspirant",
         "2 — Enveloppe",
         "Oui — après diag. humidité"],
        ["Lot F-03 — Escouade Chihiro Menuiseries",
         "~ 22 000 + 5 600 € TTC",
         "Code interne<br/>9 ouvrants + 2 portes",
         "2 — Enveloppe",
         "Oui"],
        ["Lot V-04 — Team Kiki Ventilation",
         "~ 6 500 € TTC<br/>(+ ~ 3 200 € induits)",
         "Code interne<br/>DF à étudier",
         "2 — Après étanchéité",
         "Oui"],
        ["Lot C-05 — Capsule Goku Confort",
         "PAC ~ 18 000 € ;<br/>ECS à valider",
         "Code interne<br/>post-isolation",
         "3 — Après enveloppe",
         "Oui — pas avant isolation"],
        ["Lot P-06 — Équipe One Piece Plancher",
         "~ 11 500 € TTC<br/>(137 m²)",
         "Code interne<br/>post-isolation",
         "3 — Après enveloppe",
         "Oui — pas avant isolation"],
        ["LOT PHOTOVOLTAÏQUE + BATTERIE<br/>Lot S-07 — Team Pikachu Solaire",
         "6 kWc + batterie 7 kWh<br/><b>18 000 € TTC</b>",
         "Budget de travail<br/>porteur du projet",
         "4 — Option",
         "Hypothèse à valider par devis installateur"],
    ], col_widths=[4.2 * cm, 3.6 * cm, 3 * cm, 2.6 * cm, 3.6 * cm], font_size=7.2))
    st.append(sp(0.2))
    st.append(callout(
        "<b>Rappel :</b> les noms de code internes ne doivent jamais être "
        "présentés comme des sociétés, artisans, prestataires ou devis réels. "
        "Le devis historique Yoann Suchet (19/06/2023) reste un document "
        "historique à réactualiser en 2026.",
        "warn"))
    st.append(_sim_replace_note())
    st.append(sp(0.15))
    st.append(_sim_rge_box())
    st.append(sp(0.15))
    st.append(_sim_banner())
    st.append(source_note(
        "Annexe simulations budgétaires internes — noms de code uniquement. "
        "Sources : devis historique toiture 19/06/2023 (Yoann Suchet) ; "
        "FIL ROUGE. Aucun de ces éléments ne vaut devis."))
    return st


def build_story() -> List[Any]:
    sections = [
        section_cover,
        section_confidentiality,
        section_toc,
        section_prestations_energia,
        section_synthese,
        section_logement,
        section_etat_energetique,
        section_diagnostic_visuel,
        section_thermographie,
        section_deperditions,
        section_pise,
        section_details_postes,
        section_devis_existants,
        section_devis_manquants,
        section_scenario1,
        section_scenario2,
        section_scenario3,
        section_solaire,
        section_comparatif,
        section_aides,
        section_planning,
        section_suivi,
        section_glossaire,
        section_referentiels_publics,
        section_annexes,
    ]
    # MODE CLIENT PREMIUM : pas de fiches internes (noms de code / simulations fictives)
    if not MODE_CLIENT_PREMIUM:
        sections.append(section_simulations_budgetaires)
    story: List[Any] = []
    for i, sec in enumerate(sections):
        story.extend(sec())
        if i < len(sections) - 1:
            story.append(PageBreak())
    return story


def generate(output_path: Path) -> Path:
    """Génère le DOSSIER TECHNIQUE / ANNEXES (rapport complet inchangé)."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        # Marge haute >= bandeau couverture (28 mm) pour éviter tout chevauchement
        topMargin=32 * mm,
        bottomMargin=20 * mm,
        title="Dossier technique & annexes — Clyve Andriot",
        author="ENERGIA CONSEIL IA®",
        subject="Longère pisé — La Genête (71) — Annexe technique complète",
    )
    story = build_story()
    doc.build(story, canvasmaker=NumberedCanvas)
    return output_path


def generate_decision_summary(output_path: Path) -> Path:
    """Délègue à la synthèse décisionnelle courte (8–12 pages)."""
    from clyve_synthese_decisionnelle import generate_decision_summary as _gen
    return _gen(output_path)


def count_pages(pdf_path: Path) -> int:
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except ImportError:
            return -1
    try:
        return len(PdfReader(str(pdf_path)).pages)
    except Exception:
        return -1


def _build_mini_pdf(path: Path, flowables: List[Any], title: str,
                    cover_first: bool = False) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    top = 32 * mm if cover_first else 22 * mm
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=top,
        bottomMargin=16 * mm,
        title=title,
        author=MARQUE,
    )
    doc.build(flowables, canvasmaker=make_canvas(cover_first=cover_first))
    return path


def export_accompagnement_preview(preview_dir: Path) -> List[Path]:
    """Génère un PDF temporaire (2 pages) puis exporte des PNG de prévisualisation."""
    import fitz  # pymupdf

    preview_dir.mkdir(parents=True, exist_ok=True)
    tmp_pdf = preview_dir / "_preview_accompagnement.tmp.pdf"
    _build_mini_pdf(
        tmp_pdf,
        section_prestations_energia(),
        "Preview — Accompagnement ENERGIA CONSEIL IA®",
        cover_first=False,
    )

    out_paths: List[Path] = []
    pdf = fitz.open(str(tmp_pdf))
    try:
        n = pdf.page_count
        print(f"[i] Preview accompagnement : {n} page(s)")
        for i in range(n):
            page = pdf.load_page(i)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            out = preview_dir / f"preview_accompagnement_p{i + 1}.png"
            pix.save(str(out))
            out_paths.append(out)
            print(f"[OK] PNG preview : {out}")
    finally:
        pdf.close()
        try:
            tmp_pdf.unlink(missing_ok=True)
        except Exception:
            pass
    return out_paths


def _pdf_pages_to_png(pdf_path: Path, preview_dir: Path, prefix: str) -> List[Path]:
    import fitz
    out_paths: List[Path] = []
    pdf = fitz.open(str(pdf_path))
    try:
        for i in range(pdf.page_count):
            page = pdf.load_page(i)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            out = preview_dir / f"{prefix}_p{i + 1}.png"
            pix.save(str(out))
            out_paths.append(out)
            print(f"[OK] PNG preview : {out}")
    finally:
        pdf.close()
    return out_paths


def export_quality_previews(preview_dir: Path) -> dict:
    """PNG de contrôle : couverture, accompagnement, financement Fabien."""
    import fitz

    preview_dir.mkdir(parents=True, exist_ok=True)
    results: dict = {"paths": [], "errors": []}

    # 1) Couverture
    try:
        tmp = preview_dir / "_preview_cover.tmp.pdf"
        _build_mini_pdf(tmp, section_cover(), "Preview couverture", cover_first=True)
        pdf = fitz.open(str(tmp))
        try:
            page = pdf.load_page(0)
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            out = preview_dir / "preview_couverture.png"
            pix.save(str(out))
            results["paths"].append(out)
            print(f"[OK] PNG preview : {out}")
        finally:
            pdf.close()
            try:
                tmp.unlink(missing_ok=True)
            except Exception:
                pass
    except Exception as e:
        results["errors"].append(f"couverture: {e}")
        print(f"[!] Preview couverture : {e}")

    # 2) Accompagnement
    try:
        paths = export_accompagnement_preview(preview_dir)
        results["paths"].extend(paths)
    except Exception as e:
        results["errors"].append(f"accompagnement: {e}")
        print(f"[!] Preview accompagnement : {e}")

    # 3) Financement Fabien
    try:
        tmp = preview_dir / "_preview_fabien.tmp.pdf"
        _build_mini_pdf(tmp, section_aides(), "Preview financement Fabien", cover_first=False)
        pdf = fitz.open(str(tmp))
        try:
            exported = 0
            for i in range(pdf.page_count):
                page = pdf.load_page(i)
                txt = page.get_text("text") or ""
                if "Fabien" in txt or "FABIEN" in txt:
                    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                    out = preview_dir / f"preview_financement_fabien_p{exported + 1}.png"
                    pix.save(str(out))
                    results["paths"].append(out)
                    print(f"[OK] PNG preview : {out}")
                    exported += 1
            if exported == 0 and pdf.page_count:
                page = pdf.load_page(min(1, pdf.page_count - 1))
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                out = preview_dir / "preview_financement_fabien_p1.png"
                pix.save(str(out))
                results["paths"].append(out)
                print(f"[OK] PNG preview : {out}")
        finally:
            pdf.close()
            try:
                tmp.unlink(missing_ok=True)
            except Exception:
                pass
    except Exception as e:
        results["errors"].append(f"fabien: {e}")
        print(f"[!] Preview Fabien : {e}")

    return results


def _qc_email_ok(script_path: Path) -> Tuple[bool, str]:
    """Vérifie l'identité e-mail dans le script (hors lignes de contrôle QC)."""
    src = script_path.read_text(encoding="utf-8")
    forbidden = ["contact@energia-conseil.com", "lembelembe.sylvain@gmail.com"]
    skip_tokens = (
        "forbidden", "_qc_email", "src_chk", "replace(",
        "EMAIL_OFFICIEL", 'in full', 'in text', 'in clean',
        "Email interdit", "controle e-mail", "banned",
        'or "lembelembe', "or 'lembelembe",
    )
    clean_lines = []
    for ln in src.splitlines():
        if any(k in ln for k in skip_tokens):
            continue
        # Lignes purement détectives (if "bad" in ...)
        if ln.strip().startswith("if ") and any(bad in ln for bad in forbidden):
            continue
        clean_lines.append(ln)
    clean = "\n".join(clean_lines)
    for bad in forbidden:
        if bad in clean:
            return False, f"Email interdit encore present : {bad}"
    if EMAIL_OFFICIEL not in src:
        return False, "Email officiel manquant"
    if "marque déposée INPI" in src.lower():
        return False, "Mention interdite « marque déposée INPI »"
    return True, f"Email officiel OK : {EMAIL_OFFICIEL}"


def _qc_cover_ok(pdf_path: Path) -> Tuple[bool, str]:
    """Contrôle couverture : photo présente, textes, pas d'email interdit."""
    import fitz
    try:
        pdf = fitz.open(str(pdf_path))
    except Exception as e:
        return False, f"Ouverture PDF impossible : {e}"
    try:
        if pdf.page_count < 1:
            return False, "PDF vide"
        page = pdf.load_page(0)
        text = page.get_text("text") or ""
        imgs = page.get_images(full=True)
        checks = []
        ok = True
        if "RAPPORT PERSONNALISÉ" not in text and "RAPPORT PERSONNALISE" not in text.replace("É", "E"):
            # tolérance accents
            if "RAPPORT" not in text.upper():
                ok = False
                checks.append("titre manquant")
        if "Clyve" not in text and "Andriot" not in text:
            ok = False
            checks.append("projet manquant")
        if EMAIL_OFFICIEL not in text:
            ok = False
            checks.append("email officiel manquant sur couverture")
        if "contact@energia-conseil.com" in text or "lembelembe.sylvain@gmail.com" in text:
            ok = False
            checks.append("email interdit sur couverture")
        if not imgs:
            ok = False
            checks.append("photo de couverture absente")
        if ok:
            return True, f"Couverture OK (images={len(imgs)})"
        return False, "Couverture : " + ", ".join(checks)
    finally:
        pdf.close()


def main() -> int:
    print("=" * 70)
    print(f"{MARQUE} — Generation double PDF Clyve Andriot")
    print(f"   Client : {CLIENT['nom']}")
    print(f"   Mode   : {'CLIENT_PREMIUM' if MODE_CLIENT_PREMIUM else 'INTERNE'}")
    print("=" * 70)

    import shutil

    tech_root = ROOT / TECHNICAL_PDF_NAME
    tech_client = OUTPUT_DIR / TECHNICAL_PDF_NAME
    syn_root = ROOT / SYNTHESIS_PDF_NAME
    syn_client = OUTPUT_DIR / SYNTHESIS_PDF_NAME
    alias_root = ROOT / PDF_NAME
    alias_client = OUTPUT_DIR / PDF_NAME
    preview_dir = OUTPUT_DIR / "preview"
    errors: List[str] = []

    # 1) Prévisualisations de contrôle (dossier technique)
    print("\n--- Previews de controle (dossier technique) ---")
    prev = export_quality_previews(preview_dir)
    errors.extend(prev.get("errors") or [])

    # 2) Dossier technique complet (ANNEXE — ne pas réduire)
    print("\n--- Generation DOSSIER TECHNIQUE ---")
    generate(tech_root)
    print(f"[OK] Dossier technique (racine) : {tech_root}")
    try:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(tech_root, tech_client)
        # Alias historique pour compatibilité
        shutil.copyfile(tech_root, alias_root)
        shutil.copyfile(tech_root, alias_client)
        print(f"[OK] Copie client : {tech_client}")
        print(f"[OK] Alias historique : {alias_client}")
    except Exception as e:
        msg = f"Copie dossier technique impossible: {e}"
        print(f"[!] {msg}")
        errors.append(msg)

    # 3) Synthèse décisionnelle courte
    print("\n--- Generation SYNTHESE DECISIONNELLE ---")
    try:
        generate_decision_summary(syn_root)
        print(f"[OK] Synthese (racine) : {syn_root}")
        shutil.copyfile(syn_root, syn_client)
        print(f"[OK] Copie client : {syn_client}")
    except Exception as e:
        msg = f"Generation synthese impossible: {e}"
        print(f"[!] {msg}")
        errors.append(msg)

    # 4) Contrôles qualité
    n_tech = count_pages(tech_root)
    n_syn = count_pages(syn_root) if syn_root.is_file() else -1
    if n_tech < 0:
        print("[i] Comptage pages dossier technique ignore.")
    else:
        print(f"[i] Pages dossier technique : {n_tech} (aucune limite haute)")
    if n_syn < 0:
        print("[i] Comptage pages synthese ignore.")
    else:
        print(f"[i] Pages synthese decisionnelle : {n_syn}")
        if not (8 <= n_syn <= 12):
            errors.append(f"Synthese hors cible 8-12 pages ({n_syn})")
            print(f"[!] Synthese hors cible 8-12 pages : {n_syn}")
        else:
            print("[OK] Synthese dans la cible 8-12 pages")

    email_ok, email_msg = _qc_email_ok(ROOT / "generate_rapport_clyve.py")
    print(f"[{'OK' if email_ok else '!'}] {email_msg}")
    if not email_ok:
        errors.append(email_msg)

    cover_ok, cover_msg = _qc_cover_ok(tech_root)
    print(f"[{'OK' if cover_ok else '!'}] {cover_msg}")
    if not cover_ok:
        errors.append(cover_msg)

    # Scan dossier technique
    try:
        import fitz
        pdf = fitz.open(str(tech_root))
        try:
            full = ""
            for i in range(pdf.page_count):
                full += pdf.load_page(i).get_text("text") or ""
            if "contact@energia-conseil.com" in full or "lembelembe.sylvain@gmail.com" in full:
                errors.append("Email interdit detecte dans le dossier technique")
                print("[!] Email interdit detecte dans le dossier technique")
            elif EMAIL_OFFICIEL in full:
                print(f"[OK] Controle e-mail dossier technique : {EMAIL_OFFICIEL}")
            else:
                errors.append("Email officiel absent du dossier technique")
                print("[!] Email officiel absent du dossier technique")
            if MODE_CLIENT_PREMIUM:
                banned = ["Totoro", "Naruto", "Goku", "Pikachu", "Chihiro", "One Piece", "Team Kiki"]
                found = [b for b in banned if b in full]
                if found:
                    errors.append(f"Noms internes affiches : {', '.join(found)}")
                    print(f"[!] Noms internes en mode client : {found}")
                else:
                    print("[OK] Aucun nom anime / code interne affiche")
                if "Référentiels publics" not in full and "Referentiels publics" not in full:
                    errors.append("Section referentiels publics absente")
                    print("[!] Section referentiels publics absente")
                else:
                    print("[OK] Section referentiels publics presente")
                if "Espaces conseil" not in full and "information gratuite, neutre" not in full:
                    errors.append("Pied de section France Renov' manquant")
                    print("[!] Pied France Renov' manquant")
                else:
                    print("[OK] Pied de section France Renov' present")
        finally:
            pdf.close()
    except Exception as e:
        errors.append(f"Scan dossier technique : {e}")
        print(f"[!] Scan dossier technique : {e}")

    # Scan synthèse
    if syn_root.is_file():
        try:
            import fitz
            pdf = fitz.open(str(syn_root))
            try:
                syn_txt = ""
                for i in range(pdf.page_count):
                    syn_txt += pdf.load_page(i).get_text("text") or ""
                required = [
                    ("logement", "logement"),
                    ("priorites", "priorit"),
                    ("scenarios", "scénario"),
                    ("budget", "budget"),
                    ("aides", "aide"),
                    ("financement", "financ"),
                    ("recommandation", "recommand"),
                    ("plan d'action", "plan d"),
                    ("contact", "contact"),
                ]
                missing = []
                low = syn_txt.lower().replace("é", "e").replace("è", "e")
                for label, needle in required:
                    if needle.replace("é", "e") not in low and needle not in syn_txt.lower():
                        # fuzzy
                        if needle not in syn_txt.lower():
                            missing.append(label)
                # re-check with accents preserved
                missing = []
                checks = {
                    "logement": ["logement", "Logement"],
                    "priorites": ["priorit"],
                    "scenarios": ["SCÉNARIO", "Scenario", "scénario"],
                    "budget": ["Budget", "budget"],
                    "aides": ["Aide", "aide"],
                    "financement": ["Financement", "financ"],
                    "recommandation": ["recommand"],
                    "plan_action": ["Plan d", "plan d"],
                    "contact": ["Contact", EMAIL_OFFICIEL],
                }
                for label, needles in checks.items():
                    if not any(n.lower() in syn_txt.lower() for n in needles):
                        missing.append(label)
                if missing:
                    errors.append(f"Synthese sections manquantes : {missing}")
                    print(f"[!] Synthese sections manquantes : {missing}")
                else:
                    print("[OK] Sections obligatoires synthese presentes")
                if "dossier technique complet" not in syn_txt.lower():
                    errors.append("Mention annexe technique absente de la synthese")
                    print("[!] Mention annexe technique absente")
                else:
                    print("[OK] Mention dossier technique present en synthese")
                forbidden_syn = [
                    "certifié ANAH", "certifie ANAH", "95 % de précision",
                    "95% de precision", "aides garanties", "ROI garanti",
                    "calcul au centime près", "48h garanties", "48 h garanties",
                ]
                hits = [f for f in forbidden_syn if f.lower() in syn_txt.lower()]
                if hits:
                    errors.append(f"Formulations interdites synthese : {hits}")
                    print(f"[!] Formulations interdites : {hits}")
                else:
                    print("[OK] Aucune formulation interdite dans la synthese")
            finally:
                pdf.close()
        except Exception as e:
            errors.append(f"Scan synthese : {e}")
            print(f"[!] Scan synthese : {e}")

    print("\n" + "=" * 70)
    print("RESUME FINAL — DOUBLE PDF")
    print(f"  Synthese decisionnelle : {n_syn if n_syn >= 0 else 'n/d'} page(s)")
    print(f"    -> {syn_root}")
    print(f"    -> {syn_client}")
    print(f"  Dossier technique      : {n_tech if n_tech >= 0 else 'n/d'} page(s)")
    print(f"    -> {tech_root}")
    print(f"    -> {tech_client}")
    print(f"  Alias historique       : {alias_client}")
    print("  Sections synthese      : couverture, logement, priorites, ordre travaux,")
    print("                            3 scenarios, budget/aides/financement,")
    print("                            recommandation, plan d'action, contact")
    print(f"  Previews               : {len(prev.get('paths') or [])} fichier(s)")
    print(f"  Controle e-mail        : {'VALIDE' if email_ok else 'ECHEC'}")
    print(f"  Controle couverture    : {'VALIDE' if cover_ok else 'ECHEC'}")
    if errors:
        print(f"  Erreurs detectees      : {len(errors)}")
        for e in errors:
            print(f"    ! {e}")
    else:
        print("  Erreurs detectees      : aucune")
    print("=" * 70)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
