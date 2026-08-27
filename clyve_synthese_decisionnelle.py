#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Synthèse décisionnelle CLIENT — 8 à 12 pages.
Complément court du dossier technique Clyve Andriot.
Données sources : mêmes constantes que generate_rapport_clyve.py.
"""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, List, Optional, Sequence

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.pdfgen import canvas as canvas_mod
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# Réutilise identité / données du générateur principal
from generate_rapport_clyve import (
    CLIENT,
    CONTENT_WIDTH,
    DEVIS,
    EMAIL_OFFICIEL,
    FIL,
    FONT_BODY,
    FONT_TITLE,
    MARQUE,
    MARQUE_LICENCE,
    C as CT,
)


# Charte synthèse (jaune léger pour mise en avant)
YELLOW = colors.HexColor("#FEF3C7")
YELLOW_BD = colors.HexColor("#F59E0B")
TEAL = CT["teal"]
NIGHT = CT["night"]
GREEN = CT["green"]
GRAY = CT["gray"]
WHITE = colors.white
MUTED = CT["muted"]

W = CONTENT_WIDTH


def _styles() -> dict:
    base = getSampleStyleSheet()
    s = {}
    s["h1"] = ParagraphStyle(
        "sy_h1", parent=base["Heading1"], fontName=FONT_TITLE,
        fontSize=18, textColor=TEAL, spaceBefore=2, spaceAfter=10, leading=22,
        alignment=TA_CENTER,
    )
    s["h2"] = ParagraphStyle(
        "sy_h2", parent=base["Heading2"], fontName=FONT_TITLE,
        fontSize=13, textColor=NIGHT, spaceBefore=8, spaceAfter=6, leading=16,
    )
    s["body"] = ParagraphStyle(
        "sy_body", parent=base["Normal"], fontName=FONT_BODY,
        fontSize=10, textColor=NIGHT, alignment=TA_JUSTIFY, leading=14, spaceAfter=5,
    )
    s["body_c"] = ParagraphStyle("sy_bc", parent=s["body"], alignment=TA_CENTER)
    s["sm"] = ParagraphStyle(
        "sy_sm", parent=s["body"], fontSize=8.8, leading=12, spaceAfter=3,
    )
    s["cover_t"] = ParagraphStyle(
        "sy_ct", parent=base["Title"], fontName=FONT_TITLE,
        fontSize=20, textColor=NIGHT, alignment=TA_CENTER, leading=26, spaceAfter=6,
    )
    s["cover_s"] = ParagraphStyle(
        "sy_cs", parent=base["Title"], fontName=FONT_TITLE,
        fontSize=12, textColor=TEAL, alignment=TA_CENTER, leading=16, spaceAfter=4,
    )
    return s


S = _styles()


def sp(h: float = 0.3) -> Spacer:
    return Spacer(1, h * cm)


def p(text: str, style: Optional[ParagraphStyle] = None) -> Paragraph:
    return Paragraph(text, style or S["body"])


def bullets(items: Sequence[str]) -> ListFlowable:
    return ListFlowable(
        [ListItem(Paragraph(it, S["sm"]), leftIndent=4) for it in items],
        bulletType="bullet", bulletColor=TEAL, leftIndent=12, bulletFontSize=8,
    )


class SummaryCanvas(canvas_mod.Canvas):
    """Pied de page synthèse décisionnelle."""

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
            self._draw(i + 1, total)
            super().showPage()
        super().save()

    def _draw(self, page: int, total: int):
        w, h = A4
        self.saveState()
        if page == 1:
            # Bandeau couverture
            self.setFillColor(TEAL)
            self.rect(0, h - 26 * mm, w, 26 * mm, fill=1, stroke=0)
            self.setFillColor(WHITE)
            self.setFont(FONT_TITLE, 12)
            self.drawCentredString(w / 2, h - 11 * mm, MARQUE)
            self.setFont(FONT_BODY, 8.5)
            self.drawCentredString(w / 2, h - 17 * mm, "Rénovation énergétique intelligente")
            self.restoreState()
            return
        self.setFont(FONT_TITLE, 8)
        self.setFillColor(TEAL)
        self.drawString(18 * mm, h - 12 * mm, MARQUE)
        self.setStrokeColor(TEAL)
        self.setLineWidth(1)
        self.line(18 * mm, h - 14 * mm, w - 18 * mm, h - 14 * mm)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(18 * mm, 14 * mm, w - 18 * mm, 14 * mm)
        self.setFont(FONT_BODY, 7)
        self.setFillColor(MUTED)
        self.drawString(18 * mm, 9 * mm, f"Synthèse décisionnelle — {MARQUE}")
        self.setFillColor(TEAL)
        self.setFont(FONT_BODY, 8)
        self.drawRightString(w - 18 * mm, 9 * mm, f"{page} / {total}")
        self.restoreState()


def _card(title: str, body: str, accent: Any = None) -> Table:
    accent = accent or TEAL
    head = Paragraph(
        f"<font color='white'><b>{title}</b></font>",
        ParagraphStyle("ch", parent=S["sm"], fontName=FONT_TITLE, fontSize=9.5,
                       textColor=WHITE, alignment=TA_CENTER),
    )
    head_t = Table([[head]], colWidths=[W])
    head_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), accent),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    body_p = Paragraph(body, S["sm"])
    body_t = Table([[body_p]], colWidths=[W])
    body_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.8, accent),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    wrap = Table([[head_t], [body_t]], colWidths=[W])
    wrap.setStyle(TableStyle([
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return wrap


def _kpi_grid(items: Sequence[tuple]) -> Table:
    """Cartes 2×n : (label, valeur)."""
    cells = []
    row = []
    for i, (lab, val) in enumerate(items):
        cell = Paragraph(
            f'<para align="center"><font size="7.5" color="#334155">{lab}</font><br/>'
            f'<b><font size="10" color="#0F172A">{val}</font></b></para>',
            S["body_c"],
        )
        box = Table([[cell]], colWidths=[(W - 0.3 * cm) / 2])
        box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CT["info_bg"]),
            ("BOX", (0, 0), (-1, -1), 0.6, TEAL),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ]))
        row.append(box)
        if len(row) == 2:
            cells.append(row)
            row = []
    if row:
        while len(row) < 2:
            row.append("")
        cells.append(row)
    t = Table(cells, colWidths=[(W - 0.3 * cm) / 2, (W - 0.3 * cm) / 2])
    t.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 2),
        ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return t


def _prio_block(num: str, titre: str, probleme: str, action: str,
                pourquoi: str, verifier: str) -> Table:
    head = Paragraph(
        f"<font color='white'><b>{num}. {titre}</b></font>",
        ParagraphStyle("ph", parent=S["sm"], fontName=FONT_TITLE, fontSize=10,
                       textColor=WHITE),
    )
    head_t = Table([[head]], colWidths=[W])
    head_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TEAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    body = Paragraph(
        f"<b>Problème constaté :</b> {probleme}<br/>"
        f"<b>Action recommandée :</b> {action}<br/>"
        f"<b>Pourquoi c'est prioritaire :</b> {pourquoi}<br/>"
        f"<b>À vérifier avant devis :</b> {verifier}",
        S["sm"],
    )
    body_t = Table([[body]], colWidths=[W])
    body_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 0.7, TEAL),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    wrap = Table([[head_t], [body_t]], colWidths=[W])
    wrap.setStyle(TableStyle([
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]))
    return wrap


def _scenario_page(
    num: str,
    nom: str,
    objectif: str,
    travaux: Sequence[str],
    budget_bas: str,
    budget_haut: str,
    aides: str,
    resultat: str,
    profil_ou_pourquoi: str,
    label_profil: str,
    recommended: bool = False,
) -> List[Any]:
    st: List[Any] = []
    badge = "  ·  RECOMMANDÉ" if recommended else ""
    title_bg = YELLOW_BD if recommended else TEAL
    title = Paragraph(
        f"<font color='white'><b>SCÉNARIO {num} — {nom}{badge}</b></font>",
        ParagraphStyle("sc_t", parent=S["sm"], fontName=FONT_TITLE, fontSize=12,
                       textColor=WHITE, alignment=TA_CENTER),
    )
    title_t = Table([[title]], colWidths=[W])
    title_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), title_bg),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    st.append(title_t)
    st.append(sp(0.25))
    if recommended:
        st.append(Paragraph(
            '<para align="center"><b><font color="#0F766E">'
            "Scénario mis en avant pour votre longère"
            "</font></b></para>",
            S["body_c"],
        ))
        st.append(sp(0.15))

    st.append(p(f"<b>Objectif :</b> {objectif}"))
    st.append(sp(0.1))
    st.append(Paragraph("<b>Travaux inclus (estimation d'orientation)</b>", S["h2"]))
    st.append(bullets(list(travaux)))
    st.append(sp(0.15))

    budget_box = Paragraph(
        f"<b>Budget estimatif (fourchette indicative)</b><br/>"
        f"Fourchette basse : <b>{budget_bas}</b><br/>"
        f"Fourchette haute : <b>{budget_haut}</b><br/>"
        f"<i>Estimations à confirmer sur devis — aucun prix fixe garanti.</i>",
        S["sm"],
    )
    bg = YELLOW if recommended else CT["info_bg"]
    bd = YELLOW_BD if recommended else TEAL
    bt = Table([[budget_box]], colWidths=[W])
    bt.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), bg),
        ("BOX", (0, 0), (-1, -1), 1.2, bd),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    st.append(bt)
    st.append(sp(0.2))
    st.append(p(
        f"<b>Aides potentielles à vérifier :</b> {aides} "
        "(sous réserve d'éligibilité et des règles en vigueur)."
    ))
    st.append(p(f"<b>Résultat attendu (formulation prudente) :</b> {resultat}"))
    st.append(p(f"<b>{label_profil} :</b> {profil_ou_pourquoi}"))
    st.append(sp(0.2))
    st.append(Paragraph(
        "<i>Étude d'orientation — montants et performances à confirmer par "
        "devis et visite technique.</i>",
        ParagraphStyle("disc", parent=S["sm"], textColor=MUTED, alignment=TA_CENTER),
    ))
    return st


def build_decision_summary_story() -> List[Any]:
    """11 pages max — synthèse décisionnelle client."""
    st: List[Any] = []
    date_str = datetime.now().strftime("%d/%m/%Y")

    # ── PAGE 1 — Couverture ──────────────────────────────────────────────
    st.append(sp(1.0))
    st.append(Paragraph("Votre feuille de route<br/>de rénovation énergétique", S["cover_t"]))
    st.append(Paragraph("Synthèse décisionnelle personnalisée", S["cover_s"]))
    st.append(sp(0.45))
    st.append(Paragraph(f"<b>{CLIENT['nom']}</b>", S["cover_s"]))
    st.append(Paragraph(
        "Longère en pisé — 220 m² — La Genête (71)",
        S["body_c"],
    ))
    st.append(Paragraph(f"Date du rapport : {date_str}", S["body_c"]))
    st.append(sp(0.5))
    disc = Paragraph(
        '<para align="center"><font color="#FFFFFF" size="9">'
        "Document d'orientation. Les travaux, prix, aides, performances et "
        "financements doivent être confirmés par les professionnels et "
        "organismes compétents."
        "</font></para>",
        S["body_c"],
    )
    disc_t = Table([[disc]], colWidths=[W])
    disc_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), NIGHT),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    st.append(disc_t)
    st.append(sp(0.6))
    st.append(Paragraph(
        f"<b>{MARQUE}</b><br/>Étude d'orientation — synthèse décisionnelle<br/>"
        f"<font size='8'><i>{MARQUE_LICENCE}</i></font>",
        S["body_c"],
    ))
    st.append(PageBreak())

    # ── PAGE 2 — Logement en un coup d'œil ───────────────────────────────
    st.append(Paragraph("Votre logement en un coup d'œil", S["h1"]))
    st.append(sp(0.15))
    st.append(_kpi_grid([
        ("Type de logement", "Longère en pisé"),
        ("Année de construction", CLIENT["annee"]),
        ("Surface", f"{CLIENT['surface']} m²"),
        ("Chauffage actuel", "Bois + convecteurs électriques"),
        ("Eau chaude sanitaire", "Ballons électriques"),
        ("Isolation connue", "Toiture non isolée — murs pisé non isolés"),
        ("Ventilation connue", "Par ouverture des fenêtres"),
        ("DPE / conso (audit)", f"{FIL['conso_avant_ep']} (FIL ROUGE)"),
        ("Coût énergie / an", FIL["cout_annuel"]),
        ("Points de vigilance", "Pisé, humidité, toiture"),
    ]))
    st.append(sp(0.35))
    st.append(_card(
        "Votre problème principal",
        "Votre longère consomme beaucoup d'énergie : toiture non isolée, murs "
        "en pisé sensibles à l'humidité, chauffage mixte bois / électrique. "
        "La priorité est de sécuriser le clos-couvert et de préparer une "
        "isolation adaptée au pisé, avant de changer le chauffage. "
        "Les chiffres ci-dessus sont issus des documents fournis — à confirmer "
        "par visite technique et devis.",
        accent=YELLOW_BD,
    ))
    st.append(PageBreak())

    # ── PAGE 3 — 3 priorités ─────────────────────────────────────────────
    st.append(Paragraph("Les 3 priorités", S["h1"]))
    st.append(sp(0.15))
    st.append(_prio_block(
        "1", "Priorité immédiate — Toiture &amp; combles",
        "Toiture en tuiles canal non isolée ; devis historique 2023 expiré "
        f"({DEVIS['ttc']}).",
        "Réfection / mise hors d'eau et isolation des rampants (R cible selon audit).",
        "Poste le plus déperditif et risque d'infiltrations.",
        "Surface (275 m² audit vs 310 m² devis 2023), état charpente, devis 2026.",
    ))
    st.append(sp(0.18))
    st.append(_prio_block(
        "2", "Priorité importante — Enveloppe &amp; humidité (pisé)",
        "Murs pisé non isolés ; sensibilité à l'humidité en pied de mur.",
        "Isolation perspirante (ex. chaux-chanvre) après diagnostic humidité ; "
        "menuiseries et ventilation adaptées.",
        "Sans enveloppe saine, un nouveau chauffage serait mal dimensionné.",
        "Diagnostic humidité, matériaux perspirants, enduits compatibles.",
    ))
    st.append(sp(0.18))
    st.append(_prio_block(
        "3", "Priorité à planifier — Chauffage, ECS &amp; option solaire",
        "Chauffage bois + électrique ; ECS électrique ; objectif PV 6 kWc / 7 kWh "
        "(hypothèse du projet).",
        "PAC et ballons après isolation ; photovoltaïque en dernier.",
        "Performance et coût dépendent de l'enveloppe déjà traitée.",
        "Dimensionnement post-isolation, structure toiture, devis installateur.",
    ))
    st.append(PageBreak())

    # ── PAGE 4 — Ordre des travaux ───────────────────────────────────────
    st.append(Paragraph("Ordre recommandé des travaux", S["h1"]))
    st.append(sp(0.2))
    steps = [
        ("1", "Traiter les désordres éventuels",
         "Humidité, toiture, infiltrations, structure."),
        ("2", "Isoler l'enveloppe",
         "Combles / toiture, murs, planchers, fenêtres si nécessaire."),
        ("3", "Prévoir la ventilation",
         "VMC, entrées d'air, qualité de l'air."),
        ("4", "Dimensionner chauffage et eau chaude",
         "PAC, ballon thermodynamique ou autre solution adaptée."),
        ("5", "Étudier le photovoltaïque",
         "Seulement après analyse de la toiture et des usages électriques."),
    ]
    for num, titre, desc in steps:
        badge = Paragraph(
            f"<font color='white'><b>{num}</b></font>",
            ParagraphStyle("bn", parent=S["sm"], fontName=FONT_TITLE, fontSize=12,
                           alignment=TA_CENTER, textColor=WHITE),
        )
        badge_t = Table([[badge]], colWidths=[1.1 * cm], rowHeights=[1.1 * cm])
        badge_t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), TEAL),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        content = [
            Paragraph(f"<b>{titre}</b>", S["sm"]),
            Paragraph(desc, S["sm"]),
        ]
        row = Table([[badge_t, content]], colWidths=[1.4 * cm, W - 1.4 * cm])
        row.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BACKGROUND", (0, 0), (-1, -1), GRAY),
            ("BOX", (0, 0), (-1, -1), 0.5, TEAL),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        st.append(row)
        st.append(sp(0.12))
    st.append(sp(0.2))
    st.append(p(
        "<b>Cet ordre peut varier selon les contraintes spécifiques du logement.</b>"
    ))
    st.append(PageBreak())

    # ── PAGES 5–7 — Scénarios ────────────────────────────────────────────
    st.extend(_scenario_page(
        "1", "ESSENTIEL",
        "Traiter les priorités urgentes : toiture, confort de base, premiers gestes.",
        [
            "Réfection / isolation toiture et rampants (à confirmer).",
            "Menuiseries les plus dégradées (selon état).",
            "Ventilation adaptée aux premiers travaux d'étanchéité.",
        ],
        "~ 40 000 €",
        "~ 70 000 €",
        "MaPrimeRénov', CEE, éco-PTZ, TVA réduite — à instruire selon RFR",
        "Mise hors d'eau et meilleur confort ; performance globale encore limitée.",
        "Budget prudent, urgence toiture, montée en charge progressive.",
        "Pour quel profil ?",
    ))
    st.append(PageBreak())

    st.extend(_scenario_page(
        "2", "OPTIMAL",
        "Enveloppe performante avant changement de chauffage "
        "(recommandation d'orientation pour votre longère).",
        [
            "Toiture / rampants + isolation murs pisé (matériaux perspirants).",
            "Planchers, menuiseries, ventilation double flux.",
            "Chauffage / ECS reportés après enveloppe (étape suivante).",
        ],
        "~ 90 000 €",
        "~ 160 000 €",
        "MaPrimeRénov' Parcours, CEE, éco-PTZ — sous réserve d'éligibilité",
        "Forte baisse des besoins ; base saine pour une PAC bien dimensionnée.",
        "Il respecte l'ordre technique (isolation avant chauffage), limite "
        "les surcoûts de PAC, et s'appuie sur les étapes FIL ROUGE / BAO "
        "sans engager d'emblée le budget global.",
        "Pourquoi ce scénario est recommandé",
        recommended=True,
    ))
    st.append(PageBreak())

    st.extend(_scenario_page(
        "3", "EXCELLENCE",
        "Rénovation globale bas carbone en une trajectoire ambitieuse.",
        [
            "Enveloppe complète (toiture, murs, planchers, menuiseries, VMC).",
            "PAC Air/Eau + plancher chauffant + ballons thermodynamiques.",
            "Option PV 6 kWc + batterie 7 kWh (budget de travail 18 000 € TTC).",
        ],
        "~ 220 000 €",
        "~ 270 000 €",
        "Aides parcours + CEE + éco-PTZ — à confirmer ; RFR requis",
        "Forte réduction de consommation estimée par l'audit "
        f"({FIL['sc1_gain']}) — non garantie sans réalisation conforme.",
        "Capacité de financement globale, devis RGE complets, "
        "accord aides avant démarrage si parcours MPR.",
        "Conditions à réunir",
    ))
    st.append(PageBreak())

    # ── PAGE 8 — Budget, aides, financement ──────────────────────────────
    st.append(Paragraph("Budget, aides et financement", S["h1"]))
    st.append(sp(0.15))
    rows = [
        ["Poste / scénario", "Estimation travaux", "Aides potentielles", "Reste à charge à confirmer"],
        ["Scénario 1 — Essentiel", "40–70 k€", "À vérifier", "À confirmer sur devis"],
        ["Scénario 2 — Optimal", "90–160 k€", "À vérifier", "À confirmer sur devis"],
        ["Scénario 3 — Excellence", "220–270 k€", "À vérifier", "À confirmer sur devis"],
        ["Option PV (hypothèse)", "18 000 € TTC*", "À vérifier", "À confirmer"],
    ]
    body_s = ParagraphStyle("tb", parent=S["sm"], fontSize=8, leading=10)
    head_s = ParagraphStyle("th", parent=S["sm"], fontSize=8, fontName=FONT_TITLE,
                            textColor=WHITE, leading=10)
    data = []
    for r, row in enumerate(rows):
        data.append([Paragraph(str(c), head_s if r == 0 else body_s) for c in row])
    t = Table(data, colWidths=[4.5 * cm, 3.5 * cm, 4 * cm, 5 * cm])
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), TEAL),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("BACKGROUND", (0, 2), (-1, 2), YELLOW),  # Optimal mis en avant
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
    ]
    t.setStyle(TableStyle(cmds))
    st.append(t)
    st.append(Paragraph(
        "<font size='7.5'><i>* Budget de travail transmis par le porteur du projet — "
        "simulation non contractuelle.</i></font>",
        S["sm"],
    ))
    st.append(sp(0.2))
    st.append(_card(
        "Aides à vérifier",
        "• MaPrimeRénov'<br/>"
        "• CEE<br/>"
        "• Éco-PTZ<br/>"
        "• TVA à taux réduit<br/>"
        "• Aides locales éventuelles<br/><br/>"
        "<i>Montants et éligibilité sous réserve des règles en vigueur et du RFR "
        "(non communiqué à ce stade).</i>",
        accent=TEAL,
    ))
    st.append(sp(0.2))
    fab = Paragraph(
        "<b>Financement du reste à charge</b><br/><br/>"
        "Une étude via Fabien Barras, Vivons Courtier, peut être envisagée "
        "pour des projets de travaux sur devis. Un financement de 6 000 € à "
        "75 000 € peut être étudié selon votre situation, avec un objectif "
        "de déblocage sous 10 jours lorsque le dossier est complet et accepté.<br/><br/>"
        "Toute solution de financement est soumise à l'étude du dossier, "
        "à la capacité de remboursement, aux conditions contractuelles "
        "et à l'acceptation de l'organisme prêteur. "
        "Aucun montant, taux, accord ou délai de déblocage n'est garanti.",
        S["sm"],
    )
    fab_t = Table([[fab]], colWidths=[W])
    fab_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CT["info_bg"]),
        ("BOX", (0, 0), (-1, -1), 1, TEAL),
        ("LINEBEFORE", (0, 0), (0, -1), 4, NIGHT),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    st.append(fab_t)
    st.append(PageBreak())

    # ── PAGE 9 — Recommandation ──────────────────────────────────────────
    st.append(Paragraph("Notre recommandation", S["h1"]))
    st.append(sp(0.15))
    rec = Paragraph(
        f"<para align='center'><font color='white' size='11'>"
        f"<b>La recommandation {MARQUE}</b><br/><br/>"
        f"<font size='14'>SCÉNARIO 2 — OPTIMAL</font><br/>"
        f"Enveloppe performante avant chauffage"
        f"</font></para>",
        S["body_c"],
    )
    rec_t = Table([[rec]], colWidths=[W])
    rec_t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), TEAL),
        ("TOPPADDING", (0, 0), (-1, -1), 14),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
    ]))
    st.append(rec_t)
    st.append(sp(0.25))
    st.append(Paragraph("<b>3 raisons principales</b>", S["h2"]))
    st.append(bullets([
        "Traite toiture et enveloppe avant de dimensionner une PAC.",
        "Réduit le risque de surcoût et de surdimensionnement du chauffage.",
        "S'appuie sur les étapes des audits disponibles, sans figer un devis.",
    ]))
    st.append(Paragraph("<b>Risques à éviter</b>", S["h2"]))
    st.append(bullets([
        "Changer le chauffage avant d'isoler.",
        "Signer le devis toiture 2023 expiré sans actualisation.",
        "Bloquer le pisé avec des matériaux non perspirants.",
        "Démarrer des travaux avant accord d'aides si un parcours MPR est visé.",
    ]))
    st.append(Paragraph("<b>Décision à prendre maintenant</b>", S["h2"]))
    st.append(p(
        "Valider le scénario Optimal comme feuille de route, lancer le diagnostic "
        "humidité et la consultation de devis toiture / enveloppe 2026."
    ))
    st.append(Paragraph("<b>Décision à différer</b>", S["h2"]))
    st.append(p(
        "Devis définitif PAC, ballons et photovoltaïque : après enveloppe "
        "et étude technique."
    ))
    st.append(sp(0.2))
    st.append(_card(
        "Ne pas lancer de devis définitif avant d'avoir validé :",
        "• l'état de la toiture et de l'humidité ;<br/>"
        "• les caractéristiques techniques ;<br/>"
        "• l'ordre des travaux ;<br/>"
        "• les aides applicables ;<br/>"
        "• le financement éventuel.",
        accent=YELLOW_BD,
    ))
    st.append(PageBreak())

    # ── PAGE 10 — Plan d'action ──────────────────────────────────────────
    st.append(Paragraph("Plan d'action", S["h1"]))
    st.append(sp(0.15))
    checks = [
        "Valider le scénario choisi",
        "Réunir les documents utiles (dont avis d'imposition / RFR)",
        "Vérifier les aides et règles applicables",
        "Demander des devis détaillés",
        "Vérifier les qualifications et assurances des entreprises",
        "Étudier le financement du reste à charge si nécessaire",
        "Planifier le lancement des travaux",
        "Conserver le dossier technique complet",
    ]
    for c in checks:
        st.append(Paragraph(f"☐  {c}", S["body"]))
    st.append(sp(0.35))
    st.append(Paragraph("<b>Deux parcours pour avancer</b>", S["h2"]))
    st.append(_card(
        "A. Audit et structuration du projet",
        "energia-conseil-ia.com<br/>"
        "Pour approfondir l'étude d'orientation et la feuille de route.",
        accent=TEAL,
    ))
    st.append(sp(0.15))
    st.append(_card(
        "B. Demande de projet et devis",
        "travauxoptim.renovoptim-ia.com<br/>"
        "Pour engager la consultation d'entreprises sur devis.",
        accent=GREEN,
    ))
    st.append(PageBreak())

    # ── DERNIÈRE PAGE — Contact + annexe ─────────────────────────────────
    st.append(Paragraph("Contact &amp; dossier technique", S["h1"]))
    st.append(sp(0.4))
    contact = Paragraph(
        f"<para align='center'>"
        f"<b><font size='14' color='#0F766E'>{MARQUE}</font></b><br/><br/>"
        f"16 rue Cuvier, 69006 Lyon<br/>"
        f"06 10 59 68 98<br/>"
        f"<b>{EMAIL_OFFICIEL}</b><br/><br/>"
        f"<font size='8'><i>{MARQUE_LICENCE}</i></font>"
        f"</para>",
        S["body_c"],
    )
    ct = Table([[contact]], colWidths=[W])
    ct.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), WHITE),
        ("BOX", (0, 0), (-1, -1), 1.5, TEAL),
        ("TOPPADDING", (0, 0), (-1, -1), 18),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
    ]))
    st.append(ct)
    st.append(sp(0.5))
    st.append(_card(
        "Dossier technique complet",
        "Le dossier technique complet est joint séparément. "
        "Il contient les hypothèses, photos, simulations, détails par poste, "
        "références et annexes.<br/><br/>"
        "Le dossier technique complet et ses annexes sont disponibles en complément "
        "pour approfondir les hypothèses, les scénarios et les éléments techniques.",
        accent=NIGHT,
    ))
    st.append(sp(0.4))
    st.append(Paragraph(
        "<i>Cette synthèse décisionnelle est une étude d'orientation. "
        "Elle ne constitue ni un devis, ni un audit réglementaire, ni un DPE, "
        "ni une thermographie réelle. Estimations à confirmer par devis et "
        "visite technique.</i>",
        ParagraphStyle("end", parent=S["sm"], alignment=TA_CENTER, textColor=MUTED),
    ))
    return st


def generate_decision_summary(output_path: Path) -> Path:
    """Génère la synthèse décisionnelle client (8–12 pages cibles)."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=28 * mm,
        bottomMargin=18 * mm,
        title="Synthèse décisionnelle — Clyve Andriot",
        author=MARQUE,
        subject="Feuille de route rénovation énergétique",
    )
    doc.build(build_decision_summary_story(), canvasmaker=SummaryCanvas)
    return output_path
