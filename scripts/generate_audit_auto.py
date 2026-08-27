#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur automatique d'audit énergétique PDF — ENERGIA CONSEIL IA® v15
Contractant Général · Mandataire Administratif ANAH — 85 pages

Usage:
    python scripts/generate_audit_auto.py
    python scripts/generate_audit_auto.py --output audits/Audit_CLIENT_2026.pdf
"""

from __future__ import annotations

import argparse
import io
import math
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
from reportlab.graphics.shapes import (
    Circle,
    Drawing,
    Line,
    Polygon,
    Rect,
    String,
    Wedge,
)
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
    "primary_end": colors.HexColor("#10b981"),
    "primary_light": colors.HexColor("#f0fdfa"),
    "secondary": colors.HexColor("#10b981"),
    "gray_bg": colors.HexColor("#F3F4F6"),
    "text": colors.HexColor("#0f172a"),
    "muted": colors.HexColor("#475569"),
    "border": colors.HexColor("#0f766e"),
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

DPE_COLORS = {
    "A": colors.HexColor("#00933d"),
    "B": colors.HexColor("#52ae32"),
    "C": colors.HexColor("#c8d413"),
    "D": colors.HexColor("#feed01"),
    "E": colors.HexColor("#fbba00"),
    "F": colors.HexColor("#eb8235"),
    "G": colors.HexColor("#e2001a"),
}

MPR_TAUX = {"BLEU": 0.80, "JAUNE": 0.60, "VIOLET": 0.45, "ROSE": 0.30}
MPR_PLAFOND = {"BLEU": 24000, "JAUNE": 18000, "VIOLET": 13500, "ROSE": 3000}
GENERATOR_VERSION = "27"

SCHEMA_PEDAGO_NOTE = (
    "Schéma pédagogique indicatif et non contractuel. Les caractéristiques définitives "
    "sont confirmées par les devis, l'audit réglementaire, les relevés techniques et les entreprises."
)
AUDIT_HEADER_LABEL = "AUDIT ÉNERGÉTIQUE IA"


def register_brand_fonts() -> Tuple[str, str]:
    """Enregistre Montserrat / Inter si disponibles, sinon Helvetica."""
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont

    root = Path(__file__).resolve().parent.parent
    title_path = root / "assets" / "fonts" / "Montserrat-Bold.ttf"
    body_path = root / "assets" / "fonts" / "Inter-Regular.ttf"
    title_font, body_font = "Helvetica-Bold", "Helvetica"
    try:
        if title_path.is_file():
            pdfmetrics.registerFont(TTFont("Montserrat-Bold", str(title_path)))
            title_font = "Montserrat-Bold"
        if body_path.is_file():
            pdfmetrics.registerFont(TTFont("Inter-Regular", str(body_path)))
            body_font = "Inter-Regular"
    except Exception:
        pass
    return title_font, body_font


FONT_TITLE, FONT_BODY = register_brand_fonts()

ENTREPRISE = {
    "nom": "ENERGIA CONSEIL IA®",
    "statut": "Contractant Général · Mandataire Administratif ANAH",
    "tagline": (
        "Audit Énergétique Intelligence Artificielle | Marque déposée INPI | "
        "Contractant Général · Mandataire Administratif ANAH"
    ),
    "adresse": "16 Rue Cuvier, 69006 Lyon",
    "tel": "06 10 59 68 98",
    "email": "contact@energia-conseil-ia.com",
    "web": "www.energia-conseil-ia.com",
    "siret": "94181942700019",
    "rcs": "Lyon 941819427",
    "decennale": "LUNPIB2604975",
}

HEADER_LABEL = "Contractant Général & Mandataire ANAH"

IDENTITE_LEGALE = (
    "<b>ENERGIA CONSEIL IA®</b><br/>"
    "Contractant Général en rénovation énergétique globale<br/>"
    "Coordination des intervenants travaux — interlocuteur projet côté travaux et suivi client<br/>"
    "<i>Mandataire administratif uniquement si le mandat correspondant est signé et enregistré.</i>"
)

POSITIONNEMENT_ENERGIA = (
    "ENERGIA CONSEIL IA® assure la <b>coordination globale</b> de votre rénovation énergétique "
    "en qualité de Contractant Général. "
    "Les aides MaPrimeRénov' sont versées sur votre compte bancaire "
    "après validation du dossier et réception des travaux."
)

SYNTHESE_ENCADRE = (
    "Scénario OPTIMAL ⭐ recommandé — isolation toiture SARKING, menuiseries, PAC air-air, "
    "ballon thermodynamique. Objectif DPE G → C. "
    "Les aides MaPrimeRénov' sont versées sur le compte du client ; le reste à charge peut être financé "
    "via Éco-PTZ (banque) ou UMAFI (8 jours)."
)

MAR_FRAIS_TEXTE = (
    "Les frais d'accompagnement MAR (Mandataire Administratif Rénov') s'élèvent à 9 885 € TTC, "
    "couverts en grande partie par MaPrimeRénov'. Une participation directe de 1 250 € "
    "a été réglée par le client à la signature du mandat."
)

ECOPTZ_TEXTE = (
    "Prêt à Taux Zéro accordé directement par <b>VOTRE BANQUE</b>. "
    "Délai d'instruction : 2 à 3 mois. "
    "Idéal si vous n'êtes pas pressé et souhaitez financer votre reste à charge à taux zéro."
)

UMAFI_BLOC = (
    "<b>⚡ Besoin de financer rapidement ?</b><br/><br/>"
    "<b>FABIEN BARRAS — Enseigne UMAFI</b><br/>"
    "Courtier partenaire indépendant d'ENERGIA CONSEIL IA®<br/>"
    "Spécialisé en financement de travaux et regroupement de crédits.<br/><br/>"
    "<b>✅ SOLUTION 1 — PRÊT TRAVAUX SUR DEVIS :</b><br/>"
    "• De 6 000 € à 75 000 €<br/>"
    "• Prêt personnel — fonds libres<br/>"
    "• L'argent sur votre compte en 8 jours<br/>"
    "• Dossier simplifié : CNI, justif. domicile, RIB, devis, avis d'imposition — c'est tout !<br/><br/>"
    "<b>✅ SOLUTION 2 — REGROUPEMENT DE CRÉDITS + TRAVAUX :</b><br/>"
    "• Rachat de vos crédits conso en cours<br/>"
    "• Intégration du budget travaux<br/>"
    "• Une seule mensualité lissée sur votre budget<br/>"
    "• Réalisez vos travaux sans alourdir votre budget<br/><br/>"
    "📞 06 71 19 96 45 | 📧 contact@umafi.fr | 🌐 umafi.fr | 💬 WhatsApp disponible"
)

UMAFI_MENTIONS_LEGALES = (
    "Fabien BARRAS — Enseigne UMAFI — EI — "
    "870 Route de Permillac, 46800 Montlauzun — SIREN 837 514 942 — RCS Cahors — "
    "MIOBSP, mandataire Budgetlyss — ORIAS 26 009 255 — "
    "RC Pro : Everest Insurance — Supervisé ACPR. "
    "Un crédit vous engage et doit être remboursé. "
    "Vérifiez vos capacités de remboursement."
)

RGPD_CONSENT_UMAFI = (
    "□ J'autorise ENERGIA CONSEIL IA® à collecter et transmettre mes pièces justificatives "
    "à son partenaire de financement agréé UMAFI dans le cadre exclusif de l'étude de mon dossier."
)

CONTRACTANT_GENERAL = POSITIONNEMENT_ENERGIA

CONTACTS = (
    "Sylvain LEMBELEMBE (Contractant Général) 06 10 59 68 98 | "
    "Hub Admin (coordination administrative) clyve.a@hub-admin.fr | "
    "Lionel MFEGUE / LEO ENERGY (Accompagnateur Rénov') | "
    "Fabien BARRAS (UMAFI) 06 71 19 96 45 | "
    "DAMIEN (Commercial) 06 72 68 09 68 | Julia (Juriste)"
)

AIDS_DISCLAIMER = (
    "<b>Aides financières 2026 (estimation à titre indicatif).</b> "
    "Montants estimatifs, soumis aux règles en vigueur, "
    "à l'éligibilité du dossier et à l'instruction des organismes. "
    "Montants définitifs après instruction ANAH. "
    "L'Éco-PTZ et les prêts sont des financements, jamais des aides."
)

AIDS_MPR_ONLY_NOTE = (
    "Les aides présentées correspondent uniquement à MaPrimeRénov' Parcours Accompagné. "
    "Les certificats d'économies d'énergie éventuellement générés par le projet ne constituent "
    "pas une prime distincte déduite du présent document."
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


def format_euro(val: float | int | None, signed: bool = False) -> str:
    if val is None or val == "" or val == "À confirmer":
        return "À confirmer"
    try:
        n = int(round(float(val)))
    except (TypeError, ValueError):
        return "À confirmer"
    prefix = "+" if signed and n > 0 else ("-" if signed and n < 0 else "")
    body = f"{abs(n):,}".replace(",", " ")
    return f"{prefix}{body} €"


def build_mandat_admin_anah(total_aides: float) -> str:
    amt = format_euro(total_aides)
    return (
        "<b>Dossier administratif en cours de constitution.</b><br/><br/>"
        "ENERGIA CONSEIL IA® assure la coordination du projet côté travaux. "
        "La gestion administrative du dossier d'aides est coordonnée avec Hub Admin. "
        f"Les montants d'aides ({amt}) sont <b>estimés à titre indicatif</b> et restent "
        "soumis à l'enregistrement du dossier, à l'instruction des organismes et aux "
        "conditions applicables.<br/><br/>"
        "Avant tout démarrage de travaux, une <b>confirmation écrite</b> du bon "
        "enregistrement administratif du dossier doit être obtenue."
    )


def build_equipe_roles(_total_aides: float = 24000) -> str:
    return (
        "<b>SYLVAIN LEMBELEMBE — ENERGIA CONSEIL IA®</b><br/>"
        "→ <b>Contractant Général</b> en rénovation énergétique globale : coordination des "
        "intervenants travaux, interlocuteur projet côté travaux et suivi client.<br/>"
        "→ <b>Mandataire administratif</b> uniquement si le mandat correspondant est "
        "effectivement signé et enregistré.<br/><br/>"
        "<b>Coordination administrative : Hub Admin</b><br/>"
        "→ Centralisation des documents et suivi administratif.<br/>"
        "→ Interface administrative avec les intervenants.<br/>"
        "→ Contact : clyve.a@hub-admin.fr<br/><br/>"
        "<b>Accompagnateur Rénov' : Lionel MFEGUE / LEO ENERGY</b><br/>"
        "→ Accompagnateur Rénov' proposé pour le dossier.<br/>"
        "→ Désignation à finaliser par le client sur MonProjetAnah.<br/>"
        "→ Une fois sélectionné et mandaté : Accompagnateur Rénov' du dossier.<br/><br/>"
        "<b>FABIEN BARRAS — UMAFI</b> (Courtier partenaire)<br/>"
        "→ Courtier spécialisé financement de travaux et regroupement de crédits (MIOBSP/ORIAS).<br/>"
        "→ Partenariat indépendant avec ENERGIA CONSEIL IA® — 06 71 19 96 45 | umafi.fr"
    )


PARCOURS_ACCOMPAGNE_NOTE = (
    "<b>Étape préalable au dépôt :</b><br/>"
    "M. ROYER doit créer son espace personnel MonProjetAnah et y sélectionner "
    "<b>Lionel MFEGUE / LEO ENERGY</b> comme Accompagnateur Rénov'.<br/><br/>"
    "Le dépôt de la demande d'aide, les montants définitifs et le démarrage du chantier "
    "restent conditionnés à la bonne constitution et à l'enregistrement du dossier."
)

DOSSIER_ADMIN_FLUX_NOTE = (
    "<b>Dossier administratif en cours de constitution.</b><br/><br/>"
    "Avant tout démarrage de travaux, une confirmation écrite du bon enregistrement "
    "du dossier et du respect des conditions applicables doit être obtenue.<br/><br/>"
    "L'acompte de <b>{acompte}</b> est appelé mais reste en attente de réception, "
    "dans l'attente de la finalisation du cadre administratif et financier du projet."
)


def build_dossier_admin_flux_note(acompte_30: float) -> str:
    return DOSSIER_ADMIN_FLUX_NOTE.format(acompte=format_euro(acompte_30))

PARCOURS_ADMIN_HUB = (
    "<b>Parcours administratif du dossier :</b><br/>"
    "1. Création de l'espace MonProjetAnah par le client<br/>"
    "2. Sélection de <b>Lionel MFEGUE / LEO ENERGY</b> comme Accompagnateur Rénov'<br/>"
    "3. Transmission et contrôle des pièces<br/>"
    "4. Coordination administrative par Hub Admin<br/>"
    "5. Constitution de la demande d'aide<br/>"
    "6. Confirmation écrite avant démarrage des travaux<br/>"
    "7. Suivi jusqu'aux demandes de paiement"
)

PLANNING_AVANT_DEMARRAGE = (
    "Aucun démarrage de travaux ne doit intervenir avant la confirmation écrite "
    "du bon enregistrement administratif du dossier."
)

PLANNING_PHASE_1 = (
    "Création MonProjetAnah, désignation Accompagnateur Rénov', "
    "constitution dossier, confirmation écrite avant démarrage"
)


def build_flux_financier(budget: float, total_aides: float, reste: float) -> str:
    return (
        f"<b>1. Montant total du projet :</b> {format_euro(budget)} TTC<br/>"
        f"<b>2. Total des aides attendues :</b> {format_euro(total_aides)} "
        "(MaPrimeRénov' — versement sur votre compte bancaire après instruction ANAH)<br/>"
        f"<b>3. Reste à charge client :</b> {format_euro(reste)}"
    )


EQUIPE_ROLES = build_equipe_roles(24000)
MANDAT_FINANCIER_ANAH = build_mandat_admin_anah(24000)


def slug_client(nom: str) -> str:
    parts = re.sub(r"[^A-Za-zÀ-ÿ\s]", "", nom).strip().split()
    return (parts[-1] if parts else "CLIENT").upper()


def pct_reduction(avant: float, apres: float) -> int:
    if avant <= 0:
        return 0
    return int(round((1 - apres / avant) * 100))


def calc_cee_auto(surface: int) -> float:
    return surface * 50 + 3000


def calc_mpr_auto(budget: float, profil: str) -> float:
    taux = MPR_TAUX.get(profil.upper(), 0.60)
    plafond = MPR_PLAFOND.get(profil.upper(), 18000)
    return min(budget * taux, plafond)


def _num(val: Any, default: float = 0.0) -> float:
    """Convertit en float ; ne calcule / n'invente rien si absent."""
    if val is None or val == "" or val == "À confirmer":
        return float(default)
    try:
        return float(val)
    except (TypeError, ValueError):
        return float(default)


def _nint(val: Any, default: int = 0) -> int:
    return int(round(_num(val, default)))


class ClientContext:
    """Données client + valeurs dérivées pour la génération PDF."""

    def __init__(self, raw: dict[str, Any]):
        self.raw = dict(raw)
        self.nom = raw.get("nom") or "À confirmer"
        self.slug = slug_client(self.nom if self.nom != "À confirmer" else "CLIENT")
        self.ref = raw.get("reference") or f"AUDIT-2026-{self.slug}"
        self.date_str = datetime.now().strftime("%d/%m/%Y")
        self.surface = _nint(raw.get("surface"), 0) or 1  # éviter /0
        profil_raw = raw.get("profil_anah") or "À confirmer"
        self.profil = str(profil_raw).upper() if str(profil_raw).upper() in MPR_TAUX else str(profil_raw)
        self.budget = _num(raw.get("budget_travaux"), 0)
        travaux_optimal = raw.get("scenarios", {}).get("optimal", {}).get("travaux", []) or []
        travaux_sum = sum(_num(t.get("cout"), 0) for t in travaux_optimal)
        self.budget_ht = _num(raw.get("budget_ht"), travaux_sum if travaux_sum else 0)
        self.tva_montant = _num(raw.get("tva_montant"), max(0, self.budget - self.budget_ht) if self.budget else 0)
        # Ne jamais inventer MPR/CEE : 0 si absent → affichage à confirmer côté sections
        self.mpr = _num(raw.get("mpr"), 0)
        self.cee = _num(raw.get("cee"), 0)
        self.cee_detail = raw.get("cee_detail") or {}
        self.total_aides = _num(raw.get("total_aides"), self.mpr + self.cee)
        self.reste = _num(raw.get("effort_final"), max(0, self.budget - self.total_aides) if self.budget else 0)
        self.ecoptz = _num(raw.get("ecoptz"), min(50000, self.reste) if self.reste else 0)
        self.duree_pret = _nint(raw.get("duree_pret_mois"), 180) or 180
        self.mensualite = _num(raw.get("mensualite_ecoptz"), 0) or (
            self.ecoptz / self.duree_pret if self.duree_pret and self.ecoptz else 0
        )
        self.economies_annuelles = _num(raw.get("economies_annuelles"), 0)
        self.eco_mois = self.economies_annuelles / 12 if self.economies_annuelles else 0
        self.gain_net_mois = self.eco_mois - self.mensualite
        self.roi = self.reste / max(self.economies_annuelles, 1) if self.economies_annuelles else 0
        self.facture_avant = _num(raw.get("facture_avant"), 0)
        self.facture_apres = _num(raw.get("facture_apres"), 0)
        self.facture_res = _num(raw.get("facture_residuelle"), self.facture_apres)
        self.dpe_actuel = raw.get("dpe_actuel") or "À confirmer"
        self.dpe_cible = raw.get("dpe_cible") or "À confirmer"
        self.conso_avant = _nint(raw.get("conso_avant"), 0)
        self.conso_apres = _nint(raw.get("conso_apres"), 0)
        self.co2_avant = _num(raw.get("co2_avant_kg_m2"), _num(raw.get("co2_avant_t"), 0))
        self.co2_apres = _num(raw.get("co2_apres_kg_m2"), _num(raw.get("co2_apres_t"), 0))
        self.reduction_conso_pct = _nint(
            raw.get("reduction_conso_pct"),
            pct_reduction(self.conso_avant, self.conso_apres) if self.conso_avant else 0,
        )
        self.reduction_ges_pct = _nint(
            raw.get("reduction_ges_pct"),
            pct_reduction(self.co2_avant, self.co2_apres) if self.co2_avant else 0,
        )
        ech = raw.get("echeancier") or {}
        self.acompte_30 = _num(ech.get("acompte_30"), self.budget * 0.30 if self.budget else 0)
        self.mi_40 = _num(ech.get("demarrage_40"), self.budget * 0.40 if self.budget else 0)
        self.reception_30 = _num(ech.get("reception_30"), self.budget * 0.30 if self.budget else 0)
        self.acompte_verse = bool(ech.get("acompte_30_verse", False))
        self.mar_participation = _num(raw.get("mar_participation_client"), 0)
        self.mar_participation_versee = bool(raw.get("mar_participation_versee", False))
        self.valorisation_pct = _nint(raw.get("valorisation_pct"), 0)
        self.pv = bool(raw.get("option_solaire", False))
        self.option_pv = raw.get("option_photovoltaique") or {}
        self.puissance_pv = _num(self.option_pv.get("puissance_kwc"), _num(raw.get("puissance_pv"), 0))
        self.production_pv = _num(raw.get("production_pv"), 0)
        self.scenario_recommande = raw.get("scenario_recommande") or "optimal"
        self.scenarios = self._load_scenarios(raw)
        self.enveloppe = raw.get("enveloppe") or {}
        self.points_faibles = raw.get("points_faibles") or []
        self.artisans = raw.get("artisans") or []
        self.points_a_valider = list(raw.get("points_a_valider") or [])
        self.photos_logement = list(raw.get("photos_logement") or [])
        self.justificatifs = list(raw.get("justificatifs") or [])
        self.mar_document = raw.get("mar_document") or {"present": False, "status": "pending"}
        self.titre_document = raw.get("titre_document") or (
            "Rapport de synthèse énergétique et financière personnalisé"
        )
        taux_profil = MPR_TAUX.get(str(self.profil).upper())
        self.avance_anah = self.mpr * 0.50 if str(self.profil).upper() == "BLEU" else (self.mpr * 0.30 if taux_profil else 0)
        self.avance_ecoptz = self.ecoptz * 0.30
        self.avance_fabien = max(0, self.acompte_30 - self.avance_anah - self.avance_ecoptz)
        self.tresorerie = self.avance_anah + self.avance_ecoptz + self.avance_fabien
        self.is_pise = "pisé" in str(raw.get("type_bien", "")).lower() or "pise" in str(raw.get("type_bien", "")).lower()
        self.tva_economie = self.budget * TVA_REDUITE * 0.15 if self.budget else 0

    def _load_scenarios(self, raw: dict[str, Any]) -> dict[str, Any]:
        defaults = {
            "essentiel": {"label": "ESSENTIEL", "badge": "Travaux prioritaires", "budget": 0, "dpe_cible": "À confirmer",
                          "conso_apres": 0, "economies_annuelles": 0, "travaux": []},
            "optimal": {"label": "OPTIMAL", "badge": "Recommandé", "budget": self.budget,
                        "dpe_cible": self.dpe_cible, "conso_apres": self.conso_apres,
                        "economies_annuelles": self.economies_annuelles, "travaux": []},
            "excellence": {"label": "EXCELLENCE", "badge": "Option complémentaire", "budget": 0,
                           "dpe_cible": "À confirmer", "conso_apres": 0, "economies_annuelles": 0, "travaux": []},
        }
        custom = raw.get("scenarios") or {}
        for key in defaults:
            if key in custom and isinstance(custom[key], dict):
                defaults[key].update(custom[key])
            if defaults[key].get("budget") is None:
                defaults[key]["budget"] = 0
            for nk in ("conso_apres", "economies_annuelles", "roi"):
                if defaults[key].get(nk) is None:
                    defaults[key][nk] = 0
            aides = defaults[key].get("aides")
            if isinstance(aides, dict):
                for ak, av in list(aides.items()):
                    if av is None:
                        aides[ak] = 0
        return defaults

    def aides_scenario(self, scenario_key: str) -> dict[str, float]:
        sc = self.scenarios[scenario_key]
        budget = _num(sc.get("budget"), 0)
        aids_data = sc.get("aides") or {}
        # Ne jamais inventer d'aides : uniquement JSON ou totaux client déjà renseignés
        if any(aids_data.get(k) is not None for k in ("mpr", "cee", "total", "reste")):
            mpr = _num(aids_data.get("mpr"), 0)
            cee = _num(aids_data.get("cee"), 0)
            prime_pv = _num(aids_data.get("prime_pv"), 0)
            tva_pv = _num(aids_data.get("tva_pv"), 0)
            total = _num(aids_data.get("total"), mpr + cee + prime_pv + tva_pv)
            reste = _num(aids_data.get("reste"), max(0, budget - total) if budget else 0)
        elif scenario_key == "optimal" and (self.mpr or self.cee):
            mpr, cee = self.mpr, self.cee
            total = mpr + cee
            reste = max(0, budget - total) if budget else 0
            prime_pv = tva_pv = 0
        else:
            mpr = cee = prime_pv = tva_pv = total = 0
            reste = budget
        ecoptz = min(50000, reste) if reste else 0
        return {
            "mpr": mpr, "cee": cee, "prime_pv": prime_pv, "tva_pv": tva_pv,
            "total": total, "reste": reste,
            "ecoptz": ecoptz, "mensualite": ecoptz / 180 if ecoptz else 0,
        }


# ─────────────────────────────────────────────────────────────────────────────
# STYLES & COMPOSANTS PDF
# ─────────────────────────────────────────────────────────────────────────────


class StyleFactory:
    def __init__(self):
        base = getSampleStyleSheet()
        self.h1 = ParagraphStyle(
            "H1", parent=base["Heading1"], fontName=FONT_TITLE,
            fontSize=20, textColor=C["primary"], spaceAfter=8, spaceBefore=4,
        )
        self.h2 = ParagraphStyle(
            "H2", parent=base["Heading2"], fontName=FONT_TITLE,
            fontSize=13, textColor=C["text"], spaceAfter=6, spaceBefore=10,
            borderPadding=4, leftIndent=0,
        )
        self.h3 = ParagraphStyle(
            "H3", parent=base["Normal"], fontName=FONT_TITLE,
            fontSize=11, textColor=C["secondary"], spaceAfter=4,
        )
        self.body = ParagraphStyle(
            "Body", parent=base["Normal"], fontName=FONT_BODY,
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
            Paragraph(
                f"<b>{ENTREPRISE['nom']}</b> — {AUDIT_HEADER_LABEL} | Réf. {self.ctx.ref}",
                self.s.h3,
            ),
            Paragraph(f"Réf. {self.ctx.ref}", self.s.muted),
        ]]
        t = Table(data, colWidths=[11 * cm, 6 * cm])
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ("LINEBELOW", (0, 0), (-1, 0), 1.5, C["primary"]),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        return [t, self.p(f"<b>{section}</b>", self.s.body_sm), self.spacer(0.15)]

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
            ("FONTNAME", (0, 0), (-1, 0), FONT_TITLE),
            ("FONTSIZE", (0, 0), (-1, -1), 8.5),
            ("BACKGROUND", (0, 0), (-1, 0), C["primary"]),
            ("TEXTCOLOR", (0, 0), (-1, 0), C["white"]),
            ("GRID", (0, 0), (-1, -1), 0.6, C["border"]),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ]
        for i in range(1, len(rows)):
            if i % 2 == 0:
                style_cmds.append(("BACKGROUND", (0, i), (-1, i), C["green_bg"]))
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

    def dpe_gauge(self, actuel: str, cible: str) -> Table:
        letters = ["A", "B", "C", "D", "E", "F", "G"]
        actuel_ok = actuel if actuel in DPE_COLORS else ""
        cible_ok = cible if cible in DPE_COLORS else ""
        cells = []
        for letter in letters:
            bg = DPE_COLORS[letter]
            bold = letter in (actuel_ok, cible_ok) and letter != ""
            marker = " ◄" if letter == actuel_ok else (" ►" if letter == cible_ok else "")
            cells.append(Paragraph(
                f'<para align="center"><b>{letter}{marker}</b></para>' if bold else letter,
                ParagraphStyle("dpe", parent=self.s.center, fontSize=9,
                               textColor=C["white"] if bold else C["text"],
                               fontName=FONT_TITLE if bold else FONT_BODY),
            ))
        t = Table([cells], colWidths=[self.WIDTH / 7] * 7)
        cmds = [("ALIGN", (0, 0), (-1, -1), "CENTER"), ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]
        for i, letter in enumerate(letters):
            cmds.append(("BACKGROUND", (i, 0), (i, 0), DPE_COLORS[letter]))
        t.setStyle(TableStyle(cmds))
        return t

    def bar_chart(self, items: Sequence[Tuple[str, float, str]]) -> Table:
        max_val = max(v for _, v, _ in items) or 1
        rows = [["Poste", "Part", ""]]
        for label, val, color_hex in items:
            w = max(1, int(10 * val / max_val))
            bar = "█" * w
            rows.append([label, f"{int(val)} €", bar])
        t = self.table(rows, [5 * cm, 3 * cm, 9 * cm])
        return t

    def schema_note(self) -> Paragraph:
        return Paragraph(f"<i>{SCHEMA_PEDAGO_NOTE}</i>", self.s.muted)

    def legend_badges(self, items: Sequence[Tuple[str, str]]) -> Table:
        """Badges légende compactes : (label, couleur_hex)."""
        cells = []
        for label, color_hex in items:
            cells.append(Paragraph(
                f'<font color="{color_hex}">●</font> {label}',
                ParagraphStyle("badge", parent=self.s.body_sm, fontSize=8.5, leading=11),
            ))
        ncols = min(3, max(1, len(cells)))
        rows = [cells[i:i + ncols] for i in range(0, len(cells), ncols)]
        while rows and len(rows[-1]) < ncols:
            rows[-1].append("")
        t = Table(rows, colWidths=[self.WIDTH / ncols] * ncols)
        t.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 2),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#DCFCE7")),
            ("BOX", (0, 0), (-1, -1), 0.4, C["primary"]),
        ]))
        return t

    def pie_chart_deperditions(
        self,
        slices: Optional[Sequence[Tuple[str, float, str]]] = None,
    ) -> Drawing:
        # Palette monochrome vert ENERGIA — du plus important au moins important
        data = list(slices or [
            ("Toiture", 30, "#0F766E"),
            ("Murs", 25, "#059669"),
            ("Fenêtres", 15, "#10B981"),
            ("Plancher bas", 10, "#34D399"),
            ("Ponts thermiques", 10, "#6EE7B7"),
            ("Infiltrations d'air", 10, "#DCFCE7"),
        ])
        dark_labels = {"Toiture", "Murs"}  # texte blanc sur parts foncées
        d = Drawing(480, 175)
        cx, cy, r = 95, 90, 68
        start = 90
        for i, (label, pct, hex_c) in enumerate(data):
            extent = -360 * (pct / 100.0)
            d.add(Wedge(cx, cy, r, start, start + extent,
                        fillColor=colors.HexColor(hex_c),
                        strokeColor=colors.white, strokeWidth=1.5))
            mid = math.radians(start + extent / 2)
            lx = cx + (r * 0.58) * math.cos(mid)
            ly_lab = cy + (r * 0.58) * math.sin(mid)
            txt_color = colors.white if label in dark_labels else colors.HexColor("#0F766E")
            d.add(String(lx, ly_lab - 3, f"{int(pct)} %", fontSize=8, fontName="Helvetica-Bold",
                         fillColor=txt_color, textAnchor="middle"))
            start += extent
            if i < 2:
                d.add(Circle(cx, cy, r + 4, strokeColor=colors.HexColor(hex_c),
                             strokeWidth=2, fillColor=None))
        d.add(Circle(cx, cy, 28, fillColor=colors.white, strokeColor=colors.HexColor("#0F766E"), strokeWidth=1))
        d.add(String(cx, cy - 4, "55 %", fontSize=11, fontName="Helvetica-Bold",
                     fillColor=colors.HexColor("#0F766E"), textAnchor="middle"))
        d.add(String(cx, cy - 16, "prio.", fontSize=7, fillColor=colors.HexColor("#0F766E"), textAnchor="middle"))
        ly = 150
        for i, (label, pct, hex_c) in enumerate(data):
            prio = " ★" if i < 2 else ""
            d.add(Rect(200, ly - 4, 10, 10, fillColor=colors.HexColor(hex_c),
                       strokeColor=colors.HexColor("#0F766E"), strokeWidth=0.4))
            d.add(String(216, ly - 2, f"{label} : {int(pct)} %{prio}", fontSize=8.5,
                         fillColor=colors.HexColor("#0F766E")))
            ly -= 22
        return d

    def before_after_bar_chart(
        self,
        comparisons: Optional[Sequence[Tuple[str, float, float, str]]] = None,
    ) -> Drawing:
        """comparisons: (label, avant, apres, unite)."""
        comps = list(comparisons or [
            ("Consommation", 577, 117, "kWhEP/m²/an"),
            ("Facture", 2985, 535, "€/an"),
            ("CO₂", 20, 3, "kgCO₂/m²/an"),
        ])
        d = Drawing(480, 155)
        d.add(Rect(0, 0, 480, 155, fillColor=colors.HexColor("#F3F4F6"), strokeColor=None))
        bar_w = 22
        gap = 40
        base_y = 28
        max_h = 95
        for i, (label, avant, apres, unit) in enumerate(comps):
            x0 = 55 + i * 145
            scale = max_h / max(avant, apres, 1)
            h_a = max(8, avant * scale)
            h_b = max(8, apres * scale)
            d.add(Rect(x0, base_y, bar_w, h_a,
                       fillColor=colors.HexColor("#f97316"), strokeColor=None))
            d.add(Rect(x0 + bar_w + 8, base_y, bar_w, h_b,
                       fillColor=C["primary"], strokeColor=None))
            d.add(String(x0 + bar_w / 2, base_y + h_a + 4, f"{int(avant)}",
                         fontSize=7.5, textAnchor="middle", fillColor=colors.HexColor("#9a3412")))
            d.add(String(x0 + bar_w + 8 + bar_w / 2, base_y + h_b + 4, f"{int(apres)}",
                         fontSize=7.5, textAnchor="middle", fillColor=C["primary"]))
            d.add(String(x0 + bar_w + 4, 12, label, fontSize=8, textAnchor="middle",
                         fillColor=C["text"], fontName="Helvetica-Bold"))
            d.add(String(x0 + bar_w + 4, 2, unit, fontSize=6.5, textAnchor="middle",
                         fillColor=C["muted"]))
        d.add(Rect(360, 125, 10, 10, fillColor=colors.HexColor("#f97316"), strokeColor=None))
        d.add(String(374, 127, "Avant", fontSize=8, fillColor=C["text"]))
        d.add(Rect(420, 125, 10, 10, fillColor=C["primary"], strokeColor=None))
        d.add(String(434, 127, "Après", fontSize=8, fillColor=C["text"]))
        return d

    def house_scenario_diagram(self, mode: str = "optimal") -> Drawing:
        """Maison pédagogique : essentiel | optimal | excellence."""
        d = Drawing(480, 195)
        d.add(Rect(0, 0, 480, 195, fillColor=colors.HexColor("#F3F4F6"), strokeColor=None))
        # Sol
        d.add(Rect(40, 20, 280, 8, fillColor=colors.HexColor("#cbd5e1"), strokeColor=None))
        # Façade
        d.add(Rect(80, 28, 180, 90, fillColor=colors.HexColor("#ecfdf5"),
                   strokeColor=C["primary"], strokeWidth=1.5))
        # Toiture
        d.add(Polygon([70, 118, 170, 165, 270, 118],
                      fillColor=C["primary"] if mode != "essentiel" else colors.HexColor("#94a3b8"),
                      strokeColor=C["primary"], strokeWidth=1.2))
        # Porte
        d.add(Rect(155, 28, 28, 42, fillColor=colors.HexColor("#0f766e"), strokeColor=None))
        # Fenêtres
        win_c = C["primary_end"] if mode != "essentiel" else colors.HexColor("#64748b")
        for wx in (95, 220):
            d.add(Rect(wx, 70, 32, 28, fillColor=colors.white, strokeColor=win_c, strokeWidth=1.5))
            d.add(Line(wx + 16, 70, wx + 16, 98, strokeColor=win_c, strokeWidth=0.8))
            d.add(Line(wx, 84, wx + 32, 84, strokeColor=win_c, strokeWidth=0.8))
        if mode == "essentiel":
            d.add(Rect(95, 70, 32, 28, fillColor=colors.HexColor("#DCFCE7"),
                       strokeColor=C["primary"], strokeWidth=2))
        # PAC extérieure
        d.add(Rect(275, 28, 36, 32, fillColor=colors.HexColor("#10b981"),
                   strokeColor=C["primary"], strokeWidth=1))
        d.add(String(293, 40, "PAC", fontSize=7, textAnchor="middle", fillColor=colors.white,
                     fontName="Helvetica-Bold"))
        # Ballon
        d.add(Rect(95, 35, 18, 28, fillColor=colors.HexColor("#34d399"), strokeColor=C["primary"]))
        d.add(String(104, 45, "BT", fontSize=6, textAnchor="middle", fillColor=C["text"]))
        # Labels
        d.add(String(170, 175, "Schéma pédagogique — non contractuel", fontSize=7,
                     textAnchor="middle", fillColor=C["muted"]))
        if mode in ("optimal", "excellence"):
            d.add(String(170, 150, "SARKING 78 m²", fontSize=7.5, textAnchor="middle",
                         fillColor=colors.white, fontName="Helvetica-Bold"))
            d.add(String(300, 100, "Zinguerie", fontSize=7, fillColor=C["primary"]))
            d.add(Line(265, 115, 295, 105, strokeColor=C["primary"], strokeWidth=0.8))
            d.add(String(85, 105, "5 fenêtres", fontSize=7, fillColor=C["primary"]))
            d.add(String(210, 105, "2 portes", fontSize=7, fillColor=C["primary"]))
        if mode == "excellence":
            # Panneaux en pointillés
            for i in range(6):
                x = 95 + i * 22
                d.add(Rect(x, 148, 18, 10, fillColor=colors.HexColor("#bae6fd"),
                           strokeColor=colors.HexColor("#0284c8"), strokeWidth=0.8,
                           strokeDashArray=[2, 2]))
            d.add(String(170, 138, "Option PV 6 kWc (à confirmer)", fontSize=7,
                         textAnchor="middle", fillColor=colors.HexColor("#0369a1")))
            d.add(Rect(320, 55, 50, 28, fillColor=colors.HexColor("#e0f2fe"),
                       strokeColor=colors.HexColor("#0284c8"), strokeWidth=1,
                       strokeDashArray=[3, 2]))
            d.add(String(345, 70, "Batterie", fontSize=7, textAnchor="middle",
                         fillColor=colors.HexColor("#0369a1")))
            d.add(String(345, 58, "7 kWh", fontSize=7, textAnchor="middle",
                         fillColor=colors.HexColor("#0369a1")))
            d.add(Line(260, 155, 320, 80, strokeColor=colors.HexColor("#0284c8"),
                       strokeWidth=0.9, strokeDashArray=[3, 2]))
            d.add(String(380, 120, "☀ → logement → batterie", fontSize=7.5,
                         fillColor=colors.HexColor("#0369a1")))
        # Légende texte droite
        legend = {
            "essentiel": ["Fenêtres prioritaires", "PAC air-air", "Ballon thermo", "Isolation ciblée"],
            "optimal": ["Toiture SARKING", "Menuiseries", "PAC 3 splits", "Ballon EGEO", "Zinguerie"],
            "excellence": ["Rénovation optimale", "+ Option PV 6 kWc", "+ Batterie 7 kWh", "Autoconsommation"],
        }.get(mode, [])
        ly = 160
        for txt in legend:
            d.add(String(370, ly, f"• {txt}", fontSize=8, fillColor=C["text"]))
            ly -= 16
        return d

    def gantt_chantier(self) -> Drawing:
        phases = [
            ("Constitution dossier", 0, 2),
            ("Toiture SARKING", 1, 3),
            ("Zinguerie", 4, 1),
            ("Menuiseries", 5, 1),
            ("PAC air-air", 6, 1),
            ("Ballon thermo", 7, 1),
            ("Finitions", 8, 1),
            ("Réception", 9, 1),
        ]
        d = Drawing(480, 175)
        left, top, row_h, col_w = 110, 155, 16, 34
        d.add(String(240, 165, "Planning prévisionnel S1 → S10", fontSize=9,
                     textAnchor="middle", fontName="Helvetica-Bold", fillColor=C["primary"]))
        for i in range(10):
            x = left + i * col_w
            d.add(String(x + col_w / 2, top + 8, f"S{i + 1}", fontSize=7,
                         textAnchor="middle", fillColor=C["muted"]))
            d.add(Line(x, 18, x, top + 4, strokeColor=colors.HexColor("#e2e8f0"), strokeWidth=0.4))
        for i, (name, start, dur) in enumerate(phases):
            y = top - (i + 1) * row_h
            d.add(String(4, y + 3, name, fontSize=7.5, fillColor=C["text"]))
            d.add(Rect(left + start * col_w + 2, y + 2, dur * col_w - 4, row_h - 5,
                       fillColor=C["primary"] if i % 2 == 0 else C["primary_end"],
                       strokeColor=None))
        d.add(Rect(left, 15, 10 * col_w, 1, fillColor=C["primary"], strokeColor=None))
        return d

    def aids_split_bar(
        self,
        total: float = 52000,
        aides: float = 24000,
        reste: float = 28000,
        mpr: float = 24000,
        cee: float = 0,
    ) -> Drawing:
        d = Drawing(480, 95)
        d.add(String(0, 80, f"Total projet : {int(total):,} € TTC".replace(",", " "),
                     fontSize=9, fontName="Helvetica-Bold", fillColor=C["primary"]))
        bar_x, bar_y, bar_w, bar_h = 0, 42, 480, 26
        w_aides = bar_w * (aides / total) if total else 0
        d.add(Rect(bar_x, bar_y, w_aides, bar_h, fillColor=C["primary"], strokeColor=None))
        d.add(Rect(bar_x + w_aides, bar_y, bar_w - w_aides, bar_h,
                   fillColor=colors.HexColor("#1e3a5f"), strokeColor=None))
        d.add(String(bar_x + 8, bar_y + 8, f"Aides {int(aides):,} €".replace(",", " "),
                     fontSize=8, fillColor=colors.white, fontName="Helvetica-Bold"))
        d.add(String(bar_x + w_aides + 8, bar_y + 8, f"RAC {int(reste):,} €".replace(",", " "),
                     fontSize=8, fillColor=colors.white, fontName="Helvetica-Bold"))
        d.add(String(0, 22, f"MaPrimeRénov' : {int(mpr):,} €".replace(",", " "),
                     fontSize=8, fillColor=C["text"]))
        d.add(String(220, 22, f"Reste à charge net estimé : {int(reste):,} €".replace(",", " "),
                     fontSize=8, fillColor=C["text"], fontName="Helvetica-Bold"))
        return d

    def energy_local_flow(self) -> Drawing:
        """Soleil → PV 6 kWc → logement → batterie 7 kWh."""
        d = Drawing(480, 90)
        boxes = [
            (10, 30, 90, 40, "#fef3c7", "☀ Soleil"),
            (130, 30, 100, 40, "#bae6fd", "Panneaux 6 kWc"),
            (260, 30, 90, 40, "#DCFCE7", "Logement"),
            (380, 30, 90, 40, "#e0f2fe", "Batterie 7 kWh"),
        ]
        for x, y, w, h, col, txt in boxes:
            d.add(Rect(x, y, w, h, fillColor=colors.HexColor(col),
                       strokeColor=C["primary"], strokeWidth=1))
            d.add(String(x + w / 2, y + 15, txt, fontSize=8, textAnchor="middle",
                         fillColor=C["text"], fontName="Helvetica-Bold"))
        for x in (105, 235, 355):
            d.add(Line(x, 50, x + 20, 50, strokeColor=C["primary"], strokeWidth=1.5))
            d.add(String(x + 8, 54, "→", fontSize=10, fillColor=C["primary"]))
        d.add(String(240, 10, "Autoconsommation prioritaire — valeurs à confirmer par étude solaire",
                     fontSize=7, textAnchor="middle", fillColor=C["muted"]))
        return d

    def page_footer_note(self) -> Paragraph:
        return Paragraph(
            f"{ENTREPRISE['nom']} — {HEADER_LABEL}",
            self.s.muted,
        )


# ─────────────────────────────────────────────────────────────────────────────
# PLAN DES 85 PAGES & BUILDER (module audit_sections)
# ─────────────────────────────────────────────────────────────────────────────

from audit_sections import PAGE_PLAN, AuditPageBuilder as _AuditPageBuilderV2  # noqa: E402

assert len(PAGE_PLAN) == TOTAL_PAGES, f"PAGE_PLAN={len(PAGE_PLAN)} ≠ TOTAL_PAGES={TOTAL_PAGES}"


def _make_page_builder(ctx: ClientContext) -> _AuditPageBuilderV2:
    styles = StyleFactory()
    components = PDFComponents(ctx, styles)
    equipe_roles = build_equipe_roles(ctx.total_aides)
    mandat_admin = build_mandat_admin_anah(ctx.total_aides)
    flux_financier = build_flux_financier(ctx.budget, ctx.total_aides, ctx.reste)
    dossier_admin_flux = build_dossier_admin_flux_note(ctx.acompte_30)
    constants = {
        "C": C,
        "ENTREPRISE": ENTREPRISE,
        "CONTACTS": CONTACTS,
        "IDENTITE_LEGALE": IDENTITE_LEGALE,
        "EQUIPE_ROLES": equipe_roles,
        "MANDAT_FINANCIER_ANAH": mandat_admin,
        "MANDAT_ADMIN_ANAH": mandat_admin,
        "FLUX_FINANCIER": flux_financier,
        "PARCOURS_ACCOMPAGNE_NOTE": PARCOURS_ACCOMPAGNE_NOTE,
        "DOSSIER_ADMIN_FLUX_NOTE": dossier_admin_flux,
        "PARCOURS_ADMIN_HUB": PARCOURS_ADMIN_HUB,
        "PLANNING_AVANT_DEMARRAGE": PLANNING_AVANT_DEMARRAGE,
        "PLANNING_PHASE_1": PLANNING_PHASE_1,
        "MAR_FRAIS_TEXTE": MAR_FRAIS_TEXTE,
        "ECOPTZ_TEXTE": ECOPTZ_TEXTE,
        "UMAFI_BLOC": UMAFI_BLOC,
        "UMAFI_MENTIONS_LEGALES": UMAFI_MENTIONS_LEGALES,
        "RGPD_CONSENT_UMAFI": RGPD_CONSENT_UMAFI,
        "HEADER_LABEL": HEADER_LABEL,
        "POSITIONNEMENT_ENERGIA": POSITIONNEMENT_ENERGIA,
        "SYNTHESE_ENCADRE": SYNTHESE_ENCADRE,
        "CONTRACTANT_GENERAL": CONTRACTANT_GENERAL,
        "ECOPTZ_DISCLAIMER": (
            "L'Éco-PTZ est un prêt à taux zéro accordé directement par votre banque. "
            "Délai d'instruction et de déblocage : 2 à 3 mois."
        ),
        "AIDS_DISCLAIMER": AIDS_DISCLAIMER,
        "AIDS_MPR_ONLY_NOTE": AIDS_MPR_ONLY_NOTE,
        "ORDRE_TRAVAUX": ORDRE_TRAVAUX,
        "MPR_TAUX": MPR_TAUX,
        "MPR_PLAFOND": MPR_PLAFOND,
        "format_euro": format_euro,
        "pct_reduction": pct_reduction,
    }
    return _AuditPageBuilderV2(ctx, styles, components, constants)


# ─────────────────────────────────────────────────────────────────────────────
# ASSEMBLAGE PDF
# ─────────────────────────────────────────────────────────────────────────────

class AuditPDFGenerator:
    def __init__(self, client: dict[str, Any]):
        self.ctx = ClientContext(client)
        self.builder = _make_page_builder(self.ctx)
        self._page_counter = 0

    def _on_page(self, canvas, doc):
        self._page_counter += 1
        page = self._page_counter
        canvas.saveState()
        w, h = A4
        if page == 1:
            steps = 50
            for i in range(steps):
                t = i / max(steps - 1, 1)
                r = 0.059 + t * (0.063 - 0.059)
                g = 0.463 + t * (0.725 - 0.463)
                b = 0.431 + t * (0.506 - 0.431)
                canvas.setFillColor(colors.Color(r, g, b))
                y0 = h * i / steps
                y1 = h * (i + 1) / steps
                canvas.rect(0, y0, w, y1 - y0, fill=1, stroke=0)
        if page > 1:
            canvas.setFont(FONT_BODY, 7)
            canvas.setFillColor(C["primary"])
            canvas.drawString(
                20 * mm, h - 12 * mm,
                f"{ENTREPRISE['nom']} — {AUDIT_HEADER_LABEL} | Réf. {self.ctx.ref}",
            )
            canvas.setFillColor(C["muted"])
            canvas.drawRightString(w - 20 * mm, h - 12 * mm, f"Réf. {self.ctx.ref}")
            canvas.setStrokeColor(C["primary"])
            canvas.setLineWidth(1)
            canvas.line(20 * mm, h - 14 * mm, w - 20 * mm, h - 14 * mm)
        canvas.setFont(FONT_BODY, 7)
        canvas.setFillColor(C["muted"])
        footer = f"© 2026 ENERGIA CONSEIL IA® — Confidentiel | Page {page}/{TOTAL_PAGES}"
        canvas.drawCentredString(w / 2, 12 * mm, footer)
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
            pageCompression=1,
            invariant=0,
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
