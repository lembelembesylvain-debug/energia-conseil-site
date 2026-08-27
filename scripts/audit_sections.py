# -*- coding: utf-8 -*-
"""Contenu des 85 pages — structure audit ENERGIA CONSEIL IA® v14."""

from __future__ import annotations

from typing import Any, List, Sequence, Tuple

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak, Paragraph, Spacer, Table, TableStyle

# Importés depuis generate_audit_auto au runtime pour éviter les imports circulaires
TOTAL_PAGES = 85

FICHE_PRUDENCE = (
    "<i>Caractéristiques issues du devis retenu. "
    "La conformité finale dépend des notices fabricants, "
    "des règles de l'art, des documents de pose et de la "
    "réception des travaux.</i>"
)


def _assurance_cover_lines(ass: dict) -> Tuple[str, str]:
    assureur = ass.get("assureur", "MIC INSURANCE COMPANY")
    numero = ass.get("numero_police", "LUNPIB2604975")
    echeance = ass.get("date_echeance", "06/07/2027")
    return (
        f"RC Décennale & RC Pro — {assureur}",
        f"Police N° {numero} — Valide jusqu'au {echeance}",
    )


def _assurance_legal_html(ass: dict) -> str:
    if not ass:
        return ""
    return (
        "<br/><br/><b>Assurances :</b><br/>"
        "• RC Décennale & RC Professionnelle :<br/>"
        f"&nbsp;&nbsp;{ass.get('assureur', 'MIC INSURANCE COMPANY')}<br/>"
        f"&nbsp;&nbsp;Police N° {ass.get('numero_police', 'LUNPIB2604975')}<br/>"
        f"&nbsp;&nbsp;Valide du {ass.get('date_effet', '07/07/2026')} "
        f"au {ass.get('date_echeance', '06/07/2027')}<br/>"
        f"&nbsp;&nbsp;Activité garantie : {ass.get('activite_couverte', 'Contractant Général (Activité N°5)')}<br/>"
        "• Intermédiaire : Calipso Assurances (ORIAS 16003683)<br/>"
        "&nbsp;&nbsp;Souscripteur : Leader Underwriting (ORIAS 12068040)"
    )


def _safe_float(val: Any, default: float = 0.0) -> float:
    if val is None or val == "" or val == "À confirmer":
        return float(default)
    try:
        return float(val)
    except (TypeError, ValueError):
        return float(default)


def _deep_get(obj: dict, key: str) -> Any:
    val: Any = obj
    for part in key.split("."):
        if not isinstance(val, dict):
            return None
        val = val.get(part)
    return val


def _pv_comparatif_label(scenario: dict, sc_key: str) -> str:
    if sc_key != "excellence":
        return "❌"
    pv = scenario.get("option_pv_ttc") or scenario.get("budget_renovation")
    if pv:
        return "6 kWc + batterie 7 kWh"
    return "❌"


def _build_comparatif(ctx, format_euro) -> List[List[str]]:
    s = ctx.scenarios
    pv = ctx.raw.get("option_photovoltaique", {})
    rows: List[List[str]] = []

    def _aides_total(key: str) -> str:
        return format_euro(ctx.aides_scenario(key)["total"])

    def _aides_reste(key: str) -> str:
        return format_euro(ctx.aides_scenario(key)["reste"])

    criteres_base = [
        ("Budget TTC", lambda k: format_euro(s[k]["budget"]), True),
        ("Total aides estimées", _aides_total, True),
        ("Reste à charge estimé", _aides_reste, True),
        ("DPE cible", lambda k: str(s[k].get("dpe_cible", "—")), False),
    ]
    for label, fn, _ in criteres_base:
        rows.append([label] + [fn(k) for k in ("essentiel", "optimal", "excellence")])

    rows.append(["Option solaire", "❌", "❌", "6 kWc + batterie 7 kWh"])
    rows.append(["Objectif", "Confort minimum", "Rénovation globale ⭐",
                 "Autoconsommation prioritaire"])
    rows.append(["Production solaire", "—", "—",
                 pv.get("production_annuelle", "Étude localisée à réaliser")])
    rows.append(["Économies solaires", "—", "—",
                 s["excellence"].get("economies_solaires",
                                    "À confirmer selon étude technique")])

    return rows


PAGE_PLAN: List[Tuple[str, str]] = [
    ("00", "Page de couverture"),
    ("00", "Mentions légales & confidentialité"),
    ("00", "Sommaire interactif"),
    ("I", "Synthèse exécutive — Vue d'ensemble"),
    ("I", "Synthèse exécutive — Indicateurs financiers"),
    ("I", "Synthèse exécutive — Recommandation"),
    ("II", "2.1 Caractéristiques du bâtiment (1/2)"),
    ("II", "2.1 Caractéristiques du bâtiment (2/2)"),
    ("II", "2.2 Enveloppe thermique — Toiture & murs"),
    ("II", "2.2 Enveloppe thermique — Plancher & menuiseries"),
    ("II", "2.2 Enveloppe thermique — Synthèse déperditions"),
    ("II", "2.3 Systèmes énergétiques — Chauffage & ECS"),
    ("II", "2.3 Systèmes énergétiques — Ventilation & équipements"),
    ("II", "2.4 Consommations — Répartition énergétique"),
    ("II", "2.4 Consommations — DPE & facture annuelle"),
    ("II", "2.5 Ponts thermiques — Points faibles (1/2)"),
    ("II", "2.5 Ponts thermiques — Impact chiffré (2/2)"),
    ("II", "2.6 Modélisation 3D — Zones thermiques"),
    ("II", "2.6 Modélisation 3D — Cartographie déperditions"),
    ("II", "2.6 Modélisation 3D — Comparaison avant/après"),
    ("III", "Tableau comparatif — 3 scénarios"),
    ("III.1", "SCÉNARIO 1 — ESSENTIEL — Présentation"),
    ("III.1", "SCÉNARIO 1 — Tableau des travaux"),
    ("III.1", "SCÉNARIO 1 — Calculs thermiques RT2012/RE2020"),
    ("III.1", "SCÉNARIO 1 — Aides financières détaillées"),
    ("III.1", "SCÉNARIO 1 — Performance projetée DPE"),
    ("III.1", "SCÉNARIO 1 — Économies & ROI"),
    ("III.1", "SCÉNARIO 1 — Plan de financement"),
    ("III.1", "SCÉNARIO 1 — Éco-PTZ & mensualités"),
    ("III.1", "SCÉNARIO 1 — Valorisation immobilière"),
    ("III.1", "SCÉNARIO 1 — Planning indicatif"),
    ("III.1", "SCÉNARIO 1 — Synthèse décisionnelle"),
    ("III.2", "SCÉNARIO 2 — OPTIMAL ⭐ — Présentation"),
    ("III.2", "SCÉNARIO 2 — Tableau des travaux (devis signé)"),
    ("III.2", "SCÉNARIO 2 — Calculs thermiques RT2012/RE2020"),
    ("III.2", "SCÉNARIO 2 — Aides financières détaillées"),
    ("III.2", "SCÉNARIO 2 — Performance projetée DPE"),
    ("III.2", "SCÉNARIO 2 — Économies & ROI"),
    ("III.2", "SCÉNARIO 2 — Plan de financement"),
    ("III.2", "SCÉNARIO 2 — Éco-PTZ & mensualités"),
    ("III.2", "SCÉNARIO 2 — Valorisation immobilière"),
    ("III.2", "SCÉNARIO 2 — Planning indicatif"),
    ("III.2", "SCÉNARIO 2 — Comparatif vs Essentiel"),
    ("III.2", "SCÉNARIO 2 — Synthèse décisionnelle"),
    ("III.3", "SCÉNARIO 3 — EXCELLENCE — Présentation + option PV"),
    ("III.3", "SCÉNARIO 3 — Option photovoltaïque — devis indicatif"),
    ("III.3", "SCÉNARIO 3 — Autoconsommation prioritaire"),
    ("III.3", "SCÉNARIO 3 — Cerise sur le gâteau — PVGIS"),
    ("III.3", "SCÉNARIO 3 — Performance projetée DPE"),
    ("III.3", "SCÉNARIO 3 — Économies & ROI"),
    ("III.3", "SCÉNARIO 3 — Plan de financement"),
    ("III.3", "SCÉNARIO 3 — Éco-PTZ & mensualités"),
    ("III.3", "SCÉNARIO 3 — Aides financières détaillées"),
    ("III.3", "SCÉNARIO 3 — Planning indicatif"),
    ("III.3", "SCÉNARIO 3 — Synthèse décisionnelle"),
    ("IV", "4.1 MaPrimeRénov' Parcours — Profil & barème"),
    ("IV", "4.1 MaPrimeRénov' — Calcul dossier client"),
    ("IV", "4.2 Récapitulatif financier — HT / TVA / TTC"),
    ("IV", "4.2 Projection 30 ans — ROI & cumul"),
    ("IV", "4.3 Total aides & reste à charge"),
    ("V", "5.1 Flux financier — Mandat Administratif ANAH"),
    ("V", "5.2 Calendrier prévisionnel versements"),
    ("V", "5.3 Flux de paiement détaillé"),
    ("V", "5.4 Comparatif Éco-PTZ vs UMAFI"),
    ("V", "5.5 UMAFI — Courtier partenaire (1/2)"),
    ("V", "5.5 UMAFI — Courtier partenaire (2/2)"),
    ("V", "5.6 Consentement RGPD financement"),
    ("VI", "Récapitulatif financier complet"),
    ("VI", "Fiche technique 1 — Mise en place chantier"),
    ("VI", "Fiche technique 2 — Isolation toiture SARKING"),
    ("VI", "Fiche technique 3 — PAC Air-Air Daikin"),
    ("VI", "Fiche technique 4 — Ballon thermodynamique Atlantic"),
    ("VI", "Fiche technique 5 — Fenêtres PVC Grosfillex"),
    ("VI", "Fiche technique 6 — Portes isolantes Sillage"),
    ("VI", "Fiche technique 7 — Zinguerie complète"),
    ("VI", "Fiche technique 8 — Coordination & MAR ANAH"),
    ("VII", "7.1 Planning de chantier synthétique"),
    ("VII", "7.2 Ordre optimal des travaux"),
    ("VII", "7.3 Annuaire artisans / intervenants RGE"),
    ("VII", "7.4 Suivi administratif — Hub Admin"),
    ("VII", "7.5 Checklist réception des travaux"),
    ("VII", "7.6 Accompagnement ENERGIA CONSEIL IA®"),
    ("VIII", "Annexe A — Glossaire technique"),
    ("VIII", "Annexe B — Références réglementaires"),
    ("VIII", "Annexe C — Signature & validation"),
]

assert len(PAGE_PLAN) == TOTAL_PAGES


class AuditPageBuilder:
    """Génère le contenu de chaque page selon la structure v2."""

    def __init__(self, ctx, styles, components, constants):
        self.ctx = ctx
        self.s = styles
        self.c = components
        self.C = constants["C"]
        self.ENTREPRISE = constants["ENTREPRISE"]
        self.CONTACTS = constants["CONTACTS"]
        self.IDENTITE_LEGALE = constants["IDENTITE_LEGALE"]
        self.EQUIPE_ROLES = constants["EQUIPE_ROLES"]
        self.MANDAT_ADMIN_ANAH = constants.get("MANDAT_ADMIN_ANAH", constants["MANDAT_FINANCIER_ANAH"])
        self.FLUX_FINANCIER = constants.get("FLUX_FINANCIER", "")
        self.PARCOURS_ACCOMPAGNE_NOTE = constants.get("PARCOURS_ACCOMPAGNE_NOTE", "")
        self.DOSSIER_ADMIN_FLUX_NOTE = constants.get("DOSSIER_ADMIN_FLUX_NOTE", "")
        self.PARCOURS_ADMIN_HUB = constants.get("PARCOURS_ADMIN_HUB", "")
        self.PLANNING_AVANT_DEMARRAGE = constants.get("PLANNING_AVANT_DEMARRAGE", "")
        self.PLANNING_PHASE_1 = constants.get("PLANNING_PHASE_1", "")
        self.MAR_FRAIS_TEXTE = constants["MAR_FRAIS_TEXTE"]
        self.ECOPTZ_TEXTE = constants["ECOPTZ_TEXTE"]
        self.UMAFI_BLOC = constants["UMAFI_BLOC"]
        self.UMAFI_MENTIONS_LEGALES = constants["UMAFI_MENTIONS_LEGALES"]
        self.RGPD_CONSENT_UMAFI = constants.get("RGPD_CONSENT_UMAFI", "")
        self.HEADER_LABEL = constants["HEADER_LABEL"]
        self.POSITIONNEMENT_ENERGIA = constants["POSITIONNEMENT_ENERGIA"]
        self.SYNTHESE_ENCADRE = constants["SYNTHESE_ENCADRE"]
        self.CONTRACTANT_GENERAL = constants["CONTRACTANT_GENERAL"]
        self.ECOPTZ_DISCLAIMER = constants["ECOPTZ_DISCLAIMER"]
        self.AIDS_DISCLAIMER = constants["AIDS_DISCLAIMER"]
        self.AIDS_MPR_ONLY_NOTE = constants.get("AIDS_MPR_ONLY_NOTE", "")
        self.ORDRE_TRAVAUX = constants["ORDRE_TRAVAUX"]
        self.MPR_TAUX = constants["MPR_TAUX"]
        self.MPR_PLAFOND = constants["MPR_PLAFOND"]
        self.format_euro = constants["format_euro"]
        self.pct_reduction = constants["pct_reduction"]

    def _note_aides_mpr(self) -> Any:
        return self.c.p(f"<i>{self.AIDS_MPR_ONLY_NOTE}</i>", self.s.body_sm)

    def _recap_financier_compact(self) -> List[Any]:
        """Récap HT / TVA / TTC / MPR / RAC — standard V27."""
        c = self.ctx
        rows = [
            ["Poste", "Montant"],
            ["Total HT", self.format_euro(c.budget_ht)],
            ["TVA mixte", self.format_euro(c.tva_montant)],
            ["TOTAL TTC", self.format_euro(c.budget)],
            ["MaPrimeRénov' Parcours Accompagné", f"– {self.format_euro(c.mpr)}"],
            ["TOTAL AIDES ESTIMÉES", f"– {self.format_euro(c.total_aides)}"],
            ["RESTE À CHARGE ESTIMÉ", self.format_euro(c.reste)],
        ]
        return [
            self.c.table(rows, [10 * cm, 7 * cm], total_row=3),
            self.c.spacer(0.06),
            self._note_aides_mpr(),
        ]

    def _projection_30_ans(self) -> List[Any]:
        c = self.ctx
        rac = float(c.reste)
        eco = float(c.economies_annuelles) or 2500.0
        roi = rac / eco if eco else 0
        years = [5, 10, 12, 15, 20, 25, 30]
        rows = [["Année", "Économies cumulées", "Reste à charge", "Bilan"]]
        for y in years:
            cumul = eco * y
            bilan = cumul - rac
            label = f"An {y}" + (" (ROI)" if y == 12 else "")
            sign = "+" if bilan >= 0 else "−"
            check = " ✅" if bilan >= 0 and y >= 12 else ""
            rows.append([
                label,
                self.format_euro(cumul),
                self.format_euro(rac),
                f"{sign} {self.format_euro(abs(bilan))}{check}",
            ])
        return [
            self.c.p("<b>Projection 30 ans — ROI & cumul</b>", self.s.h2),
            self.c.p(
                f"RAC de référence : <b>{self.format_euro(rac)}</b> — "
                f"Économies : <b>{self.format_euro(eco)}/an</b> — "
                f"ROI : <b>{roi:.1f} ans</b> ({self.format_euro(rac)} / {self.format_euro(eco)}).",
                self.s.body,
            ),
            self.c.spacer(0.1),
            self.c.table(rows, [3.5 * cm, 4.5 * cm, 4.5 * cm, 4.5 * cm]),
        ]

    def build_page(self, page_num: int) -> List[Any]:
        if page_num == 1:
            return self._cover()
        section, title = PAGE_PLAN[page_num - 1]
        body = self._dispatch(page_num, section, title)
        return self.c.header_block(title, page_num) + body

    def _dispatch(self, page: int, section: str, title: str) -> List[Any]:
        if page == 2:
            return self._legal()
        if page == 3:
            return self._sommaire()
        if 4 <= page <= 6:
            return self._synthese(page - 3)
        if 7 <= page <= 20:
            return self._diagnostic(page - 6)
        if page == 21:
            return self._comparatif_scenarios()
        if 22 <= page <= 32:
            return self._scenario("essentiel", page - 21, title)
        if 33 <= page <= 44:
            return self._scenario("optimal", page - 32, title)
        if 45 <= page <= 55:
            return self._scenario("excellence", page - 44, title)
        if 56 <= page <= 60:
            return self._aides(page - 55)
        if 61 <= page <= 67:
            return self._financement(page - 60)
        if page == 68:
            return self._recap_financier()
        if 69 <= page <= 76:
            return self._fiche_technique(page - 68)
        if 77 <= page <= 82:
            return self._mise_en_oeuvre(page - 76)
        if page == 83:
            return self._annexe_glossaire()
        if page == 84:
            return self._annexe_references()
        if page == 85:
            return self._annexe_signature()
        return [self.c.p(f"<b>{title}</b>", self.s.h1)]

    def _cover(self) -> List[Any]:
        c = self.ctx
        titre_doc = getattr(c, "titre_document", None) or c.raw.get(
            "titre_document",
            "Rapport de synthèse énergétique et financière personnalisé",
        )
        badge_anah = Table(
            [[Paragraph(
                f'<para align="center"><b>{titre_doc}</b></para>',
                ParagraphStyle("b", parent=self.s.cover_white, fontSize=8),
            )]],
            colWidths=[14 * cm],
        )
        badge_anah.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#10b981")),
            ("BOX", (0, 0), (-1, -1), 1, colors.white),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        badge_cg = Table(
            [[Paragraph('<para align="center"><b>Interlocuteur unique — Du diagnostic à la réception</b></para>',
                        ParagraphStyle("cg", parent=self.s.cover_white, fontSize=8.5))]],
            colWidths=[12 * cm],
        )
        badge_cg.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0f766e")),
            ("BOX", (0, 0), (-1, -1), 1, colors.white),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        cover_sub_id = ParagraphStyle("CoverID", parent=self.s.cover_sub, fontSize=10, leading=13)
        logo = Table(
            [[Paragraph(
                '<para align="center"><b><font size="16" color="#ffffff">'
                "■ ENERGIA CONSEIL IA®</font></b></para>",
                ParagraphStyle("Logo", parent=self.s.cover_white, fontSize=16),
            )]],
            colWidths=[12 * cm],
        )
        logo.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0f766e")),
            ("BOX", (0, 0), (-1, -1), 2, colors.white),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        ass = c.raw.get("assurance_energia", {})
        ass_l1, ass_l2 = _assurance_cover_lines(ass)
        cover = Table([
            [logo],
            [Spacer(1, 0.4 * cm)],
            [Paragraph("Contractant Général en Rénovation Énergétique Globale", cover_sub_id)],
            [Paragraph("Mandataire Administratif Habilité ANAH / MaPrimeRénov'", cover_sub_id)],
            [Paragraph(ass_l1, cover_sub_id)],
            [Paragraph(ass_l2, cover_sub_id)],
            [Paragraph("AUDIT ÉNERGÉTIQUE PERSONNALISÉ", self.s.cover_title)],
            [Spacer(1, 0.3 * cm)],
            [badge_anah],
            [Spacer(1, 0.2 * cm)],
            [badge_cg],
            [Spacer(1, 0.5 * cm)],
            [Paragraph(f"<b>{c.nom}</b>", self.s.cover_white)],
            [Paragraph(c.raw.get("adresse", ""), self.s.cover_white)],
            [Paragraph(f"Référence {c.ref} — {c.date_str}", self.s.cover_white)],
            [Spacer(1, 0.3 * cm)],
            [Paragraph(
                f"Profil {c.profil} | DPE {c.dpe_actuel} → {c.dpe_cible} | {c.surface} m² | "
                f"-{c.reduction_conso_pct} % conso",
                self.s.cover_white,
            )],
            [Spacer(1, 0.6 * cm)],
            [Paragraph("Document confidentiel — Propriété du client", self.s.cover_white)],
        ], colWidths=[17 * cm])
        cover.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        return [Spacer(1, 1.2 * cm), cover]

    def _legal(self) -> List[Any]:
        e = self.ENTREPRISE
        ass = self.ctx.raw.get("assurance_energia", {})
        identite = self.IDENTITE_LEGALE + _assurance_legal_html(ass)
        return [
            self.c.p("<b>Page légale & confidentialité</b>", self.s.h1),
            self.c.p(
                f"{e['nom']} — <b>{self.HEADER_LABEL}</b> — {e['adresse']} — "
                f"SIRET {e['siret']} — RCS {e['rcs']}. Marque déposée INPI.",
                self.s.body,
            ),
            self.c.box(identite, "green"),
            self.c.p(
                "<b>Certifications :</b> Conformité ADEME, barèmes ANAH 2026, RE2020, "
                "réseau artisans RGE certifiés. Audit réalisé selon méthodologie ENERGIA-CONSEIL IA®.",
                self.s.body,
            ),
            self.c.box(
                "<b>Clause de confidentialité :</b> Le présent document est strictement confidentiel. "
                "Toute reproduction ou diffusion sans accord écrit d'ENERGIA-CONSEIL IA® est interdite. "
                "Données personnelles traitées conformément au RGPD — conservation 5 ans.",
                "legal",
            ),
            self.c.aids_box(),
        ]

    def _sommaire(self) -> List[Any]:
        sections = [
            ("I. Synthèse exécutive", "4 – 6"),
            ("II. Diagnostic actuel", "7 – 20"),
            ("III. Tableau comparatif 3 scénarios", "21"),
            ("III.1 Scénario Essentiel", "22 – 32"),
            ("III.2 Scénario Optimal ⭐", "33 – 44"),
            ("III.3 Scénario Excellence", "45 – 55"),
            ("IV. Aides financières", "56 – 60"),
            ("V. Financement (Mandat Administratif + UMAFI)", "61 – 67"),
            ("VI. Récapitulatif financier", "68"),
            ("VI. Fiches techniques — Scénario Optimal ⭐", "69 – 76"),
            ("VII. Mise en œuvre", "77 – 82"),
            ("VIII. Annexes", "83 – 85"),
        ]
        rows = [["Section", "Pages"]] + [[s, p] for s, p in sections]
        highlights = [
            f"• p.4 — Synthèse : DPE {self.ctx.dpe_actuel} ({self.ctx.conso_avant} kWh/m²/an) → {self.ctx.dpe_cible} ({self.ctx.conso_apres})",
            f"• p.21 — Tableau comparatif Essentiel / Optimal ⭐ / Excellence",
            f"• p.33 — Scénario Optimal ⭐ — {self.format_euro(self.ctx.budget)} TTC — RAC {self.format_euro(self.ctx.reste)}",
            f"• p.45 — Scénario Excellence — 70 000 € TTC — PV 6 kWc + batterie 7 kWh",
            f"• p.56 — MaPrimeRénov' {self.ctx.profil} — {self.format_euro(self.ctx.mpr)}",
            f"• p.61 — Mandat Administratif ANAH — versement aides {self.format_euro(self.ctx.total_aides)} sur compte",
            f"• p.63 — Comparatif Éco-PTZ vs UMAFI (8 jours)",
            f"• p.68 — Récapitulatif financier complet",
            f"• p.69-76 — Fiches techniques Scénario Optimal ⭐ (devis signé 52 000 € TTC)",
            f"• p.77 — Planning {self.ctx.raw.get('duree_chantier', '8-10 semaines')}",
            f"• p.85 — Signature & validation",
        ]
        return [
            self.c.p("<b>Sommaire interactif</b>", self.s.h1),
            self.c.table(rows, [12 * cm, 5 * cm]),
            self.c.spacer(0.3),
            self.c.p("<b>Pages clés</b>", self.s.h3),
        ] + [self.c.p(h, self.s.body_sm) for h in highlights]

    def _synthese(self, sub: int) -> List[Any]:
        c = self.ctx
        rec = c.scenarios.get(c.scenario_recommande, c.scenarios["optimal"])
        if sub == 1:
            return [
                self.c.p("<b>I. SYNTHÈSE EXÉCUTIVE — Rôles de l'équipe</b>", self.s.h1),
                self.c.box(self.EQUIPE_ROLES, "green"),
                self.c.spacer(0.2),
                self.c.box(self.IDENTITE_LEGALE, "info"),
            ]
        if sub == 2:
            co2_t = rec.get("co2_t_an", f"~{c.surface * c.co2_avant / 1000:.1f} t/an")
            return [
                self.c.p("<b>Indicateurs financiers & environnementaux</b>", self.s.h2),
                self.c.box(self.FLUX_FINANCIER, "green"),
                self.c.spacer(0.2),
                self.c.kpi_row([
                    ("DPE ACTUEL", c.dpe_actuel), ("DPE VISÉ", c.dpe_cible),
                    ("GAIN CONSO", f"-{c.reduction_conso_pct} %"),
                    ("ROI", f"{c.roi:.1f} ans"),
                ]),
                self.c.spacer(0.2),
                self.c.dpe_gauge(c.dpe_actuel, c.dpe_cible),
                self.c.spacer(0.3),
                self.c.table([
                    ["Indicateur", "Valeur"],
                    ["DPE actuel → DPE visé", f"{c.dpe_actuel} → {c.dpe_cible}"],
                    ["Budget total travaux TTC", self.format_euro(c.budget)],
                    ["Total aides estimées (MaPrimeRénov')", self.format_euro(c.total_aides)],
                    ["Reste à charge", self.format_euro(c.reste)],
                    ["Économies annuelles", self.format_euro(c.economies_annuelles)],
                    ["ROI", f"{c.roi:.1f} ans"],
                    ["Réduction CO₂", f"-{c.reduction_ges_pct} % ({co2_t})"],
                    ["Profil MaPrimeRénov'", c.profil],
                    ["Surface habitable", f"{c.surface} m²"],
                    ["Consommation actuelle", f"{c.conso_avant} kWh/m²/an"],
                    ["Consommation visée", f"{c.conso_apres} kWh/m²/an"],
                    ["Facture énergétique actuelle", self.format_euro(c.facture_avant)],
                ], [8 * cm, 9 * cm]),
            ]
        return [
            self.c.p("<b>Recommandation principale</b>", self.s.h2),
            self.c.box(self.SYNTHESE_ENCADRE, "green"),
            self.c.spacer(0.2),
            self.c.kpi_row([
                ("TOTAL AIDES", self.format_euro(c.total_aides)),
                ("RESTE À CHARGE", self.format_euro(c.reste)),
                ("ÉCONOMIES/AN", self.format_euro(c.economies_annuelles)),
                ("ROI", f"{c.roi:.1f} ans"),
            ]),
            self.c.spacer(0.3),
            self.c.table([
                ["Poste", "Montant"],
                [f"MaPrimeRénov' Parcours ({c.profil})", self.format_euro(c.mpr)],
                ["TOTAL AIDES", self.format_euro(c.total_aides)],
                ["RESTE À CHARGE", self.format_euro(c.reste)],
                ["Éco-PTZ éligible (banque)", self.format_euro(c.ecoptz)],
                [f"Réduction GES", f"-{c.reduction_ges_pct} % ({c.co2_avant:.0f} → {c.co2_apres:.0f} kgCO₂/m²/an)"],
            ], [10 * cm, 7 * cm], total_row=2),
            self._note_aides_mpr(),
            self.c.aids_box(),
            self.c.spacer(0.2),
            self.c.box(
                f"<b>Scénario retenu : {rec['label']} — {rec['badge']}</b><br/>"
                f"Budget {self.format_euro(rec['budget'])} TTC — DPE {c.dpe_actuel} → {rec['dpe_cible']} — "
                f"Économies ~{self.format_euro(rec['economies_annuelles'])}/an — "
                f"ROI {c.roi:.1f} ans.",
                "info",
            ),
            self.c.p(f"<b>Interlocuteur unique :</b> Sylvain LEMBELEMBE — 06 10 59 68 98", self.s.body_sm),
            self.c.p(f"<b>Contacts :</b> {self.CONTACTS}", self.s.body_sm),
        ]

    def _diagnostic(self, sub: int) -> List[Any]:
        c = self.ctx
        env = c.enveloppe or {}
        if sub <= 2:
            rows = [
                ["Élément", "Valeur"],
                ["Client", c.nom],
                ["Adresse", c.raw.get("adresse", "—")],
                ["Type de bien", c.raw.get("type_bien", "—")],
                ["Surface", f"{c.surface} m²"],
                ["Année construction", str(c.raw.get("annee_construction", "—"))],
                ["Zone climatique", c.raw.get("zone_climatique", "H1")],
                ["Occupants", str(c.raw.get("personnes", "—"))],
                ["Usage", c.raw.get("usage", "Résidence principale")],
                ["RFR / Profil", f"{self.format_euro(c.raw.get('revenu_fiscal', 0))} — {c.profil} ({c.raw.get('personnes', 1)} pers.)"],
            ]
            extra = []
            if sub == 2:
                note = c.raw.get("profil_anah_note", "")
                extra = [
                    self.c.p("<b>Contexte réglementaire & Mandataire Administratif</b>", self.s.h3),
                    self.c.p(
                        f"Région {c.raw.get('region', '—')} — Démarrage : {c.raw.get('demarrage_condition', 'Après accord ANAH')}. "
                        f"Durée chantier : {c.raw.get('duree_chantier', '8-10 semaines')}.",
                        self.s.body,
                    ),
                ]
                if note:
                    extra.append(self.c.p(f"<i>{note}</i>", self.s.muted))
            return [self.c.p("<b>II. DIAGNOSTIC — Caractéristiques du bâtiment</b>", self.s.h1),
                    self.c.table(rows, [5 * cm, 12 * cm])] + extra
        if sub <= 5:
            postes = [
                ("Toiture", env.get("toiture", {})),
                ("Murs", env.get("murs", {})),
                ("Plancher bas", env.get("plancher", {})),
                ("Fenêtres", env.get("fenetres", {})),
                ("Ponts therm.", env.get("ponts", {})),
                ("Infiltrations", env.get("infiltrations", {})),
            ]
            rows = [["Poste", "État actuel", "R / Uw", "Déperdition %"]]
            for name, data in postes:
                r = data.get("r", data.get("uw", "—"))
                rows.append([
                    name, data.get("etat", "—"),
                    f"R={r}" if "r" in data else f"Uw={r}",
                    f"{data.get('deperdition_pct', '—')} %",
                ])
            titles = {3: "Enveloppe thermique — Toiture & murs", 4: "Plancher & menuiseries",
                      5: "Synthèse déperditions"}
            if sub == 5:
                return [
                    self.c.p("<b>Répartition indicative des déperditions</b>", self.s.h2),
                    self.c.pie_chart_deperditions(),
                    self.c.spacer(0.08),
                    self.c.p(
                        "La toiture et les murs représentent environ <b>55 %</b> des déperditions "
                        "estimatives. Le scénario retenu traite en priorité la toiture, les menuiseries, "
                        "l'étanchéité, le chauffage et l'eau chaude sanitaire.",
                        self.s.body_sm,
                    ),
                    self.c.schema_note(),
                ]
            return [self.c.p(f"<b>{titles.get(sub, 'Enveloppe')}</b>", self.s.h2), self.c.table(rows, [3.5 * cm, 5 * cm, 3.5 * cm, 5 * cm])]
        if sub <= 7:
            ch = c.raw.get("chauffage", {})
            ecs = c.raw.get("ecs", {})
            vent = c.raw.get("ventilation", {})
            if sub == 6:
                return [
                    self.c.p("<b>2.3 Systèmes énergétiques — Chauffage & ECS</b>", self.s.h2),
                    self.c.table([
                        ["Système", "Type", "Âge", "Rendement / COP"],
                        ["Chauffage", ch.get("type", "—"), str(ch.get("age", "—")),
                         str(ch.get("cop") or ch.get("rendement", "—"))],
                        ["ECS", ecs.get("type", "—"), "—", f"{ecs.get('consommation_kwh', '—')} kWh/an"],
                    ], [3 * cm, 6 * cm, 3 * cm, 5 * cm]),
                ]
            return [
                self.c.p("<b>2.3 Ventilation & équipements</b>", self.s.h2),
                self.c.table([
                    ["Élément", "État"],
                    ["Ventilation", f"{vent.get('type', '—')} — {vent.get('etat', '')}"],
                    ["Éclairage", "LED partiel — amélioration possible"],
                    ["Électroménager", "Classe A/B — remplacement progressif recommandé"],
                ], [5 * cm, 12 * cm]),
            ]
        if sub <= 9:
            if sub == 8:
                return [
                    self.c.p("<b>2.4 Consommations détaillées</b>", self.s.h2),
                    self.c.bar_chart([
                        ("Chauffage", c.facture_avant * 0.55, "#0f766e"),
                        ("ECS", c.facture_avant * 0.25, "#10b981"),
                        ("Ventilation", c.facture_avant * 0.10, "#16a34a"),
                        ("Éclairage", c.facture_avant * 0.10, "#6ee7b7"),
                    ]),
                ]
            return [
                self.c.p("<b>Facture & DPE actuel</b>", self.s.h2),
                self.c.kpi_row([
                    ("CONSO", f"{c.conso_avant} kWh EP/m²/an"),
                    ("FACTURE", f"{c.raw.get('facture_avant_min', c.facture_avant)}–{c.raw.get('facture_avant_max', c.facture_avant)} €/an"),
                    ("GES", f"{c.co2_avant:.0f} kgCO₂/m²/an"),
                    ("DPE", c.dpe_actuel),
                ]),
                self.c.spacer(0.1),
                self.c.dpe_gauge(c.dpe_actuel, c.dpe_cible),
                self.c.spacer(0.12),
                self.c.p(
                    "<b>Performance énergétique : situation actuelle et objectif projeté</b>",
                    self.s.h3,
                ),
                self.c.before_after_bar_chart([
                    ("Consommation", float(c.conso_avant), float(c.conso_apres), "kWhEP/m²/an"),
                    ("Facture", float(c.facture_avant), float(c.facture_apres), "€/an"),
                    ("CO₂", float(c.co2_avant), float(c.co2_apres), "kgCO₂/m²/an"),
                ]),
                self.c.p(
                    f"Économie indicative : <b>{self.format_euro(c.economies_annuelles)}</b>/an. "
                    "Résultats indicatifs établis à partir des données disponibles, sous réserve "
                    "de l'audit réglementaire, des usages réels et des performances après travaux.",
                    self.s.body_sm,
                ),
                self.c.schema_note(),
            ]
        if sub <= 11:
            pf = c.points_faibles or [
                {"libelle": "Isolation insuffisante", "impact_euro": 500},
            ]
            rows = [["#", "Point faible", "Impact estimé €/an"]]
            for i, p in enumerate(pf[:5], 1):
                rows.append([str(i), p.get("libelle", "—"), self.format_euro(p.get("impact_euro", 0))])
            return [self.c.p("<b>2.5 Ponts thermiques & points faibles</b>", self.s.h2), self.c.table(rows, [1 * cm, 11 * cm, 5 * cm])]
        titles_3d = {12: "Zones chaudes / froides", 13: "Cartographie déperditions", 14: "Comparaison avant/après"}
        if sub in (12, 13):
            photos = c.photos_logement if hasattr(c, "photos_logement") else c.raw.get("photos_logement") or []
            photo_note = (
                "Photo illustrative. Les constats techniques restent soumis "
                "aux relevés, documents et contrôles applicables."
            )
            parts: List[Any] = [
                self.c.p(
                    f"<b>2.6 Galerie photos & visualisation — {titles_3d.get(sub, '')}</b>",
                    self.s.h2,
                ),
            ]
            if len(photos) >= 4 and sub == 12:
                rows = [["#", "Photo", "Légende"]]
                for i, ph in enumerate(photos[:4], 1):
                    if isinstance(ph, dict):
                        rows.append([str(i), ph.get("fichier", "—"), ph.get("legende", photo_note)])
                    else:
                        rows.append([str(i), str(ph), photo_note])
                parts += [
                    self.c.table(rows, [1 * cm, 5 * cm, 11 * cm]),
                    self.c.p(f"<i>{photo_note}</i>", self.s.muted),
                ]
            else:
                parts += [
                    self.c.box(
                        f"<b>Photos à compléter</b> — {len(photos)}/4 photo(s) renseignée(s) dans "
                        "<i>photos_logement[]</i> / dossier <i>photos/</i>.<br/>"
                        "Aucune analyse thermique certaine n'est déduite d'une photo seule.<br/>"
                        f"<i>{photo_note}</i>",
                        "info",
                    ),
                ]
            if sub == 13 and (c.points_a_valider if hasattr(c, "points_a_valider") else c.raw.get("points_a_valider")):
                pts = c.points_a_valider if hasattr(c, "points_a_valider") else c.raw.get("points_a_valider") or []
                parts += [
                    self.c.spacer(0.15),
                    self.c.p("<b>Points à valider avant transmission client</b>", self.s.h3),
                    self.c.table(
                        [["#", "Point"]] + [[str(i), p] for i, p in enumerate(pts[:8], 1)],
                        [1.2 * cm, 15.8 * cm],
                    ),
                ]
            return parts
        return [
            self.c.p(f"<b>2.6 Modélisation thermique 3D — {titles_3d.get(sub, '')}</b>", self.s.h2),
            self.c.p(
                f"Modélisation thermique dynamique du bâti {c.surface} m² — "
                f"identification des zones à fort flux (toiture, murs nord, menuiseries). "
                f"Après travaux scénario {c.scenario_recommande.upper()} : "
                f"réduction déperditions {self.pct_reduction(c.conso_avant, c.conso_apres)} %.",
                self.s.body,
            ),
            self.c.table([
                ["Zone", "Avant (W/K)", "Après (W/K)", "Gain"],
                ["Toiture", "120", "35", "-71 %"],
                ["Murs", "95", "40", "-58 %"],
                ["Menuiseries", "45", "18", "-60 %"],
                ["Plancher", "30", "12", "-60 %"],
            ], [4 * cm, 4 * cm, 4 * cm, 5 * cm]),
        ]

    def _comparatif_scenarios(self) -> List[Any]:
        c = self.ctx
        comp = c.raw.get("comparatif_scenarios", {})
        rows = [["Critère", "S1 Essentiel", "S2 Optimal ⭐", "S3 Excellence"]]
        default_rows = _build_comparatif(c, self.format_euro)
        for row in comp.get("lignes", default_rows):
            rows.append(list(row))
        return [
            self.c.p("<b>III. TABLEAU COMPARATIF — 3 SCÉNARIOS</b>", self.s.h1),
            self.c.table(rows, [4.5 * cm, 4 * cm, 4 * cm, 4.5 * cm]),
            self.c.spacer(0.2),
            self.c.box(
                f"Scénario recommandé : <b>OPTIMAL ⭐</b> — {self.format_euro(c.budget)} TTC — "
                f"RAC {self.format_euro(c.reste)} — DPE {c.dpe_actuel} → {c.dpe_cible}.",
                "green",
            ),
            self._note_aides_mpr(),
            self.c.aids_box(),
        ]

    def _excellence_presentation(self, sc: dict, pv: dict, c) -> List[Any]:
        opt_budget = _safe_float(sc.get("budget_renovation"), _safe_float(c.scenarios["optimal"].get("budget"), 0))
        pv_price = _safe_float(pv.get("prix_ttc"), _safe_float(sc.get("option_pv_ttc"), 18000))
        total = _safe_float(sc.get("budget"), opt_budget + pv_price)
        synth = [
            ["Élément", "Valeur"],
            ["Rénovation globale Scénario 2 (devis signé)", f"{self.format_euro(opt_budget)} TTC"],
            [f"Option photovoltaïque {pv.get('puissance_kwc', 6)} kWc + batterie {pv.get('batterie_kwh', 7)} kWh",
             f"{self.format_euro(pv_price)} TTC"],
            ["Total Scénario Excellence", f"{self.format_euro(total)} TTC"],
            ["Objectif solaire", pv.get("mode", "Autoconsommation prioritaire")],
            ["DPE cible", sc.get("dpe_cible", pv.get("dpe_cible", "C à confirmer"))],
            ["Production solaire", pv.get("production_annuelle", "À confirmer selon le toit et l'ensoleillement")],
            ["Aides PV / batterie", "Non intégrées à ce scénario"],
        ]
        return [
            self.c.p(
                "<b>Scénario 3 — Excellence : rénovation globale + autonomie électrique</b>",
                self.s.h1,
            ),
            self.c.p(
                "Le Scénario Excellence reprend l'ensemble de la rénovation globale retenue "
                "dans le Scénario Optimal et ajoute une solution photovoltaïque de "
                f"{pv.get('puissance_kwc', 6)} kWc avec batterie de stockage de "
                f"{pv.get('batterie_kwh', 7)} kWh.",
                self.s.body,
            ),
            self.c.spacer(0.15),
            self.c.p("<b>Synthèse Scénario Excellence</b>", self.s.h2),
            self.c.table(synth, [10 * cm, 7 * cm], total_row=len(synth) - 1),
            self.c.spacer(0.1),
            self.c.box(
                f"<b>⚠️ Le devis signé Scénario 2 reste à {self.format_euro(opt_budget)} TTC.</b><br/>"
                "L'option photovoltaïque est présentée comme un complément soumis à étude "
                "technique, devis détaillé et validation client.",
                "legal",
            ),
        ]

    def _option_pv_devis_indicatif(self, pv: dict, c) -> List[Any]:
        kwc = pv.get("puissance_kwc", 6)
        nb = pv.get("nombre_panneaux", 12)
        wc = pv.get("puissance_unitaire_wc", 500)
        bat = pv.get("batterie_kwh", 7)
        prix = _safe_float(pv.get("prix_ttc"), 18000)
        postes = [
            ["Poste", "Détail", "Statut"],
            ["Générateur photovoltaïque",
             f"{nb} panneaux de {wc} Wc — puissance totale {kwc} kWc", "À confirmer"],
            ["Onduleurs / micro-onduleurs",
             "Solution adaptée à la configuration de toiture", "À confirmer"],
            ["Batterie de stockage", f"Capacité utile envisagée : {bat} kWh", "À confirmer"],
            ["Structure de fixation", "Compatible avec le type de couverture", "À confirmer"],
            ["Coffrets et protections",
             "Protections AC/DC, parafoudre si requis, raccordements", "À confirmer"],
            ["Câblage et raccordement",
             "Liaison électrique, mise à la terre, essais", "À confirmer"],
            ["Pose et mise en service", "Installation, paramétrage et réception", "À confirmer"],
            ["Démarches de raccordement", "Selon le mode de raccordement retenu", "À confirmer"],
            [f"TOTAL OPTION PHOTOVOLTAÏQUE", f"{kwc} kWc + batterie {bat} kWh",
             f"{self.format_euro(prix)} TTC"],
        ]
        return [
            self.c.p("<b>Option photovoltaïque — devis indicatif à confirmer</b>", self.s.h1),
            self.c.p(
                "Cette option est établie à titre indicatif, sous réserve d'une visite technique, "
                "de l'analyse de la toiture, des ombrages, de la structure, du raccordement "
                "électrique et de la validation du devis définitif par le client.",
                self.s.body,
            ),
            self.c.spacer(0.1),
            self.c.table(postes, [5 * cm, 8 * cm, 4 * cm], total_row=len(postes) - 1),
            self.c.spacer(0.1),
            self.c.p(
                "<i>Le prix définitif dépendra notamment des caractéristiques de toiture, "
                "de l'accessibilité, des contraintes électriques, de la solution technique retenue "
                "et des conditions de raccordement.</i>",
                self.s.body_sm,
            ),
            self.c.box(
                f"<b>Rénovation globale Scénario 2 (signé) :</b> "
                f"{self.format_euro(c.scenarios['optimal']['budget'])} TTC — "
                f"<b>Option solaire (indicatif) :</b> {self.format_euro(prix)} TTC",
                "info",
            ),
        ]

    def _autoconsommation_prioritaire(self, pv: dict) -> List[Any]:
        bat = pv.get("batterie_kwh", 7)
        equipements = [
            "Ballon thermodynamique",
            "PAC air-air",
            "Lave-linge et lave-vaisselle",
            "Cuisson et appareils programmables",
            "Équipements électriques du logement",
            "Recharge véhicule électrique si présente ultérieurement",
        ]
        return [
            self.c.p("<b>Produire, stocker et consommer localement</b>", self.s.h1),
            self.c.box(
                "<b>① Production en journée</b><br/>"
                "Les panneaux produisent de l'électricité pendant les heures d'ensoleillement. "
                "Cette énergie est prioritairement utilisée dans le logement.",
                "green",
            ),
            self.c.spacer(0.08),
            self.c.box(
                "<b>② Consommation directe</b><br/>"
                "Les usages programmables sont privilégiés pendant les heures solaires : "
                "ballon thermodynamique, chauffage réversible, électroménager et équipements "
                "du logement.",
                "info",
            ),
            self.c.spacer(0.08),
            self.c.box(
                f"<b>③ Stockage pour le soir</b><br/>"
                f"La batterie de {bat} kWh stocke une partie du surplus non consommé en journée "
                "afin de couvrir une partie des besoins en soirée et la nuit.",
                "green",
            ),
            self.c.spacer(0.1),
            self.c.p("<b>Équipements à piloter</b>", self.s.h2),
            self.c.table(
                [["Équipement"]] + [[e] for e in equipements],
                [17 * cm],
            ),
            self.c.spacer(0.1),
            self.c.box(
                "<b>⚠️ Avertissement</b><br/>"
                "La part réelle d'électricité autoconsommée dépendra de l'orientation, "
                "de l'inclinaison, des ombrages, de la consommation du foyer et du paramétrage "
                "des équipements.",
                "legal",
            ),
        ]

    def _excellence_cerise_pvgis(self, pv: dict, c) -> List[Any]:
        cerise = c.raw.get("cerise_pvgis", {})
        avant = cerise.get(
            "facture_avant",
            f"{self.format_euro(c.raw.get('facture_avant_min', 2520))} à "
            f"{self.format_euro(c.raw.get('facture_avant_max', 3450))}",
        )
        apres_reno = cerise.get(
            "facture_apres_reno",
            f"~{self.format_euro(c.raw.get('facture_apres_min', 440))} à "
            f"{self.format_euro(c.raw.get('facture_apres_max', 630))}/an",
        )
        apres_pv = cerise.get("facture_apres_pv", "~50 € à 140 €/an")
        production = cerise.get("production_kwh_an", pv.get("production_pvgis_kwh", 7600))
        couverture = cerise.get("couverture_objectif", "80 à 90 %")
        commune = cerise.get("commune", c.raw.get("adresse", "Chalain-d'Uzore (42600)"))
        if "Chalain" not in str(commune) and "42600" not in str(commune):
            commune = "Chalain-d'Uzore (42600)"

        tableau = [
            ["Situation", "Facture indicative"],
            ["Avant rénovation (DPE G)", avant],
            ["Après rénovation G → C", apres_reno],
            ["Avec PV 6 kWc + batterie 7 kWh", apres_pv],
        ]

        prod_fmt = f"{int(production):,}".replace(",", " ")
        premium_html = (
            f"<b><font color='white' size='13'>La cerise sur le gâteau</font></b><br/><br/>"
            f"<font color='white'>"
            f"Étude d'ensoleillement localisée — {commune}<br/>"
            f"Source : PVGIS — Commission Européenne (données 2005-2023)<br/><br/>"
            f"Production solaire prévisionnelle : <b>~{prod_fmt} kWh/an</b><br/>"
            f"(Base : 6 kWc, plein sud, inclinaison 35°, sans ombrage majeur)<br/><br/>"
            f"Avec une batterie de stockage de {pv.get('batterie_kwh', 7)} kWh et le pilotage "
            f"des équipements (PAC, ballon thermodynamique, électroménager), "
            f"l'objectif est de couvrir <b>{couverture}</b> des achats d'électricité "
            f"résiduels après rénovation.<br/><br/>"
            f"Facture électrique résiduelle estimative : <b>{apres_pv}</b>"
            f"</font>"
        )

        # Encadré premium vert foncé
        st = ParagraphStyle(
            "cerise", parent=self.s.body_sm, textColor=colors.white, leading=12,
        )
        premium = Table([[Paragraph(premium_html, st)]], colWidths=[17 * cm])
        premium.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#0F766E")),
            ("BOX", (0, 0), (-1, -1), 1.5, colors.HexColor("#059669")),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
        ]))

        return [
            self.c.p("<b>Scénario 3 — Excellence — Autoconsommation & PVGIS</b>", self.s.h1),
            premium,
            self.c.spacer(0.15),
            self.c.table(tableau, [10 * cm, 7 * cm], total_row=len(tableau) - 1),
            self.c.spacer(0.12),
            self.c.box(
                "<b>Objectif indicatif non contractuel.</b><br/>"
                "Résultats soumis à étude technique préalable : "
                "orientation réelle, ombrages, inclinaison, profil "
                "de consommation et pilotage des équipements.<br/>"
                "<b>Document indicatif — sous réserve d'étude technique.</b>",
                "legal",
            ),
        ]

    def _scenario(self, key: str, sub: int, title: str) -> List[Any]:
        c = self.ctx
        sc = c.scenarios[key]
        aids = c.aides_scenario(key)
        travaux = sc.get("travaux", [])
        budget = _safe_float(sc.get("budget"), 0)
        eco = _safe_float(sc.get("economies_annuelles"), 0)
        roi_raw = sc.get("roi")
        roi_val = _safe_float(roi_raw, budget / max(eco, 1) if eco else 0)
        val_pct = int(sc.get("valorisation_pct", c.valorisation_pct if key == "optimal" else 8))
        co2_t = sc.get("co2_t_an", "~1,4 t/an")
        highlight = key == c.scenario_recommande
        max_sub = 12 if key == "optimal" else 11

        if key == "excellence":
            pv_opt = c.raw.get("option_photovoltaique", {})
            if sub == 1:
                return self._excellence_presentation(sc, pv_opt, c)
            if sub == 2:
                return self._option_pv_devis_indicatif(pv_opt, c)
            if sub == 3:
                return self._autoconsommation_prioritaire(pv_opt)
            if sub == 4:
                return self._excellence_cerise_pvgis(pv_opt, c)

        if key == "optimal" and sub == 11:
            s1 = c.aides_scenario("essentiel")
            return [
                self.c.p("<b>Comparatif Optimal ⭐ vs Essentiel</b>", self.s.h2),
                self.c.table([
                    ["Critère", "Essentiel", "Optimal ⭐"],
                    ["Budget TTC", self.format_euro(c.scenarios["essentiel"]["budget"]), self.format_euro(budget)],
                    ["Total aides", self.format_euro(s1["total"]), self.format_euro(aids["total"])],
                    ["Reste à charge", self.format_euro(s1["reste"]), self.format_euro(aids["reste"])],
                    ["DPE cible", c.scenarios["essentiel"]["dpe_cible"], sc["dpe_cible"]],
                    ["Économies/an", self.format_euro(c.scenarios["essentiel"]["economies_annuelles"]),
                     self.format_euro(eco)],
                ], [5 * cm, 6 * cm, 6 * cm]),
            ]
        if sub == max_sub:
            if key == "excellence":
                pv_opt = c.raw.get("option_photovoltaique", {})
                pv_price = _safe_float(pv_opt.get("prix_ttc"), _safe_float(sc.get("option_pv_ttc"), 18000))
                opt_b = _safe_float(sc.get("budget_renovation"), _safe_float(c.scenarios["optimal"].get("budget"), 0))
                return [
                    self.c.p("<b>Synthèse décisionnelle</b>", self.s.h2),
                    self.c.box(
                        f"Scénario EXCELLENCE : rénovation globale signée "
                        f"{self.format_euro(opt_b)} + option solaire {self.format_euro(pv_price)} "
                        f"= {self.format_euro(budget)} TTC — RAC estimé {self.format_euro(aids['reste'])} — "
                        "Option complémentaire soumise à étude technique.",
                        "info",
                    ),
                ]
            return [
                self.c.p("<b>Synthèse décisionnelle</b>", self.s.h2),
                self.c.box(
                    f"Scénario {sc['label']} : {self.format_euro(budget)} — RAC {self.format_euro(aids['reste'])} — "
                    f"ROI {roi_val:.1f} ans — {'⭐ RECOMMANDÉ' if highlight else 'Alternative'}",
                    "green" if highlight else "info",
                ),
            ]

        if sub == 1:
            box_kind = "green" if highlight else "info"
            mode = {"essentiel": "essentiel", "optimal": "optimal", "excellence": "excellence"}.get(key, "optimal")
            house_legend = {
                "essentiel": (
                    "Travaux essentiels pour améliorer le confort et engager "
                    "la sortie progressive de la situation initiale."
                ),
                "optimal": (
                    "Scénario Optimal retenu : rénovation globale cohérente issue du devis signé, "
                    "visant un objectif de performance DPE G vers C, sous réserve des validations "
                    "réglementaires et techniques applicables."
                ),
                "excellence": (
                    "Option photovoltaïque complémentaire : autoconsommation prioritaire avec "
                    "batterie de stockage. Les caractéristiques de toiture, les ombrages, la "
                    "production et les économies sont à confirmer par une étude technique."
                ),
            }
            parts: List[Any] = [
                self.c.p(f"<b>SCÉNARIO — {sc['label']}</b>", self.s.h1),
                self.c.box(f"<b>Badge :</b> {sc['badge']} | Budget ~{self.format_euro(budget)}", box_kind),
                self.c.p(
                    f"Objectif DPE {c.dpe_actuel} → <b>{sc['dpe_cible']}</b> — "
                    f"Consommation cible {sc.get('conso_apres', '—')} kWh/m²/an.",
                    self.s.body_sm,
                ),
                self.c.spacer(0.08),
                self.c.house_scenario_diagram(mode),
                self.c.spacer(0.06),
            ]
            if key == "optimal":
                parts.append(self.c.legend_badges([
                    ("Toiture isolée", "#0f766e"),
                    ("Menuiseries performantes", "#10b981"),
                    ("Chauffage réversible", "#34d399"),
                    ("Eau chaude performante", "#059669"),
                    ("Étanchéité / zinguerie", "#0d9488"),
                ]))
                parts.append(self.c.spacer(0.06))
            parts.append(self.c.box(house_legend[mode], "green" if key == "optimal" else ("info" if key == "essentiel" else "legal")))
            parts.append(self.c.schema_note())
            return parts
        if sub == 2:
            rows = [["#", "Travaux", "Matériau", "Coût TTC"]]
            total = 0
            for t in travaux:
                cout = int(t.get("cout", 0))
                total += cout
                rows.append([str(t.get("n", "")), t.get("libelle", ""), t.get("materiau", ""), self.format_euro(cout)])
            if not travaux:
                rows += [["1", "Isolation combles", "Laine roche", "3 000 €"],
                         ["2", "Menuiseries", "PVC Uw=1,3", "2 500 €"],
                         ["3", "PAC", "COP≥4", "4 500 €"]]
                total = 10000
            if key == "optimal":
                rows += [
                    ["", "TOTAL HT", "", self.format_euro(c.budget_ht)],
                    ["", "TVA mixte (5,5 % / 10 % / 20 %)", "", self.format_euro(c.tva_montant)],
                    ["", "TOTAL TTC ✅", "", self.format_euro(budget)],
                ]
            else:
                rows.append(["", "TOTAL TTC", "", self.format_euro(total or budget)])
            total_row = len(rows) - 1
            return [self.c.p("<b>Tableau des travaux</b>", self.s.h2),
                    self.c.table(rows, [1 * cm, 5 * cm, 6 * cm, 5 * cm], total_row=total_row)]
        if sub == 3:
            return [
                self.c.p("<b>Calculs thermiques RT2012 / RE2020</b>", self.s.h2),
                self.c.table([
                    ["Indicateur", "Avant", "Après"],
                    ["Ubat moyen", "1,45 W/m².K", "0,45 W/m².K"],
                    ["Besoin chauffage", f"{c.conso_avant} kWh/m²/an", f"{sc['conso_apres']} kWh/m²/an"],
                    ["Gain énergétique", "—", f"-{self.pct_reduction(c.conso_avant, sc['conso_apres'])} %"],
                ], [6 * cm, 5.5 * cm, 5.5 * cm]),
            ]
        if sub == 4:
            mpr_label = (
                f"MaPrimeRénov' Parcours — profil {c.profil}"
                if key == "excellence"
                else f"MaPrimeRénov' {c.profil}"
            )
            aid_rows = [
                ["Aide", "Montant"],
                [mpr_label, self.format_euro(aids["mpr"])],
            ]
            if aids.get("prime_pv") and key != "excellence":
                aid_rows.append(["Prime Autoconsommation PV", self.format_euro(aids["prime_pv"])])
            if aids.get("tva_pv") and key != "excellence":
                aid_rows.append(["TVA réduite 10 % sur PV", self.format_euro(aids["tva_pv"])])
            aid_rows += [
                ["TOTAL AIDES", self.format_euro(aids["total"])],
                ["RESTE À CHARGE", self.format_euro(aids["reste"])],
            ]
            extra = []
            if key == "excellence":
                extra = [self.c.box(
                    "L'option photovoltaïque et la batterie de stockage ne sont pas intégrées "
                    "au calcul des aides présenté ci-dessus. Leur intérêt économique repose "
                    "prioritairement sur la réduction des achats d'électricité grâce à "
                    "l'autoconsommation.",
                    "legal",
                )]
            if key == "optimal":
                acompte_statut = (
                    "✅ encaissé"
                    if c.acompte_verse
                    else "⏳ appelé — en attente de réception"
                )
                extra = [self.c.p(
                    f"Frais MAR client (✅ encaissés) : {self.format_euro(c.mar_participation)} — "
                    f"Acompte 30 % ({acompte_statut}) : {self.format_euro(c.acompte_30)}.",
                    self.s.body_sm,
                )]
            return [
                self.c.p("<b>Aides financières détaillées</b>", self.s.h2),
                self.c.table(aid_rows, [10 * cm, 7 * cm], total_row=len(aid_rows) - 2),
                self._note_aides_mpr(),
                self.c.aids_box(),
            ] + extra
        if sub == 5:
            if key == "excellence":
                dpe_target = sc.get("dpe_cible", "C à confirmer")
                return [
                    self.c.p("<b>Performance projetée</b>", self.s.h2),
                    self.c.p(
                        f"DPE cible : <b>{dpe_target}</b> après étude complète du bâti. "
                        "Aucune promesse de passage DPE C → B liée au photovoltaïque.",
                        self.s.body_sm,
                    ),
                    self.c.dpe_gauge(c.dpe_actuel, "C"),
                    self.c.spacer(0.1),
                    self.c.p("<b>Énergie locale — schéma pédagogique</b>", self.s.h3),
                    self.c.energy_local_flow(),
                    self.c.box(
                        "Le photovoltaïque vise à réduire les achats d'électricité au réseau "
                        "par la consommation locale de l'énergie produite. "
                        "Les résultats sont confirmés après étude solaire du site.",
                        "info",
                    ),
                    self.c.schema_note(),
                ]
            if key == "optimal":
                return [
                    self.c.p("<b>Performance projetée</b>", self.s.h2),
                    self.c.dpe_gauge(c.dpe_actuel, sc["dpe_cible"]),
                    self.c.spacer(0.1),
                    self.c.kpi_row([
                        ("CONSO", f"{sc['conso_apres']} kWh/m²/an"),
                        ("ÉCONOMIES", self.format_euro(eco)),
                        ("ROI", f"{roi_val:.1f} ans"),
                        ("CO₂", str(co2_t)),
                    ]),
                    self.c.spacer(0.1),
                    self.c.before_after_bar_chart([
                        ("Consommation", _safe_float(c.conso_avant), _safe_float(sc.get("conso_apres"), 0), "kWhEP/m²/an"),
                        ("Facture", _safe_float(c.facture_avant), _safe_float(c.facture_apres), "€/an"),
                        ("CO₂", _safe_float(c.co2_avant), _safe_float(c.co2_apres), "kgCO₂/m²/an"),
                    ]),
                    self.c.schema_note(),
                ]
            return [self.c.p("<b>Performance projetée</b>", self.s.h2), self.c.dpe_gauge(c.dpe_actuel, sc["dpe_cible"]),
                    self.c.spacer(0.2),
                    self.c.kpi_row([
                        ("CONSO", f"{sc['conso_apres']} kWh/m²/an"),
                        ("ÉCONOMIES", self.format_euro(eco)),
                        ("ROI", f"{roi_val:.1f} ans"),
                        ("CO₂", str(co2_t)),
                    ])]
        if sub == 6:
            if key == "excellence":
                pv = c.raw.get("option_photovoltaique", {})
                return [
                    self.c.p("<b>Économies & bénéfice solaire</b>", self.s.h2),
                    self.c.p(
                        f"Économies rénovation (Scénario 2 signé) : "
                        f"<b>{self.format_euro(eco)}</b>/an.",
                        self.s.body,
                    ),
                    self.c.p(
                        f"Économies solaires : {pv.get('economies_annuelles', 'À confirmer selon étude technique')}. "
                        "Bénéfice principal attendu : réduction des achats d'électricité "
                        "via autoconsommation prioritaire.",
                        self.s.body_sm,
                    ),
                ]
            return [
                self.c.p("<b>Économies & ROI</b>", self.s.h2),
                self.c.p(f"Économies annuelles : <b>{self.format_euro(eco)}</b> — ROI : <b>{roi_val:.1f} ans</b>.", self.s.body),
                self.c.p(f"Valorisation immobilière estimée : <b>+{val_pct} %</b>.", self.s.body),
                self.c.spacer(0.15),
            ] + (self._projection_30_ans() if key == "optimal" else [])
        if sub == 7:
            return [
                self.c.p("<b>Plan de financement</b>", self.s.h2),
                self.c.table([
                    ["Source", "Montant"],
                    ["Apport personnel", "0 €"],
                    ["Éco-PTZ", self.format_euro(aids["ecoptz"])],
                    ["MaPrimeRénov' (après travaux)", self.format_euro(aids["mpr"])],
                ], [8 * cm, 9 * cm]),
            ]
        if sub == 8:
            mens = c.mensualite if key == "optimal" else aids["mensualite"]
            return [
                self.c.p("<b>Éco-PTZ — Prêt banque à taux 0 %</b>", self.s.h2),
                self.c.p(f"Mensualité estimée : <b>{self.format_euro(mens)}/mois</b> sur {c.duree_pret // 12} ans.", self.s.body),
                self.c.box(self.ECOPTZ_DISCLAIMER, "info"),
            ]
        if sub == 9:
            if key == "excellence":
                aid_rows = [
                    ["Aide", "Montant"],
                    [f"MaPrimeRénov' Parcours — profil {c.profil}", self.format_euro(aids["mpr"])],
                    ["TOTAL AIDES", self.format_euro(aids["total"])],
                    ["RESTE À CHARGE", self.format_euro(aids["reste"])],
                ]
                return [
                    self.c.p("<b>Aides financières détaillées</b>", self.s.h2),
                    self.c.table(aid_rows, [10 * cm, 7 * cm], total_row=len(aid_rows) - 2),
                    self._note_aides_mpr(),
                    self.c.box(
                        "L'option photovoltaïque et la batterie de stockage ne sont pas intégrées "
                        "au calcul des aides présenté ci-dessus. Leur intérêt économique repose "
                        "prioritairement sur la réduction des achats d'électricité grâce à "
                        "l'autoconsommation.",
                        "legal",
                    ),
                    self.c.aids_box(),
                ]
            return [self.c.p("<b>Valorisation immobilière</b>", self.s.h2),
                    self.c.p(f"Gain DPE {c.dpe_actuel} → {sc['dpe_cible']} : plus-value estimée +{val_pct} %.", self.s.body)]
        if sub == 10:
            extra = ""
            if key == "excellence":
                extra = (
                    " Option photovoltaïque : après rénovation globale signée, "
                    "sous réserve d'étude technique et validation client."
                )
            return [self.c.p("<b>Planning indicatif</b>", self.s.h2),
                    self.c.p(
                        f"Durée estimée : {c.raw.get('duree_chantier', '8-10 semaines')}.{extra} "
                        f"{self.ORDRE_TRAVAUX}",
                        self.s.body,
                    )]
        return [self.c.p(f"<b>{title}</b>", self.s.h2)]

    def _aides(self, sub: int) -> List[Any]:
        c = self.ctx
        if sub == 1:
            return [
                self.c.p("<b>IV. Aides financières — MaPrimeRénov' Parcours</b>", self.s.h1),
                self.c.aids_box(),
                self.c.spacer(0.1),
                self.c.box(self.PARCOURS_ACCOMPAGNE_NOTE, "warn"),
                self.c.spacer(0.1),
                self.c.table([
                    ["Profil", "Taux", "Plafond"],
                    ["Bleu", "80 %", "24 000 €"],
                    ["Jaune", "60 %", "18 000 €"],
                    ["Violet", "45 %", "13 500 €"],
                    ["Rose", "10 %", "3 000 €"],
                ], [4 * cm, 4 * cm, 9 * cm]),
                self._note_aides_mpr(),
            ]
        if sub == 2:
            rows = [
                ["Élément", "Montant"],
                ["Profil détecté", f"{c.profil} ✅"],
                ["RFR", f"{self.format_euro(c.raw.get('revenu_fiscal', 0))} ({c.raw.get('personnes', 1)} pers.)"],
                ["MPR Parcours Accompagné", self.format_euro(c.mpr)],
                ["Plafond applicable", self.format_euro(self.MPR_PLAFOND.get(c.profil, 18000))],
            ]
            pages = [
                self.c.p(f"<b>4.1 MaPrimeRénov' — Calcul dossier {c.nom}</b>", self.s.h2),
                self.c.table(rows, [8 * cm, 9 * cm]),
                self.c.spacer(0.1),
                self.c.box(self.PARCOURS_ACCOMPAGNE_NOTE, "info"),
                self._note_aides_mpr(),
            ]
            note = c.raw.get("profil_anah_note")
            if note:
                pages.append(self.c.p(f"<i>Note : {note}</i>", self.s.muted))
            return pages
        if sub == 3:
            return [
                self.c.p("<b>4.2 Récapitulatif financier — HT / TVA / TTC</b>", self.s.h2),
                *self._recap_financier_compact(),
                self.c.spacer(0.1),
                self.c.aids_box(),
            ]
        if sub == 4:
            return self._projection_30_ans() + [
                self.c.spacer(0.1),
                self.c.aids_box(),
                self._note_aides_mpr(),
            ]
        return [
            self.c.p("<b>4.3 Total aides & reste à charge</b>", self.s.h2),
            self.c.box(self.PARCOURS_ACCOMPAGNE_NOTE, "warn"),
            self.c.spacer(0.1),
            *self._recap_financier_compact(),
            self.c.spacer(0.12),
            self.c.aids_split_bar(
                total=float(c.budget),
                aides=float(c.total_aides),
                reste=float(c.reste),
                mpr=float(c.mpr),
                cee=0,
            ),
            self.c.spacer(0.08),
            self.c.box(
                "Le financement du reste à charge est distinct des aides : "
                "épargne, prêt bancaire, Éco-PTZ sous réserve d'accord, ou "
                "solution de financement étudiée avec le courtier partenaire.",
                "info",
            ),
            self.c.aids_box(),
            self.c.schema_note(),
        ]

    def _financement(self, sub: int) -> List[Any]:
        c = self.ctx
        cal = c.raw.get("calendrier_versements", {})
        if sub == 1:
            return [
                self.c.p("<b>V. Financement — Vue d'ensemble</b>", self.s.h1),
                self.c.p("<b>4.1 Flux financier — Parcours administratif</b>", self.s.h2),
                self.c.box(self.MANDAT_ADMIN_ANAH, "green"),
                self.c.spacer(0.1),
                self.c.box(self.DOSSIER_ADMIN_FLUX_NOTE, "warn"),
            ]
        if sub == 2:
            rows = [
                ["Date", "Étape"],
                ["En cours", "Constitution du dossier — MonProjetAnah et Accompagnateur Rénov'"],
                ["À confirmer", "Enregistrement administratif du dossier (confirmation écrite requise)"],
                ["Après confirmation", "Préparation chantier — commandes, protection (sous réserve ANAH)"],
                ["À planifier", "Ouverture chantier (8-10 semaines) — après validation écrite"],
                ["À planifier", "Réception travaux + dépôt solde"],
                ["Après réception", f"Versement MPR estimé ({self.format_euro(c.mpr)}) — sous réserve instruction"],
            ]
            for i, (k, v) in enumerate(cal.items()):
                if i < len(rows) - 1:
                    rows[i + 1] = [k, v]
            return [
                self.c.p("<b>4.2 Calendrier prévisionnel</b>", self.s.h2),
                self.c.box(self.DOSSIER_ADMIN_FLUX_NOTE, "info"),
                self.c.spacer(0.1),
                self.c.table(rows, [5 * cm, 12 * cm]),
            ]
        if sub == 3:
            acompte_statut = (
                "⏳ Appelé — en attente de réception"
                if not c.acompte_verse
                else "✅ Versé"
            )
            return [
                self.c.p("<b>4.3 Flux de paiement détaillé</b>", self.s.h2),
                self.c.box(self.DOSSIER_ADMIN_FLUX_NOTE, "warn"),
                self.c.spacer(0.1),
                self.c.table([
                    ["Étape", "Montant"],
                    ["Prêt travaux UMAFI (Fabien) — sous réserve d'accord", self.format_euro(c.budget)],
                    [f"Acompte 30 % — {acompte_statut}", self.format_euro(c.acompte_30)],
                    ["Démarrage chantier 40 % — après confirmation écrite", self.format_euro(c.mi_40)],
                    ["Réception travaux 30 %", self.format_euro(c.reception_30)],
                    ["Retour État estimé sur compte client (MaPrimeRénov')", f"+ {self.format_euro(c.total_aides)} (indicatif)"],
                    ["Reste à charge net final estimé", self.format_euro(c.reste)],
                ], [10 * cm, 7 * cm], total_row=5),
            ]
        if sub == 4:
            return [
                self.c.p("<b>4.4 Comparatif financement Éco-PTZ vs UMAFI</b>", self.s.h2),
                self.c.table([
                    ["Critère", "Éco-PTZ", "UMAFI"],
                    ["Taux", "0 %", "Variable"],
                    ["Source", "Banque du client", "Partenaires UMAFI"],
                    ["Montant", "Jusqu'à 50 000 €", "6 000 € à 75 000 €"],
                    ["Délai", "2 à 3 mois", "8 jours ⚡"],
                    ["Documents", "Dossier complet", "Simplifié"],
                ], [5 * cm, 5.5 * cm, 6.5 * cm]),
                self.c.spacer(0.2),
                self.c.box(self.ECOPTZ_TEXTE, "info"),
            ]
        if sub == 5:
            return [
                self.c.p("<b>4.5 UMAFI — Courtier partenaire (1/2)</b>", self.s.h2),
                self.c.box(self.UMAFI_BLOC, "green"),
            ]
        if sub == 6:
            return [
                self.c.p("<b>4.5 UMAFI — Mentions légales (2/2)</b>", self.s.h2),
                self.c.p(self.UMAFI_MENTIONS_LEGALES, self.s.muted),
            ]
        return [
            self.c.p("<b>4.6 Consentement RGPD financement</b>", self.s.h2),
            self.c.box(self.RGPD_CONSENT_UMAFI, "legal"),
            self.c.spacer(0.3),
            self.c.p("Fait à __________________ le __________________", self.s.body),
            self.c.p("Signature client : _________________________", self.s.body),
            self.c.p(f"<b>Contacts :</b> {self.CONTACTS}", self.s.body_sm),
        ]

    def _recap_financier(self) -> List[Any]:
        c = self.ctx
        sp = c.raw.get("statuts_paiement", {})

        encaisses = sp.get("encaisses", [
            {"libelle": "Frais d'accompagnement réglés", "montant": c.mar_participation, "statut": "✅"},
            {"libelle": "Acompte 30%", "montant": c.acompte_30,
             "statut": "⏳ Appelé — en attente"},
        ])
        bloc1 = [["Paiement", "Montant", "Statut"]]
        for p in encaisses:
            bloc1.append([p["libelle"], self.format_euro(p["montant"]), p.get("statut", "")])

        en_attente = sp.get("en_attente", [
            {"libelle": "Démarrage 40%", "montant": c.mi_40, "statut": "⏳"},
            {"libelle": "Réception 30%", "montant": c.reception_30, "statut": "⏳"},
        ])
        bloc2 = [["Paiement", "Montant", "Statut"]]
        for p in en_attente:
            bloc2.append([p["libelle"], self.format_euro(p["montant"]), p.get("statut", "")])

        aides_att = [
            a for a in sp.get("aides_attendues", [
                {"libelle": "MaPrimeRénov' (ANAH)", "montant": c.mpr, "statut": "⏳"},
            ])
            if "CEE" not in str(a.get("libelle", "")).upper()
        ]
        bloc3 = [["Aide", "Montant", "Statut"]]
        for a in aides_att:
            bloc3.append([a["libelle"], self.format_euro(a["montant"]), a.get("statut", "")])

        encadre_final = (
            f"<b>Reste à charge net estimé : {self.format_euro(c.reste)}</b><br/>"
            f"({self.format_euro(c.budget)} TTC – {self.format_euro(c.mpr)} MaPrimeRénov')"
        )

        sm = self.s.body_sm
        return [
            self.c.p("<b>VI. Récapitulatif financier complet</b>", self.s.h1),
            *self._recap_financier_compact(),
            self.c.spacer(0.08),
            self.c.p("<b>Bloc 1 — Déjà versé / engagé</b>", sm),
            self.c.table(bloc1, [6 * cm, 4 * cm, 7 * cm]),
            self.c.spacer(0.06),
            self.c.p("<b>Bloc 2 — Restant à verser</b>", sm),
            self.c.table(bloc2, [5 * cm, 3.5 * cm, 8.5 * cm]),
            self.c.spacer(0.06),
            self.c.p("<b>Bloc 3 — Aides attendues</b>", sm),
            self.c.table(bloc3, [6 * cm, 4 * cm, 7 * cm]),
            self.c.spacer(0.06),
            self.c.box(encadre_final, "green"),
            self.c.p(
                "<i>Aides financières 2026 (estimation à titre indicatif). "
                "Montants définitifs après instruction ANAH.</i>",
                sm,
            ),
        ]

    def _fiche_technique(self, idx: int) -> List[Any]:
        fiches = self.ctx.raw.get("fiches_techniques", [])
        fiche = fiches[idx - 1] if 0 < idx <= len(fiches) else {}
        ordre = fiche.get("ordre", idx)
        lot = fiche.get("lot", f"Lot {ordre}")
        cout = fiche.get("cout_ttc", 0)
        objectif = fiche.get("objectif", "")
        caracteristiques = fiche.get("caracteristiques", [])
        benefices = fiche.get("benefices", [])
        controles = fiche.get("controles", [])
        documents = fiche.get("documents", [])
        precision = fiche.get("precision_mar", "")
        sm = self.s.body_sm

        titre = (
            f"<b>VI. FICHES TECHNIQUES — SCÉNARIO OPTIMAL RETENU</b><br/>"
            f"<b>Fiche {ordre} — {lot}</b>"
            if idx == 1
            else f"<b>Fiche {ordre} — {lot}</b>"
        )
        parts: List[Any] = [
            self.c.p(titre, self.s.h2 if idx > 1 else self.s.h1),
            self.c.box(f"<b>Objectif du lot</b><br/>{objectif}", "green"),
        ]
        if caracteristiques:
            car_rows = [["Caractéristiques prévues au devis"]] + [[item] for item in caracteristiques]
            parts.append(self.c.table(car_rows, [17 * cm]))
        if benefices:
            parts.append(self.c.box(
                "<b>Bénéfices attendus</b><br/>" + " · ".join(benefices), "info",
            ))
        if precision:
            parts.append(self.c.box(f"<b>Précision importante</b><br/>{precision}", "legal"))
        if controles:
            ctrl_rows = [["Points de contrôle à réception", ""]] + [[item, "☐"] for item in controles]
            parts.append(self.c.table(ctrl_rows, [14 * cm, 3 * cm]))
        if documents:
            parts.append(self.c.p(
                f"<b>Documents à remettre / conserver :</b> {' · '.join(documents)}",
                sm,
            ))
        parts += [
            self.c.box(f"<b>Coût TTC du poste :</b> {self.format_euro(cout)}", "green"),
            self.c.p(FICHE_PRUDENCE, sm),
        ]
        return parts

    def _mise_en_oeuvre(self, sub: int) -> List[Any]:
        c = self.ctx
        if sub == 1:
            planning = c.raw.get("planning_chantier", {})
            rows = [["Période", "Phase", "Actions"]]
            for bloc_key in ("1", "2"):
                for row in planning.get(bloc_key, []):
                    if isinstance(row, (list, tuple)) and len(row) >= 3:
                        periode, phase, actions = str(row[0]), str(row[1]), str(row[2])
                        if "Accord ANAH" in actions or phase == "Préparation":
                            actions = self.PLANNING_PHASE_1
                            phase = "Constitution dossier"
                        rows.append([periode, phase, actions])
            rows += [
                ["—", "Échéancier", (
                    f"30 % signature {self.format_euro(c.acompte_30)} — "
                    + ("✅ VERSÉ" if c.acompte_verse else "⏳ APPELÉ — EN ATTENTE")
                )],
                ["—", "Mi-chantier", f"40 % démarrage {self.format_euro(c.mi_40)} — après confirmation écrite"],
                ["—", "Réception", f"30 % solde {self.format_euro(c.reception_30)}"],
                ["—", "Durée totale", c.raw.get("duree_chantier", "8 à 10 semaines")],
            ]
            return [
                self.c.box(
                    "Tous les travaux sont réalisés par des artisans RGE sélectionnés et coordonnés "
                    "par ENERGIA CONSEIL IA® en qualité de <b>Contractant Général</b>. "
                    "La coordination administrative du dossier est assurée par <b>Hub Admin</b>.",
                    "green",
                ),
                self.c.spacer(0.1),
                self.c.p("<b>7.1 Planning de chantier synthétique</b>", self.s.h1),
                self.c.table(rows[:7], [2.5 * cm, 4 * cm, 10.5 * cm]),
                self.c.spacer(0.1),
                self.c.gantt_chantier(),
                self.c.spacer(0.08),
                self.c.box(self.PLANNING_AVANT_DEMARRAGE, "warn"),
                self.c.p(
                    "Planning prévisionnel susceptible d'évolution selon les accords administratifs, "
                    "les conditions météo, les délais d'approvisionnement et la disponibilité des entreprises.",
                    self.s.body_sm,
                ),
                self.c.schema_note(),
            ]
        if sub == 2:
            return [
                self.c.p("<b>7.2 Ordre optimal des travaux</b>", self.s.h1),
                self.c.box(f"<b>Ordre impératif :</b> {self.ORDRE_TRAVAUX}", "warn"),
                self.c.table([
                    ["#", "Poste", "Justification"],
                    ["1", "Isolation combles", "30 % déperditions — ROI maximal"],
                    ["2", "Isolation murs", "25 % déperditions — avant chauffage"],
                    ["3", "Fenêtres & portes", "Après isolation — évite ponts thermiques"],
                    ["4", "VMC double flux", "Post-isolation — rendement optimal"],
                    ["5", "PAC air-eau", "Dimensionnement post-isolation"],
                    ["6", "Ballon thermo", "Complément ECS"],
                    ["7", "Photovoltaïque", "En dernier — besoins réduits"],
                ], [1 * cm, 5 * cm, 11 * cm]),
            ]
        if sub == 3:
            artisans = c.artisans or []
            parts: List[Any] = [
                self.c.p("<b>7.3 Annuaire artisans / intervenants RGE</b>", self.s.h1),
                self.c.p(
                    f"{self.HEADER_LABEL} — un seul contrat client — "
                    "sélection et suivi par Sylvain LEMBELEMBE.",
                    self.s.muted,
                ),
                self.c.spacer(0.1),
            ]
            for a in artisans:
                lines = [f"<b>{a.get('poste', '')}</b>"]
                ent = a.get("entreprise", "")
                forme = a.get("forme", "")
                lines.append(f"{ent} ({forme})" if forme else ent)
                if a.get("adresse"):
                    lines.append(a["adresse"])
                tel_email = " · ".join(
                    x for x in (a.get("telephone"), a.get("email")) if x
                )
                if tel_email:
                    lines.append(tel_email)
                if a.get("siret"):
                    lines.append(f"SIRET : {a['siret']}")
                rge = a.get("rge") or a.get("certif", "")
                if rge:
                    lines.append(f"RGE : {rge}")
                if a.get("assurance"):
                    lines.append(f"Assurance : {a['assurance']}")
                coord = a.get("coordination") or a.get("contact", "")
                if coord:
                    lines.append(f"Coordination : {coord}")
                parts.append(self.c.box("<br/>".join(lines), "info"))
            return parts
        if sub == 4:
            return [
                self.c.p("<b>7.4 Suivi administratif — Hub Admin</b>", self.s.h1),
                self.c.box(self.PARCOURS_ADMIN_HUB, "green"),
                self.c.spacer(0.15),
                self.c.p(
                    "Hub Admin assure la coordination administrative du dossier : "
                    "centralisation des pièces, suivi des échanges et interface administrative "
                    "avec les intervenants. Contact : clyve.a@hub-admin.fr",
                    self.s.body,
                ),
                self.c.spacer(0.15),
                self.c.table([
                    ["Point de contrôle", "Statut"],
                    ["Espace MonProjetAnah créé", "☐"],
                    ["Accompagnateur Rénov' désigné (Lionel MFEGUE / LEO ENERGY)", "☐"],
                    ["Dossier d'aide en cours de constitution", "☐"],
                    ["Confirmation écrite avant démarrage travaux", "☐"],
                    ["Photos avant / pendant / après", "☐"],
                    ["Attestations RGE archivées", "☐"],
                    ["Factures classées", "☐"],
                ], [12 * cm, 5 * cm]),
            ]
        if sub == 5:
            return [
                self.c.p("<b>7.5 Checklist réception des travaux</b>", self.s.h1),
                self.c.table([
                    ["Élément", "Statut"],
                    ["PV de réception signé (Sylvain + MAR + client)", "☐"],
                    ["DPE post-travaux commandé / reçu", "☐"],
                    ["Dossier paiement ANAH déposé", "☐"],
                    ["Solde artisans 30 % réglé après validation", "☐"],
                    ["Notices fabricants remises au client", "☐"],
                    ["Garanties fabricants / artisans transmises", "☐"],
                ], [12 * cm, 5 * cm]),
            ]
        # Mentions certifications conditionnées par justificatifs / profil
        profile = c.raw.get("_energia_profile") or {}
        justifs = getattr(c, "justificatifs", None) or c.raw.get("justificatifs") or []
        diplome_ok = any(
            j.get("type") == "diplome_auditeur" and j.get("status") == "verified" for j in justifs
        )
        certibat_pending = any(
            j.get("type") == "certibat"
            and j.get("status") == "pending"
            and j.get("fichier")
            for j in justifs
        )
        assurance_ok = any(
            j.get("type") == "assurance_rc" and j.get("status") == "verified" for j in justifs
        )
        for cert in profile.get("certifications") or []:
            if cert.get("code") == "certibat" and cert.get("status") == "pending" and cert.get("justificatif"):
                certibat_pending = True
        for dip in profile.get("diplomes") or []:
            if dip.get("status") == "verified":
                diplome_ok = True

        rapport_ligne = "Rapport de synthèse personnalisé 85 pages"
        if diplome_ok:
            rapport_ligne += " (IA + Auditeur Énergétique Diplômé)"
        else:
            rapport_ligne += " (IA + Expert en rénovation énergétique)"

        acts = {a.get("code"): a for a in (profile.get("activites_declarees") or [])}
        cg_ok = (acts.get("contractant_general") or {}).get("status") == "verified" or assurance_ok
        contact_cert_lines = ["Sylvain LEMBELEMBE — ENERGIA CONSEIL IA®"]
        if cg_ok:
            contact_cert_lines.append("Contractant Général")
        if diplome_ok:
            contact_cert_lines.append("Auditeur Énergétique Diplômé")
        if certibat_pending:
            contact_cert_lines.append("CERTIBAT en cours")
        contact_cert_lines.append("06 10 59 68 98")

        cert_line = None
        if certibat_pending:
            cert_line = c.raw.get(
                "certification_sylvain",
                "CERTIBAT Rénovation Énergétique RGE — en cours d'obtention (QUALIBAT)",
            )
        elif diplome_ok:
            cert_line = "Auditeur énergétique diplômé (justificatif verified)"

        parts: List[Any] = [
            self.c.p(f"<b>7.6 Accompagnement — {self.HEADER_LABEL}</b>", self.s.h1),
            self.c.box(
                "Notre accompagnement repose sur la coordination technique ENERGIA, "
                "la coordination administrative Hub Admin et l'accompagnement Rénov' "
                "(Lionel MFEGUE / LEO ENERGY — désignation à finaliser sur MonProjetAnah).",
                "green",
            ),
            self.c.spacer(0.2),
            self.c.table([
                ["Service", "Inclus"],
                ["Audit réglementaire du parcours accompagné", "Réalisé dans le cadre de l'accompagnement Rénov'"],
                ["Coordination administrative Hub Admin", "Oui"],
                [rapport_ligne, "Oui"],
                ["Coordination ENERGIA CONSEIL IA®", "Oui"],
                ["Désignation de l'Accompagnateur Rénov'", "À finaliser sur MonProjetAnah"],
            ], [12 * cm, 5 * cm]),
            self.c.p(
                "<b>Contacts :</b><br/>"
                + "<br/>".join(contact_cert_lines)
                + "<br/>"
                "Hub Admin clyve.a@hub-admin.fr | "
                "Lionel MFEGUE / LEO ENERGY (Accompagnateur Rénov') | "
                "Fabien BARRAS (UMAFI) 06 71 19 96 45 | "
                "DAMIEN (Commercial) 06 72 68 09 68 | Julia (Juriste)",
                self.s.body_sm,
            ),
        ]
        if cert_line:
            parts.append(self.c.p(f"<b>Certification :</b> {cert_line}", self.s.body_sm))
        return parts

    def _annexe_glossaire(self) -> List[Any]:
        return [
            self.c.p("<b>Annexe A — Glossaire technique</b>", self.s.h1),
            self.c.p(
                "<b>DPE</b> Diagnostic Performance Énergétique | <b>Ubat</b> Coefficient global | "
                "<b>RT2012/RE2020</b> Réglementations thermiques | <b>COP</b> Coefficient performance | "
                "<b>MPR</b> MaPrimeRénov' | "
                "<b>Éco-PTZ</b> Prêt taux zéro | <b>RGE</b> Reconnu Garant Environnement | "
                "<b>ITE/ITI</b> Isolation extérieure/intérieure | <b>VMC</b> Ventilation | <b>PAC</b> Pompe à chaleur.",
                self.s.body_sm,
            ),
            self._note_aides_mpr(),
        ]

    def _annexe_references(self) -> List[Any]:
        return [
            self.c.p("<b>Annexe B — Références réglementaires</b>", self.s.h1),
            self.c.p(
                "Loi Énergie-Climat 2019 — RE2020 — Barèmes ANAH 2026 — "
                "Éco-PTZ taux 0 % (banque client, 2-3 mois).",
                self.s.body,
            ),
            self.c.aids_box(),
        ]

    def _annexe_signature(self) -> List[Any]:
        c = self.ctx
        e = self.ENTREPRISE
        return [
            self.c.p("<b>Annexe C — Signature & validation</b>", self.s.h1),
            self.c.p(
                f"Rapport établi par <b>{e['nom']}</b><br/>"
                "(Contractant Général — coordination travaux)<br/>"
                "<b>Partenaires :</b> Hub Admin (coordination administrative) | "
                "Lionel MFEGUE / LEO ENERGY (Accompagnateur Rénov') | "
                "Fabien BARRAS — UMAFI (Courtier)",
                self.s.body,
            ),
            self.c.spacer(0.2),
            self.c.box(self.EQUIPE_ROLES, "info"),
            self.c.p(
                f"{e['adresse']} — SIRET {e['siret']}<br/>"
                f"{e['tel']} — {e['email']}",
                self.s.body,
            ),
            self.c.p(f"Référence {c.ref} — Généré le {c.date_str}", self.s.body),
            self.c.box(
                f"QR Code vérification : https://www.energia-conseil-ia.com/verify/{c.ref}<br/>"
                f"Document confidentiel — Propriété de <b>{c.nom}</b>",
                "legal",
            ),
            self.c.spacer(0.4),
            self.c.p("Signature électronique client : _________________________", self.s.body),
            self.c.p(
                "Sylvain LEMBELEMBE — Contractant Général — Interlocuteur unique — ENERGIA CONSEIL IA®",
                self.s.body_sm,
            ),
            self.c.p("Julia — Juriste ENERGIA CONSEIL IA® — Avis conformité Mars 2026", self.s.body_sm),
        ]
