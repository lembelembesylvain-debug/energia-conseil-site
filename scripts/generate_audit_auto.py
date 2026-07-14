#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur automatique d'audit énergétique PDF — ENERGIA-CONSEIL IA®
Produit un document personnalisé de 85 pages à partir d'un dictionnaire client.

Usage:
    python scripts/generate_audit_auto.py
    python scripts/generate_audit_auto.py --output audits/Audit_CLIENT_2026.pdf
"""

from __future__ import annotations

import argparse
import io
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Callable, Iterable, List, Optional, Sequence, Tuple

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTES ENERGIA-CONSEIL IA®
# ─────────────────────────────────────────────────────────────────────────────

TOTAL_PAGES = 85
TVA_REDUITE = 0.055

C = {
    "primary": colors.HexColor("#0f766e"),
    "primary_light": colors.HexColor("#f0fdfa"),
    "secondary": colors.HexColor("#1e40af"),
    "text": colors.HexColor("#0f172a"),
    "muted": colors.HexColor("#475569"),
    "border": colors.HexColor("#e2e8f0"),
    "red": colors.HexColor("#be123c"),
    "green": colors.HexColor("#16a34a"),
    "orange": colors.HexColor("#f97316"),
    "white": colors.white,
    "dark": colors.HexColor("#0f172a"),
    "yellow_bg": colors.HexColor("#fef3c7"),
    "blue_bg": colors.HexColor("#eff6ff"),
    "green_bg": colors.HexColor("#f0fdf4"),
    "warn_bg": colors.HexColor("#fffbeb"),
    "crit_bg": colors.HexColor("#fff1f2"),
    "legal_bg": colors.HexColor("#fff7ed"),
}

ENTREPRISE = {
    "nom": "ENERGIA-CONSEIL IA®",
    "tagline": "Audit Énergétique Intelligence Artificielle | Marque déposée INPI | Bureau d'études & AMO",
    "adresse": "16 Rue Cuvier, 69006 Lyon",
    "tel": "06 10 59 68 98",
    "email": "contact@energia-conseil.com",
    "web": "www.energia-conseil.com",
    "siret": "94181942700019",
    "rcs": "Lyon 941819427",
    "decennale": "LUNPIB2604975",
}

CONTACTS = (
    "Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 | "
    "DAMIEN (Commercial) 06 72 68 09 68 | "
    "FABIEN (VIVONS COURTIER) 06 71 19 96 45 | "
    "Julia (Juriste) | MAR Léo-Energy"
)

AIDS_DISCLAIMER = (
    "<b>Aides financières 2026 (estimation à titre indicatif).</b> "
    "Aides à valider selon revenus réels du client et éligibilité en vigueur. "
    "Montants définitifs après instruction ANAH et CEE."
)

ORDRE_TRAVAUX = (
    "1. Isolation combles → 2. Isolation murs (ITI/ITE) → 3. Isolation planchers → "
    "4. Fenêtres → 5. VMC double flux → 6. PAC (post-isolation) → "
    "7. Ballon thermodynamique → 8. Photovoltaïque"
)

# Données client par défaut (exemple PEREIRA)
CLIENT_DEFAULT: dict[str, Any] = {
    "nom": "Mr. PEREIRA",
    "adresse": "1 route de Mizérieux, 42510 Nervieux",
    "surface": 164,
    "annee_construction": 1960,
    "dpe_actuel": "F",
    "type_bien": "Maison individuelle en pisé",
    "personnes": 1,
    "revenu_fiscal": 17000,
    "profil_anah": "BLEU",
    "zone_geo": "Hors IDF",
    "region": "Auvergne-Rhône-Alpes",
    "budget_travaux": 125000,
    "mpr": 32000,
    "cee": 8000,
    "ecoptz": 50000,
    "effort_final": 35000,
    "economies_annuelles": 7005,
    "facture_avant": 9097,
    "facture_apres": 2092,
    "dpe_cible": "A",
    "option_solaire": True,
    "puissance_pv": 6,
    "production_pv": 11213,
    "economies_solaires": 2355,
    "facture_residuelle": 208,
    "email_client": "david.pereira@cneap.fr",
}

# Alias public — modifier ce dict ou passer un dict à generate_audit_auto()
client = CLIENT_DEFAULT


# ─────────────────────────────────────────────────────────────────────────────
# UTILITAIRES
# ─────────────────────────────────────────────────────────────────────────────


def format_euro(val: float | int, signed: bool = False) -> str:
    n = int(round(float(val)))
    prefix = "+" if signed and n > 0 else ("-" if signed and n < 0 else "")
    body = f"{abs(n):,}".replace(",", " ")
    return f"{prefix}{body} €"


def slug_client(nom: str) -> str:
    parts = re.sub(r"[^A-Za-zÀ-ÿ\s]", "", nom).strip().split()
    return (parts[-1] if parts else "CLIENT").upper()


def pct_reduction(avant: float, apres: float) -> int:
    if avant <= 0:
        return 0
    return int(round((1 - apres / avant) * 100))


class ClientContext:
    """Données client + valeurs dérivées pour la génération PDF."""

    def __init__(self, raw: dict[str, Any]):
        self.raw = dict(raw)
        self.nom = raw.get("nom", "Client")
        self.slug = slug_client(self.nom)
        self.ref = f"AUDIT-2026-{self.slug}"
        self.date_str = datetime.now().strftime("%d/%m/%Y")
        self.surface = int(raw.get("surface", 100))
        self.budget = float(raw.get("budget_travaux", 80000))
        self.mpr = float(raw.get("mpr", 0))
        self.cee = float(raw.get("cee", 0))
        self.total_aides = self.mpr + self.cee
        self.reste = float(raw.get("effort_final", self.budget - self.total_aides))
        self.ecoptz = float(raw.get("ecoptz", min(50000, self.budget)))
        self.eco_mois = float(raw.get("economies_annuelles", 2000)) / 12
        self.duree_pret = int(raw.get("duree_pret_mois", 240))
        self.mensualite = self.ecoptz / self.duree_pret if self.duree_pret else 0
        self.gain_net_mois = self.eco_mois - self.mensualite
        self.roi = self.reste / max(float(raw.get("economies_annuelles", 1)), 1)
        self.facture_avant = float(raw.get("facture_avant", 3000))
        self.facture_apres = float(raw.get("facture_apres", 800))
        self.facture_res = float(raw.get("facture_residuelle", self.facture_apres))
        self.dpe_actuel = raw.get("dpe_actuel", "F")
        self.dpe_cible = raw.get("dpe_cible", "C")
        self.profil = raw.get("profil_anah", "BLEU").upper()
        self.pv = bool(raw.get("option_solaire", False))
        self.puissance_pv = float(raw.get("puissance_pv", 6))
        self.production_pv = float(raw.get("production_pv", 10000))
        self.scenario_confort = float(raw.get("budget_confort", 42000))
        self.scenario_perf = float(raw.get("budget_performance", 85000))
        self.acompte_30 = self.budget * 0.30
        self.mi_40 = self.budget * 0.40
        self.reception_30 = self.budget * 0.30
        self.avance_anah = self.mpr * 0.50 if self.profil == "BLEU" else self.mpr * 0.30
        self.avance_ecoptz = self.ecoptz * 0.30
        self.avance_fabien = max(0, self.acompte_30 - self.avance_anah - self.avance_ecoptz)
        self.tresorerie = self.avance_anah + self.avance_ecoptz + self.avance_fabien
        self.is_pise = "pisé" in raw.get("type_bien", "").lower() or "pise" in raw.get("type_bien", "").lower()
        self.conso_avant = int(raw.get("conso_avant", 292))
        self.conso_apres = int(raw.get("conso_apres", 67))


# ─────────────────────────────────────────────────────────────────────────────
# STYLES & COMPOSANTS PDF
# ─────────────────────────────────────────────────────────────────────────────


class StyleFactory:
    def __init__(self):
        base = getSampleStyleSheet()
        self.h1 = ParagraphStyle(
            "H1", parent=base["Heading1"], fontName="Helvetica-Bold",
            fontSize=20, textColor=C["primary"], spaceAfter=8, spaceBefore=4,
        )
        self.h2 = ParagraphStyle(
            "H2", parent=base["Heading2"], fontName="Helvetica-Bold",
            fontSize=13, textColor=C["text"], spaceAfter=6, spaceBefore=10,
            borderPadding=4, leftIndent=0,
        )
        self.h3 = ParagraphStyle(
            "H3", parent=base["Normal"], fontName="Helvetica-Bold",
            fontSize=11, textColor=C["secondary"], spaceAfter=4,
        )
        self.body = ParagraphStyle(
            "Body", parent=base["Normal"], fontName="Helvetica",
            fontSize=9.5, textColor=C["text"], alignment=TA_JUSTIFY,
            leading=13, spaceAfter=4,
        )
        self.body_sm = ParagraphStyle(
            "BodySm", parent=self.body, fontSize=8.5, leading=11,
        )
        self.muted = ParagraphStyle(
            "Muted", parent=self.body_sm, textColor=C["muted"],
        )
        self.center = ParagraphStyle(
            "Center", parent=self.body, alignment=TA_CENTER,
        )
        self.cover_title = ParagraphStyle(
            "CoverTitle", parent=base["Title"], fontName="Helvetica-Bold",
            fontSize=26, textColor=C["white"], alignment=TA_CENTER, spaceAfter=12,
        )
        self.cover_sub = ParagraphStyle(
            "CoverSub", parent=self.cover_title, fontSize=14, spaceAfter=6,
        )
        self.cover_white = ParagraphStyle(
            "CoverWhite", parent=self.body, fontSize=11,
            textColor=C["white"], alignment=TA_CENTER,
        )
        self.header_sub = ParagraphStyle(
            "HeaderSub", parent=self.muted, fontSize=8, fontName="Helvetica-Bold",
        )


class PDFComponents:
    WIDTH = 17 * cm

    def __init__(self, ctx: ClientContext, styles: StyleFactory):
        self.ctx = ctx
        self.s = styles

    def p(self, text: str, style: Optional[ParagraphStyle] = None) -> Paragraph:
        return Paragraph(text, style or self.s.body)

    def spacer(self, h: float = 0.3) -> Spacer:
        return Spacer(1, h * cm)

    def header_block(self, section: str, page: int) -> List[Any]:
        data = [[
            Paragraph(f"<b>{ENTREPRISE['nom']}</b>", self.s.h3),
            Paragraph(f"Réf. {self.ctx.ref} | Page {page}/{TOTAL_PAGES}", self.s.muted),
        ], [
            Paragraph(section, self.s.header_sub),
            "",
        ]]
        t = Table(data, colWidths=[11 * cm, 6 * cm])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("LINEBELOW", (0, 1), (-1, 1), 1.5, C["primary"]),
            ("BOTTOMPADDING", (0, 1), (-1, 1), 6),
        ]))
        return [t, self.spacer(0.25)]

    def table(
        self,
        rows: Sequence[Sequence[str]],
        col_widths: Optional[Sequence[float]] = None,
        header: bool = True,
        total_row: Optional[int] = None,
    ) -> Table:
        cw = col_widths or [self.WIDTH / len(rows[0])] * len(rows[0])
        t = Table(rows, colWidths=cw, repeatRows=1 if header else 0)
        style_cmds = [
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#f8fafc")),
            ("TEXTCOLOR", (0, 0), (-1, 0), C["muted"]),
            ("GRID", (0, 0), (-1, -1), 0.4, C["border"]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ]
        if total_row is not None:
            style_cmds += [
                ("BACKGROUND", (0, total_row), (-1, total_row), C["primary_light"]),
                ("FONTNAME", (0, total_row), (-1, total_row), "Helvetica-Bold"),
            ]
        t.setStyle(TableStyle(style_cmds))
        return t

    def box(self, text: str, kind: str = "info") -> Table:
        bg = {
            "info": C["primary_light"],
            "warn": C["warn_bg"],
            "crit": C["crit_bg"],
            "legal": C["legal_bg"],
            "green": C["green_bg"],
            "blue": C["blue_bg"],
            "dark": C["dark"],
        }.get(kind, C["primary_light"])
        fg = C["white"] if kind == "dark" else C["text"]
        st = ParagraphStyle("box", parent=self.s.body_sm, textColor=fg)
        t = Table([[Paragraph(text, st)]], colWidths=[self.WIDTH])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("BOX", (0, 0), (-1, -1), 0.5, C["border"]),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        return t

    def kpi_row(self, items: Sequence[Tuple[str, str]]) -> Table:
        cells = []
        for label, val in items:
            cells.append([
                Paragraph(f'<para align="center"><font size="7" color="#475569">{label}</font><br/>'
                          f'<b><font size="14" color="#0f766e">{val}</font></b></para>', self.s.center)
            ])
        t = Table([cells], colWidths=[self.WIDTH / len(items)] * len(items))
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), C["primary_light"]),
            ("BOX", (0, 0), (-1, -1), 0.4, colors.HexColor("#ccf2ed")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        return t

    def aids_box(self) -> Table:
        return self.box(AIDS_DISCLAIMER, "info")

    def page_footer_note(self) -> Paragraph:
        return Paragraph(
            f"{ENTREPRISE['nom']} — Décennale MIC Insurance N° {ENTREPRISE['decennale']}",
            self.s.muted,
        )


# ─────────────────────────────────────────────────────────────────────────────
# PLAN DES 85 PAGES
# ─────────────────────────────────────────────────────────────────────────────

PAGE_PLAN: List[Tuple[str, str]] = [
    ("I", "Couverture & synthèse exécutive"),
    ("I", "Sommaire & stratégie ENERGIA"),
    ("II", "Fiche client détaillée"),
    ("II.BIS", "Ponts thermiques — introduction"),
    ("II.BIS", "Schéma mur / toiture"),
    ("II.BIS", "Schémas plancher & menuiseries"),
    ("II", "État des lieux technique — isolation"),
    ("II", "État des lieux — chauffage & ventilation"),
    ("I", "Synthèse visuelle & KPI financiers"),
    ("II.TER", "Bilan carbone — état des lieux"),
    ("II.TER", "Le tournant écologique"),
    ("II.TER", "Graphique comparatif GES"),
    ("II.TER", "Synthèse & valorisation écologique"),
    ("II.QUATER", "Façades Nord & Sud"),
    ("II.QUATER", "Façades Est & Ouest"),
    ("IV", "Catalogue — Isolation combles"),
    ("IV", "Catalogue — ITI murs pisé"),
    ("IV", "Catalogue — Plancher bas"),
    ("IV", "Catalogue — Menuiseries"),
    ("IV", "Catalogue — VMC hygroréglable"),
    ("IV", "Catalogue — PAC air/eau"),
    ("IV", "Catalogue — Ballon thermodynamique"),
    ("IV", "Catalogue — Dépose fioul"),
    ("IV", "Catalogue — Coordination AMO"),
    ("IV", "Fiche technique photovoltaïque"),
    ("IV", "Deep dive — Bifacialité & albedo"),
    ("IV", "Deep dive — Sécurité AC vs DC"),
    ("IV", "Deep dive — Autoconsommation"),
    ("IV", "Deep dive — Stockage LFP"),
    ("IV", "Catalogue — Micro-onduleurs Enphase"),
    ("IV", "Catalogue — Batterie domestique"),
    ("IV", "Catalogue — Pilotage Enlighten"),
    ("IV", "Catalogue — Garanties équipements"),
    ("IV", "Catalogue — Artisans RGE isolation"),
    ("IV", "Catalogue — Artisans RGE CVC/PV"),
    ("V", "Les 3 scénarios de rénovation"),
    ("V", "Scénario 1 — Confort (F→D)"),
    ("V", "Scénario 1 — Gains thermiques"),
    ("V", "Scénario 2 — Performance (F→C)"),
    ("V", "Scénario 2 — Gains & financement"),
    ("V", "Scénario 3 — Excellence (F→A) ⭐"),
    ("V", "Scénario 3 — Détail travaux lot par lot"),
    ("V", "Scénario 3 — Gains thermiques & DPE"),
    ("V", "Scénario 3 — Option solaire DualSun"),
    ("V", "Comparatif des 3 scénarios"),
    ("VI", "Profils MaPrimeRénov' 2026"),
    ("VI", "Calcul aides — profil client"),
    ("VI", "CEE & Coup de Pouce 2026"),
    ("VI", "Écrêtement & plafonds Parcours"),
    ("VII", "Plan de financement & scénarios démarrage"),
    ("VII", "Scénario A — Aides maximum"),
    ("VII", "Scénario B — Démarrage rapide"),
    ("VII", "Process FABIEN — montant total"),
    ("VII", "Déblocage 30/40/30 détaillé"),
    ("VII", "Trésorerie zéro apport"),
    ("VII", "Projection 30 ans"),
    ("VII", "Fast-Track démarrage"),
    ("VIII", "Planning S1-S6"),
    ("VIII", "Planning S7-S12 & équipe"),
    ("IX", "Bon pour accord & garanties"),
    ("X", "Annexe A — Barèmes MPR Parcours 2026 (1/3)"),
    ("X", "Annexe A — Barèmes MPR geste par geste (2/3)"),
    ("X", "Annexe A — Seuils revenus IDF / Hors IDF (3/3)"),
    ("X", "Annexe B — CEE & obligés (1/2)"),
    ("X", "Annexe B — Fourchettes CEE par poste (2/2)"),
    ("X", "Annexe C — Éco-PTZ & prêt travaux"),
    ("X", "Annexe D — Artisans RGE réseau ENERGIA"),
    ("X", "Annexe E — Certifications & labels"),
    ("X", "Annexe F — TVA 5,5 % rénovation"),
    ("X", "Annexe G — Ordre optimal des travaux"),
    ("X", "Annexe H — Modèle déblocage 30/40/30"),
    ("X", "Annexe I — Dimensionnements POST-isolation"),
    ("X", "Annexe I — PAC, VMC, PV — formules"),
    ("X", "Annexe I — Malus planning & météo"),
    ("X", "Annexe I — Protections juridiques (12 clauses)"),
    ("X", "Annexe I — Clause Julia Protection Aides"),
    ("X", "Annexe I — ROI & projection 20 ans"),
    ("X", "Annexe I — FAQ rénovation 2026"),
    ("X", "Annexe I — Glossaire technique"),
    ("X", "Annexe I — Checklist réception chantier"),
    ("X", "Annexe I — Schéma déperditions par poste"),
    ("X", "Annexe I — Comparatif aides vs reste à charge"),
    ("X", "Annexe I — Prochaines étapes client"),
    ("XI", "Contacts projet — 5 acteurs"),
    ("XI", "Mentions légales & confidentialité"),
]

assert len(PAGE_PLAN) == TOTAL_PAGES, f"PAGE_PLAN={len(PAGE_PLAN)} ≠ TOTAL_PAGES={TOTAL_PAGES}"


# ─────────────────────────────────────────────────────────────────────────────
# GÉNÉRATEUR DE CONTENU PAR PAGE
# ─────────────────────────────────────────────────────────────────────────────


class AuditPageBuilder:
    def __init__(self, ctx: ClientContext):
        self.ctx = ctx
        self.s = StyleFactory()
        self.c = PDFComponents(ctx, self.s)

    def build_page(self, page_num: int) -> List[Any]:
        section, title = PAGE_PLAN[page_num - 1]
        dispatch: dict[int, Callable[[], List[Any]]] = {
            1: self._page_cover,
            2: self._page_sommaire,
            3: self._page_fiche_client,
            9: self._page_synthese_kpi,
            36: self._page_scenarios_overview,
            41: self._page_scenario3_detail,
            44: self._page_solaire,
            46: self._page_profils_mpr,
            47: self._page_aides_client,
            50: self._page_plan_financement,
            54: self._page_deblocage,
            55: self._page_tresorerie,
            58: self._page_planning_s1,
            60: self._page_bon_accord,
            84: self._page_contacts,
            85: self._page_mentions,
        }
        if page_num in dispatch:
            els = dispatch[page_num]()
        else:
            els = self._page_generic(page_num, section, title)
        if page_num == 1:
            return els
        return self.c.header_block(f"SECTION {section} — {title.upper()}", page_num) + els

    def _page_cover(self) -> List[Any]:
        c = self.ctx
        cover = Table(
            [[Paragraph(f"<b>{ENTREPRISE['nom']}</b>", self.s.cover_sub)],
             [Paragraph("AUDIT ÉNERGÉTIQUE", self.s.cover_title)],
             [Paragraph("RÉNOVATION GLOBALE — EXCELLENCE 2026", self.s.cover_sub)],
             [Spacer(1, 0.8 * cm)],
             [Paragraph(f"<b>{c.nom}</b>", self.s.cover_white)],
             [Paragraph(c.raw.get("adresse", ""), self.s.cover_white)],
             [Spacer(1, 0.5 * cm)],
             [Paragraph(
                 f"Profil MaPrimeRénov' <b>{c.profil}</b> | DPE {c.dpe_actuel} → {c.dpe_cible} | "
                 f"{c.surface} m² | {c.raw.get('type_bien', '')}",
                 self.s.cover_white,
             )],
             [Spacer(1, 0.6 * cm)],
             [Paragraph(
                 f"Budget {format_euro(c.budget)} TTC | Aides {format_euro(c.total_aides)} | "
                 f"Reste {format_euro(c.reste)} | Gain net {format_euro(c.gain_net_mois, True)}/mois",
                 self.s.cover_white,
             )],
             [Spacer(1, 1 * cm)],
             [Paragraph(f"Document généré le {c.date_str} — Confidentiel", self.s.cover_white)],
             [Paragraph(AIDS_DISCLAIMER, ParagraphStyle("d", parent=self.s.cover_white, fontSize=8))],
            ],
            colWidths=[17 * cm],
        )
        cover.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), C["primary"]),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
        ]))
        return [Spacer(1, 2 * cm), cover]

    def _page_sommaire(self) -> List[Any]:
        c = self.ctx
        els: List[Any] = [
            self.c.p("<b>I. Synthèse exécutive</b> — Contexte, chiffres clés, recommandation AMO.", self.s.body),
            self.c.p("<b>II. Fiche client & diagnostic</b> — État des lieux, pisé, déperditions, ponts thermiques.", self.s.body),
            self.c.p("<b>III–IV. Catalogue technique</b> — Spécifications postes, ordre optimal, dimensionnements.", self.s.body),
            self.c.p("<b>V. Scénarios</b> — Confort / Performance / Excellence avec budgets et gains DPE.", self.s.body),
            self.c.p("<b>VI. Aides 2026</b> — MaPrimeRénov', CEE, plafonds (estimation indicative).", self.s.body),
            self.c.p("<b>VII. Financement</b> — Plan FABIEN, Éco-PTZ, 30/40/30, trésorerie zéro apport.", self.s.body),
            self.c.p("<b>VIII. Planning</b> — 12 semaines, malus, équipe 5 acteurs.", self.s.body),
            self.c.p("<b>IX. Bon pour accord</b> — Choix scénario, garanties, signatures.", self.s.body),
            self.c.p("<b>X–XI. Annexes & mentions légales</b> — Barèmes 2026, clauses Julia, contacts.", self.s.body),
            self.c.spacer(0.4),
            self.c.box(
                f"<b>Recommandation AMO :</b> Scénario Excellence — budget {format_euro(c.budget)} TTC — "
                f"objectif DPE <b>{c.dpe_actuel} → {c.dpe_cible}</b>. "
                f"Économies {format_euro(c.raw.get('economies_annuelles', 0))}/an. "
                f"ROI {c.roi:.1f} ans. {ORDRE_TRAVAUX}.",
                "green",
            ),
            self.c.spacer(0.3),
            self.c.aids_box(),
        ]
        return els

    def _page_fiche_client(self) -> List[Any]:
        c = self.ctx
        rows = [
            ["Élément", "Valeur"],
            ["Client", c.nom],
            ["Email", c.raw.get("email_client", "—")],
            ["Adresse", c.raw.get("adresse", "—")],
            ["Type de bien", c.raw.get("type_bien", "—")],
            ["Surface habitable", f"{c.surface} m²"],
            ["Année construction", str(c.raw.get("annee_construction", "—"))],
            ["Zone géographique", c.raw.get("zone_geo", "Hors IDF")],
            ["Région", c.raw.get("region", "—")],
            ["Personnes foyer", str(c.raw.get("personnes", "—"))],
            ["Revenu fiscal (RFR)", format_euro(c.raw.get("revenu_fiscal", 0))],
            ["Profil MaPrimeRénov'", f"{c.profil} (Parcours Accompagné MAR obligatoire)"],
            ["DPE actuel / cible", f"{c.dpe_actuel} → {c.dpe_cible}"],
            ["Facture énergie avant", f"{format_euro(c.facture_avant)}/an"],
            ["Facture après travaux", f"{format_euro(c.facture_apres)}/an"],
            ["Interlocuteur commercial", "DAMIEN — 06 72 68 09 68 — damien.srdconseil@gmail.com"],
        ]
        return [
            self.c.p(f"<b>II. Fiche client — {c.nom}</b>", self.s.h1),
            self.c.table(rows, [5 * cm, 12 * cm], total_row=len(rows) - 1),
            self.c.spacer(0.3),
            self.c.box(
                "<b>⚠️ Règle ANAH :</b> Les travaux ne peuvent démarrer QU'APRÈS validation officielle "
                "du dossier MaPrimeRénov' par l'ANAH (Scénario A) ou selon protocole Fast-Track avec AR de dépôt.",
                "warn",
            ),
            self.c.p(f"<b>Contacts :</b> {CONTACTS}", self.s.body_sm),
        ]

    def _page_synthese_kpi(self) -> List[Any]:
        c = self.ctx
        return [
            self.c.p("<b>Synthèse visuelle — Chiffres clés</b>", self.s.h1),
            self.c.kpi_row([
                ("BUDGET TTC", format_euro(c.budget)),
                ("TOTAL AIDES", format_euro(c.total_aides)),
                ("RESTE À CHARGE", format_euro(c.reste)),
                ("GAIN NET/MOIS", format_euro(c.gain_net_mois, True)),
            ]),
            self.c.spacer(0.3),
            self.c.kpi_row([
                ("DPE", f"{c.dpe_actuel} → {c.dpe_cible}"),
                ("ÉCONOMIES/AN", format_euro(c.raw.get("economies_annuelles", 0))),
                ("FACTURE APRÈS", format_euro(c.facture_apres)),
                ("ROI (ANS)", f"{c.roi:.1f}"),
            ]),
            self.c.spacer(0.3),
            self.c.table([
                ["Indicateur", "Avant", "Après", "Gain"],
                ["Facture énergie/an", format_euro(c.facture_avant), format_euro(c.facture_apres),
                 f"-{pct_reduction(c.facture_avant, c.facture_apres)} %"],
                ["Conso kWhEP/m²/an", str(c.conso_avant), str(c.conso_apres),
                 f"-{pct_reduction(c.conso_avant, c.conso_apres)} %"],
                ["Émissions GES (eq.)", "92 kg CO₂/m²/an", "5 kg CO₂/m²/an", "-94 %"],
            ], [4.5 * cm, 4 * cm, 4 * cm, 4.5 * cm]),
            self.c.spacer(0.2),
            self.c.aids_box(),
        ]

    def _page_scenarios_overview(self) -> List[Any]:
        c = self.ctx
        return [
            self.c.p("<b>V. Les 3 scénarios de rénovation</b>", self.s.h1),
            self.c.p(
                f"Trois niveaux d'ambition — <b>{c.nom}</b>, {c.surface} m², "
                f"{c.raw.get('adresse', '')}. Ordre optimal respecté.",
                self.s.muted,
            ),
            self.c.table([
                ["Scénario", "Objectif DPE", "Budget TTC", "Facture/an", "Recommandation"],
                ["1 — Confort", f"{c.dpe_actuel} → D", format_euro(c.scenario_confort), "5 200 €", "Minimal"],
                ["2 — Performance", f"{c.dpe_actuel} → C", format_euro(c.scenario_perf), "3 100 €", "Intermédiaire"],
                ["3 — Excellence ⭐", f"{c.dpe_actuel} → {c.dpe_cible}", format_euro(c.budget),
                 format_euro(c.facture_apres), "AMO — RETENU"],
            ], [3.2 * cm, 2.8 * cm, 3 * cm, 3 * cm, 5 * cm]),
            self.c.spacer(0.2),
            self.c.table([
                ["Règle", "Application"],
                ["Ordre optimal", ORDRE_TRAVAUX],
                ["Pisé" if c.is_pise else "Bâti", "ITI respirante laine de bois — sans pare-vapeur" if c.is_pise else "Matériaux adaptés au bâti existant"],
                ["Profil ANAH", f"{c.profil} — MAR Léo-Energy obligatoire"],
            ], [4 * cm, 13 * cm]),
            self.c.aids_box(),
        ]

    def _page_scenario3_detail(self) -> List[Any]:
        c = self.ctx
        surf = c.surface
        rows = [
            ["N°", "Lot", "Spécifications", "TTC"],
            ["1", "Combles", f"Laine roche soufflée 40 cm R≥7 — {surf} m²", "4 264 €"],
            ["2", "Plancher", f"PSE 10 cm R≥3 — {surf} m²", "3 500 €"],
            ["3", "ITI pisé", "Laine bois 14 cm — 260 m² — R≥3,7 respirant", "32 000 €"],
            ["4", "Menuiseries", "21 ouvrants PVC Uw≤1,3 + porte", "39 300 €"],
            ["5", "VMC Hygro B", "Post-isolation — centrale + bouches", "2 800 €"],
            ["6", "PAC air/eau", "12 kW post-isolation — COP≥4,5", "14 500 €"],
            ["7", "Ballon thermo", "200 L — COP≥3,5", "2 800 €"],
            ["8", "PV DualSun" if c.pv else "PV (option)", f"{c.puissance_pv:.0f} kWc Enphase — prod. {int(c.production_pv):,} kWh/an".replace(",", " "), "18 000 €" if c.pv else "—"],
            ["9", "Dépose fioul", "Dégazage cuve + certificat", "3 500 €"],
            ["10", "MAR + AMO", "Parcours ANAH + coordination 12 sem.", "3 336 €"],
            ["", "TOTAL", "", format_euro(c.budget)],
        ]
        return [
            self.c.p(f"<b>Scénario 3 — Excellence — {format_euro(c.budget)} TTC</b>", self.s.h1),
            self.c.table(rows, [1 * cm, 2.5 * cm, 9.5 * cm, 4 * cm], total_row=len(rows) - 1),
            self.c.box(
                "<b>🚨 Ordre impératif :</b> Isolation AVANT PAC et VMC. PV en dernier. "
                "PAC dimensionnée POST-isolation (12 kW pour 164 m² pisé isolé).",
                "warn",
            ),
        ]

    def _page_solaire(self) -> List[Any]:
        c = self.ctx
        if not c.pv:
            return [self.c.p("Option photovoltaïque non retenue pour ce dossier.", self.s.body)]
        return [
            self.c.p("<b>Option solaire — Scénario Excellence</b>", self.s.h1),
            self.c.kpi_row([
                ("PUISSANCE", f"{c.puissance_pv:.0f} kWc"),
                ("PRODUCTION/AN", f"{int(c.production_pv):,} kWh".replace(",", " ")),
                ("ÉCONOMIES PV", format_euro(c.raw.get("economies_solaires", 0))),
                ("FACTURE RÉSID.", format_euro(c.facture_res)),
            ]),
            self.c.spacer(0.2),
            self.c.p(
                f"Production région {c.raw.get('region', 'ARA')} : ~1 850 kWh/kWc/an. "
                f"Autoconsommation cible 85–90 % avec pilotage Enlighten + batterie LFP. "
                f"Facture résiduelle <b>{format_euro(c.facture_res)}/an</b> (énergie réseau minimale).",
                self.s.body,
            ),
            self.c.box(
                "Photovoltaïque en <b>dernier poste</b> — après réduction des besoins par isolation et PAC. "
                "Évite le surdimensionnement et maximise l'autoconsommation.",
                "blue",
            ),
        ]

    def _page_profils_mpr(self) -> List[Any]:
        c = self.ctx
        return [
            self.c.p("<b>VI. Profils MaPrimeRénov' 2026 (Hors IDF)</b>", self.s.h1),
            self.c.table([
                ["Profil", "RFR 1 pers.", "Taux Parcours", "Plafond max"],
                ["Bleu", "< 17 363 €", "80 %", "24 000 €"],
                ["Jaune", "< 22 259 €", "60 %", "18 000 €"],
                ["Violet", "< 31 185 €", "45 %", "13 500 €"],
                ["Rose", "> Violet", "10 %", "3 000 €"],
            ], [3 * cm, 4 * cm, 4 * cm, 6 * cm]),
            self.c.spacer(0.2),
            self.c.box(
                f"Profil client retenu : <b>{c.profil}</b> — RFR {format_euro(c.raw.get('revenu_fiscal', 0))} — "
                f"{c.raw.get('personnes', 1)} personne(s). MAR Léo-Energy : 2 000–4 000 € (plafond 2 000 €).",
                "info" if c.profil == "BLEU" else "warn",
            ),
            self.c.aids_box(),
        ]

    def _page_aides_client(self) -> List[Any]:
        c = self.ctx
        rows = [
            ["Aide", "Montant indicatif"],
            [f"MaPrimeRénov' Parcours ({c.profil})", format_euro(c.mpr)],
            ["CEE (fourchette)", format_euro(c.cee)],
            ["TOTAL AIDES ESTIMÉES", format_euro(c.total_aides)],
            ["Reste à charge", format_euro(c.reste)],
        ]
        return [
            self.c.p(f"<b>Calcul aides — {c.nom}</b>", self.s.h1),
            self.c.table(rows, [10 * cm, 7 * cm], total_row=3),
            self.c.spacer(0.2),
            self.c.box(
                "<b>Clause Julia Protection Aides :</b> responsabilité ENERGIA plafonnée à 2 000 € "
                "en cas d'écart &gt; 10 % imputable à une erreur prouvée d'ENERGIA ; 0 % si erreur client ou ANAH/CEE.",
                "legal",
            ),
            self.c.aids_box(),
        ]

    def _page_plan_financement(self) -> List[Any]:
        c = self.ctx
        return [
            self.c.p("<b>PLAN DE FINANCEMENT & SCÉNARIOS DE DÉMARRAGE</b>", self.s.h1),
            self.c.table([
                ["Critère", "Scénario A — Aides Max", "Scénario B — Rapide"],
                ["Délai démarrage", "3 à 6 mois", "3 semaines"],
                ["MaPrimeRénov'", "Oui", "Non"],
                ["Éco-PTZ", "Oui", "Oui"],
                ["Prêt FABIEN", "Oui", "Oui"],
                ["CEE (hors ITE/ITI)", "Oui", "Oui"],
                ["Financement max", "MPR + 125 000 €", "125 000 €"],
                ["Reste à charge", "Minimisé", "Plus élevé"],
                ["Contrainte", "Accord ANAH obligatoire", "Aucune"],
                ["Idéal pour", "BLEU / JAUNE / VIOLET", "ROSE / Pressé"],
            ], [4.5 * cm, 6.25 * cm, 6.25 * cm]),
            self.c.spacer(0.2),
            self.c.box(
                "<b>NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L'ACCORD ÉCRIT DE L'ANAH</b> "
                "(sinon perte définitive et irrémédiable du MPR). — Avis Julia, Mars 2026.",
                "legal",
            ),
            self.c.p(
                f"<b>FABIEN — VIVONS COURTIER — 06 71 19 96 45</b> | Éco-PTZ {format_euro(c.ecoptz)} | "
                f"Prêt travaux jusqu'à 75 000 € | 0 € apport | Acceptation 48–72 h.",
                self.s.body_sm,
            ),
        ]

    def _page_deblocage(self) -> List[Any]:
        c = self.ctx
        return [
            self.c.p("<b>Déblocage progressif 30/40/30</b>", self.s.h1),
            self.c.p("Validation Sylvain LEMBELEMBE obligatoire avant chaque déblocage 40 % et 30 %.", self.s.muted),
            self.c.table([
                ["Échéance", "%", "Montant", "Condition"],
                ["Signature", "30 %", format_euro(c.acompte_30), "Engagement client + dépôt ANAH"],
                ["Mi-chantier", "40 %", format_euro(c.mi_40), "Validation Sylvain LEMBELEMBE (AMO)"],
                ["Réception", "30 %", format_euro(c.reception_30), "PV avec Sylvain + MAR + client"],
                ["TOTAL", "100 %", format_euro(c.budget), "—"],
            ], [3.5 * cm, 1.5 * cm, 4 * cm, 8 * cm], total_row=4),
            self.c.box(
                f"Exemple reste à charge {format_euro(c.reste)} : "
                f"30 % = {format_euro(c.reste * 0.30)} | "
                f"40 % = {format_euro(c.reste * 0.40)} | "
                f"30 % = {format_euro(c.reste * 0.30)}.",
                "info",
            ),
        ]

    def _page_tresorerie(self) -> List[Any]:
        c = self.ctx
        return [
            self.c.p("<b>Trésorerie « Zéro Apport » — Scénario Excellence</b>", self.s.h1),
            self.c.table([
                ["Bloc", "Source", "Montant"],
                ["1", f"Avance ANAH ({'50' if c.profil == 'BLEU' else '30'} % MPR)", format_euro(c.avance_anah)],
                ["2", "Avance Éco-PTZ (30 % prêt)", format_euro(c.avance_ecoptz)],
                ["3", "Acompte prêt FABIEN", format_euro(c.avance_fabien)],
                ["", "TOTAL TRÉSORERIE", format_euro(c.tresorerie)],
            ], [1.5 * cm, 9 * cm, 6.5 * cm], total_row=4),
            self.c.spacer(0.2),
            self.c.box(
                f"Acompte artisans 30 % = {format_euro(c.acompte_30)} → "
                f"{'COUVERT ✅' if c.tresorerie >= c.acompte_30 else 'À compléter'} | "
                f"Excédent sécurité : {format_euro(max(0, c.tresorerie - c.acompte_30), True)}.",
                "green" if c.tresorerie >= c.acompte_30 else "warn",
            ),
            self.c.p(
                "FABIEN finance le <b>montant TOTAL</b> des travaux (jusqu'à 75 000 €). "
                "Client rembourse capital après versement ANAH — mensualités recalculées à la baisse.",
                self.s.body_sm,
            ),
        ]

    def _page_planning_s1(self) -> List[Any]:
        return [
            self.c.p("<b>VIII. Planning prévisionnel — Semaines 1 à 6</b>", self.s.h1),
            self.c.table([
                ["Sem.", "Phase", "Actions", "Resp."],
                ["S1", "Préparation admin.", "Dépôt ANAH, commande matériaux", "MAR + Sylvain"],
                ["S2", "Validation", "Accord ANAH, financement FABIEN, réunion J-7", "Sylvain"],
                ["S3", "Combles", f"Soufflage laine roche 40 cm — {self.ctx.surface} m²", "RGE Isolation"],
                ["S4", "Plancher bas", "PSE 10 cm sous plancher", "RGE Isolation"],
                ["S5", "ITI pisé (1/2)", "Façades Nord + Est — laine bois 14 cm", "2C ENERGIES"],
                ["S6", "ITI pisé (2/2)", "Façades Sud + Ouest — point mi-chantier Sylvain", "2C ENERGIES"],
            ], [1.5 * cm, 3.5 * cm, 9 * cm, 3 * cm]),
            self.c.box(
                "<b>Malus :</b> ITE Nov–Mars +30–50 % | Juil–Août +20–40 % | "
                "Coordination &gt;3 corps métier +15–25 % | Budget sécurisé × 1,10–1,15.",
                "warn",
            ),
        ]

    def _page_bon_accord(self) -> List[Any]:
        c = self.ctx
        return [
            self.c.p("<b>IX. Bon pour accord & garanties</b>", self.s.h1),
            self.c.p(
                f"Je soussigné(e) <b>{c.nom}</b>, reconnais avoir pris connaissance de l'audit "
                f"{c.ref} et des scénarios de rénovation.",
                self.s.body,
            ),
            self.c.box(
                f"☐ Scénario 1 — Confort — {format_euro(c.scenario_confort)} TTC<br/>"
                f"☐ Scénario 2 — Performance — {format_euro(c.scenario_perf)} TTC<br/>"
                f"☐ Scénario 3 — Excellence ⭐ — {format_euro(c.budget)} TTC",
                "warn",
            ),
            self.c.spacer(0.3),
            self.c.p("Fait à _______________, le ___/___/2026", self.s.body),
            self.c.p("Signature client _________________________", self.s.body),
            self.c.p("Sylvain LEMBELEMBE — AMO ENERGIA-CONSEIL IA®", self.s.body),
            self.c.spacer(0.2),
            self.c.aids_box(),
        ]

    def _page_contacts(self) -> List[Any]:
        return [
            self.c.p("<b>XI. Contacts projet — 5 acteurs</b>", self.s.h1),
            self.c.table([
                ["Rôle", "Contact", "Mission"],
                ["AMO / Coordination", "Sylvain LEMBELEMBE — 06 10 59 68 98 — contact@energia-conseil.com",
                 "Pilotage, validation 30/40/30, suivi chantier"],
                ["Commercial", "DAMIEN — 06 72 68 09 68 — damien.srdconseil@gmail.com",
                 "Premier contact, négociation, signature"],
                ["Financement", "FABIEN — VIVONS COURTIER — 06 71 19 96 45",
                 "Éco-PTZ & prêt travaux jusqu'à 75 000 €"],
                ["Juriste", "Julia — via contact@energia-conseil.com",
                 "Avis juridique, Clause Protection Aides"],
                ["MAR", "Léo-Energy (France Rénov')",
                 "Parcours Accompagné, dépôt ANAH"],
            ], [3.5 * cm, 7 * cm, 6.5 * cm]),
        ]

    def _page_mentions(self) -> List[Any]:
        return [
            self.c.p("<b>XI. Mentions légales</b>", self.s.h1),
            self.c.p(
                f"{ENTREPRISE['nom']} — {ENTREPRISE['adresse']} — "
                f"SIRET {ENTREPRISE['siret']} — RCS {ENTREPRISE['rcs']} — SASU Capital 100 €.",
                self.s.body_sm,
            ),
            self.c.p(
                "Document confidentiel — © 2026 ENERGIA-CONSEIL IA® — Tous droits réservés. "
                "Audit à titre consultatif ; montants d'aides indicatifs ; performances sous réserve "
                "de réalisation conforme du scénario retenu et du comportement des occupants.",
                self.s.body_sm,
            ),
            self.c.p(
                "<b>RGPD :</b> Données conservées 5 ans — droits d'accès : contact@energia-conseil.com.",
                self.s.body_sm,
            ),
            self.c.aids_box(),
            self.c.spacer(0.5),
            self.c.p(
                f"<b>{ENTREPRISE['nom']}</b> | {ENTREPRISE['tel']} | {ENTREPRISE['email']} | {ENTREPRISE['web']}",
                self.s.center,
            ),
        ]

    def _catalogue_content(self, page: int) -> List[Any]:
        """Contenu technique catalogue pages 16–35."""
        specs = {
            16: ("Isolation combles perdus", "Laine roche soufflée 400 mm — R≥7 — λ 0,04", f"{self.ctx.surface} m²"),
            17: ("ITI murs pisé", "Laine de bois 140 mm — R≥3,7 — parement BA13 — sans pare-vapeur", "260 m²"),
            18: ("Plancher bas", "PSE 100 mm — R≥3 — sous-face accessible", f"{self.ctx.surface} m²"),
            19: ("Menuiseries PVC", "Double vitrage Uw≤1,3 — Sw≥0,39 — pose dépose", "21 ouvrants"),
            20: ("VMC hygroréglable B", "Débits cuisine 105 m³/h — SdB 30 m³/h — post-isolation", "1 lot"),
            21: ("PAC air/eau", f"12 kW POST-isolation — COP≥4,5 — SCOP≥3,5 — zone H1", "1 lot"),
            22: ("Ballon thermodynamique", "200 L — COP≥3,5 — appoint PAC", "1 u"),
            23: ("Dépose fioul", "Dégazage cuve — évacuation — certificat — fin subvention fioul", "1 lot"),
            24: ("Coordination AMO", "2–3 devis/poste — planning — réception — DPE garanti", "12 semaines"),
            25: ("Photovoltaïque", f"{self.ctx.puissance_pv:.0f} kWc bifacial — Enphase IQ8", f"{int(self.ctx.production_pv):,} kWh/an".replace(",", " ")),
        }
        if page in specs:
            titre, spec, qte = specs[page]
            return [
                self.c.p(f"<b>Catalogue technique — {titre}</b>", self.s.h1),
                self.c.table([
                    ["Paramètre", "Valeur"],
                    ["Désignation", titre],
                    ["Spécifications", spec],
                    ["Quantité", qte],
                    ["Ordre séquence", str((page - 15))],
                    ["Artisan type", "Réseau RGE ENERGIA — sélection Sylvain LEMBELEMBE"],
                ], [4 * cm, 13 * cm]),
                self.c.box(f"Poste {page - 15} dans l'ordre optimal ENERGIA 2026. {ORDRE_TRAVAUX}.", "info"),
            ]
        deep_dives = {
            26: "Bifacialité & albedo — gain +5–25 % vs monofacial — toiture claire recommandée.",
            27: "Sécurité AC vs DC — micro-onduleurs Enphase — coupure automatique par module.",
            28: "Pilotage Enlighten — autoconsommation 85–90 % — charges décalées.",
            29: "Chimie LFP vs NMC — durée vie 6000 cycles — sécurité thermique supérieure.",
            30: "Micro-onduleurs Enphase IQ8 — garantie 25 ans — monitoring temps réel.",
            31: "Batterie domestique 5–10 kWh — arbitrage autoconsommation / revente.",
            32: "Application Enlighten — courbes prod/consommation — alertes panne.",
            33: "Garanties — décennale RGE — constructeur PAC 5–7 ans — PV 25 ans linear.",
            34: "Artisans isolation — 2C ENERGIES RGE E-E210966 — mise en concurrence 2–3 devis.",
            35: "Artisans CVC/PV — ECO SYSTÈME DURABLE — Rhône Génie Clim — réseau partenaires.",
        }
        if page in deep_dives:
            return [
                self.c.p(f"<b>Catalogue — {PAGE_PLAN[page - 1][1]}</b>", self.s.h1),
                self.c.p(deep_dives[page], self.s.body),
                self.c.p(
                    "Validation technique AMO Sylvain LEMBELEMBE avant commande. "
                    "Photos avant/après obligatoires — anti-margoulins ENERGIA.",
                    self.s.body_sm,
                ),
            ]
        return []

    def _annexe_content(self, page: int) -> List[Any]:
        """Annexes X — pages 61–83."""
        if page == 61:
            return [
                self.c.p("<b>Annexe A — MaPrimeRénov' Parcours 2026</b>", self.s.h1),
                self.c.table([
                    ["Profil", "Taux", "Plafond 2 classes", "Plafond 3+ classes"],
                    ["Bleu", "80 %", "24 000 €", "32 000 €"],
                    ["Jaune", "60 %", "18 000 €", "24 000 €"],
                    ["Violet", "45 %", "13 500 €", "18 000 €"],
                    ["Rose", "10 %", "3 000 €", "4 000 €"],
                ], [3 * cm, 2.5 * cm, 5.75 * cm, 5.75 * cm]),
                self.c.aids_box(),
            ]
        if page == 62:
            return [
                self.c.p("<b>Annexe A — Geste par geste (€/unité)</b>", self.s.h1),
                self.c.table([
                    ["Geste", "Bleu", "Jaune", "Violet", "Rose"],
                    ["Combles €/m²", "25", "20", "15", "0"],
                    ["ITI €/m²", "25", "20", "15", "7"],
                    ["ITE €/m²", "75", "60", "40", "15"],
                    ["PAC air-eau", "5 000", "4 000", "3 000", "0"],
                    ["VMC DF", "4 000", "3 000", "2 000", "0"],
                ], [3.5 * cm, 3.4 * cm, 3.4 * cm, 3.4 * cm, 3.3 * cm]),
            ]
        if page == 63:
            return [
                self.c.p("<b>Annexe A — Seuils revenus 2026</b>", self.s.h1),
                self.c.table([
                    ["Parts", "Bleu HD", "Jaune HD", "Violet HD"],
                    ["1", "17 363 €", "22 259 €", "31 185 €"],
                    ["2", "25 393 €", "32 553 €", "45 842 €"],
                    ["3", "30 540 €", "39 148 €", "55 196 €"],
                ], [3 * cm, 4.5 * cm, 4.5 * cm, 5 * cm]),
                self.c.p("Écrêtement TTC : Bleu 100 % | Jaune/Violet 80 % | Rose 50 %.", self.s.muted),
            ]
        if page in (64, 65):
            topics = {
                64: ("CEE — principes 2026", "Classiques −30 à −40 % — variation obligés 20–40 %."),
                65: ("CEE par poste", "Isolation 10–25 €/m² | PAC 2 500–4 000 € | VMC 400–600 € | Coup de pouce 4 700–5 800 €."),
            }
            t, d = topics[page]
            return [self.c.p(f"<b>Annexe B — {t}</b>", self.s.h1), self.c.p(d, self.s.body), self.c.aids_box()]
        if page == 66:
            return [
                self.c.p("<b>Annexe C — Éco-PTZ & prêt travaux</b>", self.s.h1),
                self.c.table([
                    ["Type", "Montant max", "Durée", "Taux"],
                    ["1 action", "15 000 €", "15 ans", "0 %"],
                    ["2 actions", "25 000 €", "15 ans", "0 %"],
                    ["Rénovation globale", "50 000 €", "20 ans", "0 %"],
                    ["Prêt FABIEN", "75 000 €", "10–20 ans", "Négocié"],
                ], [4 * cm, 4 * cm, 4 * cm, 5 * cm]),
                self.c.p("Courtier : FABIEN — 06 71 19 96 45 — Acceptation 48–72 h.", self.s.body_sm),
            ]
        if page == 67:
            return [
                self.c.p("<b>Annexe D — Artisans RGE partenaires</b>", self.s.h1),
                self.c.table([
                    ["Poste", "Entreprise", "Certification", "Contact"],
                    ["ITI / ITE", "2C ENERGIES", "RGE E-E210966", "09 72 57 47 47"],
                    ["PAC / Ballon", "ECO SYSTÈME DURABLE", "QualiPAC", "01 70 93 97 15"],
                    ["VMC", "Réseau partenaires", "Qualification VMC", "Sélection Sylvain"],
                    ["Menuiseries", "Réseau partenaires", "RGE Fenêtres", "2–3 devis/poste"],
                ], [2.5 * cm, 4.5 * cm, 4 * cm, 6 * cm]),
            ]
        if page == 68:
            return [
                self.c.p("<b>Annexe E — Certifications</b>", self.s.h1),
                self.c.p(
                    "ACERMI / CEKAL isolation — NF PAC — CSTBat — RGE obligatoire pour aides 2026. "
                    "Marque France Rénov' pour MAR. Audit ENERGIA conforme barèmes ANAH 2026.",
                    self.s.body,
                ),
            ]
        if page == 69:
            return [self.c.p("<b>Annexe F — TVA 5,5 %</b>", self.s.h1),
                    self.c.p("Travaux de rénovation énergétique sur logement &gt; 2 ans — résidence principale — artisans RGE.", self.s.body)]
        if page == 70:
            return [self.c.p("<b>Annexe G — Ordre optimal</b>", self.s.h1),
                    self.c.box(f"<b>Ordre impératif :</b> {ORDRE_TRAVAUX}", "warn")]
        if page == 71:
            c = self.ctx
            return [
                self.c.p("<b>Annexe H — Déblocage 30/40/30</b>", self.s.h1),
                self.c.p(
                    f"30 % signature {format_euro(c.acompte_30)} — "
                    f"40 % mi-chantier {format_euro(c.mi_40)} (validation Sylvain) — "
                    f"30 % réception {format_euro(c.reception_30)}.",
                    self.s.body,
                ),
            ]
        if page in (72, 73):
            return [
                self.c.p(f"<b>Annexe I — Dimensionnements ({'PAC/VMC' if page == 73 else 'Isolation'})</b>", self.s.h1),
                self.c.p(
                    f"PAC POST-isolation : {self.ctx.surface} m² × 0,04–0,05 kW/m² × 1,15 ≈ 8–12 kW retenu 12 kW. "
                    f"VMC DF : cuisine 105 m³/h — 3 chambres × 15 m³/h. "
                    f"PV : {self.ctx.puissance_pv:.0f} kWc — prod. {int(self.ctx.production_pv):,} kWh/an ARA.".replace(",", " "),
                    self.s.body,
                ),
            ]
        if page == 74:
            return [self.c.p("<b>Annexe I — Malus planning</b>", self.s.h1),
                    self.c.p("ITE Nov–Mars +30–50 % | PV hiver +20 % | Juil–Août +20–40 % | Imprévus +10–15 %.", self.s.body)]
        if page == 75:
            clauses = [
                "Planning artisans (pénalités retard)",
                "Chantier propre obligatoire",
                "Réserve de propriété",
                "Pénalités retard paiement",
                "Assurance DO recommandée &gt; 80 k€",
                "Révision prix (&gt; 60 j — indice BT01)",
            ]
            return [self.c.p("<b>Protections juridiques (extrait)</b>", self.s.h1)] + [
                self.c.p(f"• {cl}", self.s.body_sm) for cl in clauses
            ]
        if page == 76:
            return [self.c.p("<b>Clause Julia Protection Aides</b>", self.s.h1),
                    self.c.box("Plafond responsabilité ENERGIA : 2 000 € par projet si erreur prouvée et écart &gt; 10 %.", "legal")]
        if page == 77:
            c = self.ctx
            eco = float(c.raw.get("economies_annuelles", 0))
            return [
                self.c.p("<b>ROI & projection 20 ans</b>", self.s.h1),
                self.c.p(f"ROI = {format_euro(c.reste)} / {format_euro(eco)}/an = <b>{c.roi:.1f} ans</b>.", self.s.body),
                self.c.p(f"Gain net 20 ans (post-prêt) ≈ {format_euro(eco * 20 - c.reste, True)} hors plus-value immobilière.", self.s.body),
            ]
        if page == 78:
            faqs = [
                ("Quand démarrer les travaux ?", "Après accord ANAH (Scénario A) ou AR dépôt (Fast-Track)."),
                ("ITI seule éligible MPR ?", "Non — ITI en geste isolé exclu MPR 2026 — Parcours global requis."),
                ("PAC avant isolation ?", "Interdit — surcoût 4 000–6 000 € — dimensionnement post-isolation."),
            ]
            return [self.c.p("<b>FAQ rénovation 2026</b>", self.s.h1)] + [
                self.c.p(f"<b>Q :</b> {q}<br/><b>R :</b> {a}", self.s.body_sm) for q, a in faqs
            ]
        if page == 79:
            return [
                self.c.p("<b>Glossaire</b>", self.s.h1),
                self.c.p("<b>DPE</b> — Diagnostic Performance Énergétique | <b>MPR</b> — MaPrimeRénov' | "
                         "<b>CEE</b> — Certificats Économie Énergie | <b>MAR</b> — Mon Accompagnateur Rénov' | "
                         "<b>ITI/ITE</b> — Isolation thermique intérieure/extérieure | <b>COP</b> — Coefficient performance.", self.s.body_sm),
            ]
        if page == 80:
            return [
                self.c.p("<b>Checklist réception chantier</b>", self.s.h1),
                self.c.p(
                    "☐ Photos avant/après par poste · ☐ PV contradictoire signé · "
                    "☐ Ordre travaux respecté · ☐ DPE post-travaux commandé · "
                    "☐ Dossier paiement ANAH MAR · ☐ Validation Sylvain mi-chantier et réception.",
                    self.s.body,
                ),
            ]
        if page == 81:
            c = self.ctx
            return [
                self.c.p("<b>Schéma déperditions par poste</b>", self.s.h1),
                self.c.table([
                    ["Poste", "Part déperditions", "Priorité"],
                    ["Combles", "25–30 %", "1 — Combles"],
                    ["Murs", "20–25 %", "2 — ITI pisé"],
                    ["Fenêtres", "10–15 %", "4 — Menuiseries"],
                    ["Plancher", "7–10 %", "3 — Plancher"],
                    ["Ventilation", "15–20 %", "5 — VMC"],
                ], [4 * cm, 4 * cm, 9 * cm]),
                self.c.p(f"Surface {c.surface} m² — ordre optimal ENERGIA appliqué au scénario Excellence.", self.s.muted),
            ]
        if page == 82:
            c = self.ctx
            return [
                self.c.p("<b>Comparatif aides vs reste à charge</b>", self.s.h1),
                self.c.table([
                    ["Scénario", "Budget TTC", "Aides indic.", "Reste"],
                    ["Confort", format_euro(c.scenario_confort), "21 200 €", format_euro(c.scenario_confort - 21200)],
                    ["Performance", format_euro(c.scenario_perf), format_euro(c.total_aides), format_euro(c.scenario_perf - c.total_aides)],
                    ["Excellence ⭐", format_euro(c.budget), format_euro(c.total_aides), format_euro(c.reste)],
                ], [3.5 * cm, 4 * cm, 4 * cm, 5.5 * cm]),
                self.c.aids_box(),
            ]
        if page == 83:
            return [
                self.c.p("<b>Prochaines étapes client</b>", self.s.h1),
                self.c.p("1. Choix scénario avec DAMIEN · 2. Dépôt dossier MAR Léo-Energy · "
                         "3. Montage financement FABIEN · 4. Validation ANAH · "
                         "5. Signature devis RGE · 6. Démarrage travaux S3 · 7. Réception S12.", self.s.body),
                self.c.p(f"<b>Contacts :</b> {CONTACTS}", self.s.body_sm),
            ]
        return []

    def _page_generic(self, page: int, section: str, title: str) -> List[Any]:
        c = self.ctx
        if 16 <= page <= 35:
            content = self._catalogue_content(page)
            if content:
                return content
        if 61 <= page <= 83:
            content = self._annexe_content(page)
            if content:
                return content

        # Pages thématiques génériques (ponts thermiques, carbone, façades, scénarios, financement…)
        thematic: dict[str, List[Any]] = {
            "II.BIS": [
                self.c.p(f"<b>{title}</b>", self.s.h1),
                self.c.p(
                    f"Analyse des ponts thermiques — {c.nom} — bâti "
                    f"{'pisé (U≈1,45 W/m².K)' if c.is_pise else 'ancien'} — {c.surface} m².",
                    self.s.body,
                ),
                self.c.table([
                    ["Zone", "Risque", "Traitement"],
                    ["Linteaux", "Ponts thermiques majeurs", "Calfeutrage + ITI continue"],
                    ["Plancher/murs", "Déperditions 7–10 %", "Isolation plancher + ITI"],
                    ["Menuiseries", "10–15 % déperditions", "Uw≤1,3 post-isolation murs"],
                ], [4 * cm, 5 * cm, 8 * cm]),
                self.c.box("ITI pisé : matériaux perspirants — laine de bois — sans pare-vapeur.", "warn") if c.is_pise else Spacer(1, 1),
            ],
            "II.TER": [
                self.c.p(f"<b>{title}</b>", self.s.h1),
                self.c.p(
                    f"Empreinte carbone avant rénovation : ~92 kg CO₂/m²/an — "
                    f"Après scénario Excellence : ~5 kg CO₂/m²/an (−94 %). "
                    f"Chauffage fioul → PAC + PV = décarbonation massive.",
                    self.s.body,
                ),
                self.c.kpi_row([
                    ("AVANT", "92 kg/m²"),
                    ("APRÈS", "5 kg/m²"),
                    ("RÉDUCTION", "-94 %"),
                    ("FEED-IN", f"{int(c.production_pv):,} kWh".replace(",", " ") if c.pv else "N/A"),
                ]),
            ],
            "II.QUATER": [
                self.c.p(f"<b>{title}</b>", self.s.h1),
                self.c.p(
                    "Zone H1 — Analyse par orientation — priorités ITI et apports solaires passifs / PV.",
                    self.s.muted,
                ),
                self.c.table([
                    ["Façade", "Exposition", "Priorité travaux", "Remarque"],
                    ["Nord", "Faible ensoleillement", "ITI prioritaire", "Ponts thermiques"],
                    ["Sud", "Apports solaires", "ITI + protections solaires", "Potentiel PV"],
                    ["Est/Ouest", "Intermédiaire", "ITI + menuiseries", "Équilibrage déperditions"],
                ], [2.5 * cm, 4 * cm, 5 * cm, 5.5 * cm]),
            ],
            "II": [
                self.c.p(f"<b>{title}</b>", self.s.h1),
                self.c.table([
                    ["Poste", "État actuel", "Action recommandée"],
                    ["Combles", "Isolation insuffisante R≈1,2", "Soufflage 40 cm R≥7"],
                    ["Murs", "Pisé nu" if c.is_pise else "Non isolés", "ITI laine bois R≥3,7"],
                    ["Plancher", "Non isolé", "PSE 10 cm R≥3"],
                    ["Menuiseries", "Simple vitrage partiel", "21 ouvrants PVC Uw≤1,3"],
                    ["Chauffage", "Fioul ancien", "PAC 12 kW post-isolation"],
                    ["Ventilation", "Naturelle", "VMC hygroréglable B"],
                ], [3.5 * cm, 5.5 * cm, 8 * cm]),
            ],
            "V": [
                self.c.p(f"<b>{title}</b>", self.s.h1),
                self.c.p(f"Comparatif scénarios — budget retenu Excellence {format_euro(c.budget)}.", self.s.muted),
                self.c.table([
                    ["Critère", "S1 Confort", "S2 Perf.", "S3 Excellence"],
                    ["Budget", format_euro(c.scenario_confort), format_euro(c.scenario_perf), format_euro(c.budget)],
                    ["DPE", f"{c.dpe_actuel}→D", f"{c.dpe_actuel}→C", f"{c.dpe_actuel}→{c.dpe_cible}"],
                    ["Facture/an", "5 200 €", "3 100 €", format_euro(c.facture_apres)],
                ], [4 * cm, 4.3 * cm, 4.3 * cm, 4.4 * cm]),
                self.c.aids_box(),
            ],
            "VI": [
                self.c.p(f"<b>{title}</b>", self.s.h1),
                self.c.p("Barèmes ANAH 2026 — estimation indicative — instruction MAR Léo-Energy.", self.s.muted),
                self.c.aids_box(),
            ],
            "VII": [
                self.c.p(f"<b>{title}</b>", self.s.h1),
                self.c.p(
                    f"Financement total {format_euro(c.budget)} — Éco-PTZ {format_euro(c.ecoptz)} — "
                    f"Mensualité ~{format_euro(c.mensualite)}/mois — Économies ~{format_euro(c.eco_mois)}/mois — "
                    f"Gain net {format_euro(c.gain_net_mois, True)}/mois.",
                    self.s.body,
                ),
                self.c.box(
                    "NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L'ACCORD ÉCRIT DE L'ANAH (Scénario A).",
                    "legal",
                ),
            ],
            "VIII": [
                self.c.p(f"<b>{title}</b>", self.s.h1),
                self.c.table([
                    ["Sem.", "Phase", "Actions"],
                    ["S7-S8", "Menuiseries", "21 ouvrants PVC — pose RGE"],
                    ["S9", "VMC", "Mise en service hygroréglable"],
                    ["S10", "PAC + Ballon", "Mise en service — réglages"],
                    ["S11", "PV" if c.pv else "Finitions", "DualSun 6 kWc" if c.pv else "Reprises peinture"],
                    ["S12", "Réception", "PV signé — DPE post-travaux — solde MAR"],
                ], [2 * cm, 4 * cm, 11 * cm]),
            ],
        }
        base = thematic.get(section.split(".")[0], thematic.get(section))
        if base:
            return base
        return [
            self.c.p(f"<b>{title}</b>", self.s.h1),
            self.c.p(
                f"Audit énergétique {c.ref} — {c.nom} — {c.raw.get('adresse', '')} — "
                f"Section {section} — page {page}/{TOTAL_PAGES}.",
                self.s.body,
            ),
            self.c.aids_box(),
        ]


# ─────────────────────────────────────────────────────────────────────────────
# ASSEMBLAGE PDF
# ─────────────────────────────────────────────────────────────────────────────


class AuditPDFGenerator:
    def __init__(self, client: dict[str, Any]):
        self.ctx = ClientContext(client)
        self.builder = AuditPageBuilder(self.ctx)
        self._page_counter = 0

    def _on_page(self, canvas, doc):
        self._page_counter += 1
        page = self._page_counter
        canvas.saveState()
        w, h = A4
        if page == 1:
            canvas.setFillColor(C["primary"])
            canvas.rect(0, 0, w, h, fill=1, stroke=0)
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(C["muted"])
        footer = (
            f"{ENTREPRISE['nom']} | SIRET {ENTREPRISE['siret']} | "
            f"Décennale {ENTREPRISE['decennale']} | Page {page}/{TOTAL_PAGES}"
        )
        canvas.drawCentredString(w / 2, 12 * mm, footer)
        if page > 1:
            canvas.setFont("Helvetica", 7)
            canvas.drawString(20 * mm, h - 12 * mm, ENTREPRISE["nom"])
        canvas.restoreState()

    def build_story(self) -> List[Any]:
        story: List[Any] = []
        for page_num in range(1, TOTAL_PAGES + 1):
            story.extend(self.builder.build_page(page_num))
            if page_num < TOTAL_PAGES:
                story.append(PageBreak())
        return story

    def generate(self, output_path: Path) -> Path:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        doc = SimpleDocTemplate(
            str(output_path),
            pagesize=A4,
            leftMargin=20 * mm,
            rightMargin=20 * mm,
            topMargin=22 * mm,
            bottomMargin=18 * mm,
            title=f"Audit Énergétique — {self.ctx.nom}",
            author=ENTREPRISE["nom"],
        )
        self._page_counter = 0
        story = self.build_story()
        doc.build(story, onFirstPage=self._on_page, onLaterPages=self._on_page)
        return output_path


def generate_audit_auto(
    client_data: Optional[dict[str, Any]] = None,
    output_path: Optional[Path] = None,
) -> Path:
    """Génère le PDF d'audit (85 pages) et retourne le chemin du fichier créé."""
    data = client_data or CLIENT_DEFAULT
    out = output_path or default_output_path(data)
    return AuditPDFGenerator(data).generate(out)


# ─────────────────────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────────────────────


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Génère un audit énergétique PDF personnalisé (85 pages) — ENERGIA-CONSEIL IA®",
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=None,
        help="Chemin du PDF de sortie (défaut : output/Audit_<CLIENT>_2026.pdf)",
    )
    parser.add_argument(
        "--verify-pages",
        action="store_true",
        help="Vérifie que le PDF généré contient exactement 85 pages",
    )
    return parser.parse_args(argv)


def default_output_path(client: dict[str, Any]) -> Path:
    slug = slug_client(client.get("nom", "CLIENT"))
    root = Path(__file__).resolve().parent.parent
    return root / "output" / f"Audit_Energetique_{slug}_2026.pdf"


def verify_page_count(pdf_path: Path, expected: int = TOTAL_PAGES) -> int:
    try:
        from pypdf import PdfReader
    except ImportError:
        try:
            from PyPDF2 import PdfReader  # type: ignore
        except ImportError:
            print("⚠️  Installez pypdf pour la vérification : pip install pypdf")
            return -1
    else:
        PdfReader = PdfReader  # noqa: F811

    reader = PdfReader(str(pdf_path))
    count = len(reader.pages)
    if count != expected:
        raise RuntimeError(f"PDF page count mismatch: {count} != {expected}")
    return count


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    out = args.output or default_output_path(client)

    print("⚡ ENERGIA-CONSEIL IA® — Génération audit PDF")
    print(f"   Client : {client['nom']}")
    print(f"   Sortie : {out}")

    pdf_path = generate_audit_auto(client, out)

    print(f"✅ PDF généré : {pdf_path}")
    print(f"   Pages prévues : {TOTAL_PAGES}")

    if args.verify_pages:
        n = verify_page_count(pdf_path)
        if n == TOTAL_PAGES:
            print(f"✅ Vérification OK — {n} pages")

    return 0


if __name__ == "__main__":
    sys.exit(main())
