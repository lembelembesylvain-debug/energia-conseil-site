#!/usr/bin/env python3
"""Facture simplifiée ENERGIA CONSEIL → SRD CONSEILS (Dossier Luc GRANVILLE)."""

from pathlib import Path
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_PDF = SCRIPT_DIR / "facture_damien_granville_simplifiee.pdf"

BLEU_NUIT = colors.HexColor("#102640")
GRIS_TEXTE = colors.HexColor("#2A2A2A")
GRIS_CLAIR = colors.HexColor("#D0D0D0")
GRIS_FOND = colors.HexColor("#F5F6F8")
GRIS_LIGNE = colors.HexColor("#E8EAEF")
BLANC = colors.white

BANDEAU_H = 16 * mm
MARGIN = 2 * cm
PAGE_W, PAGE_H = A4
CONTENT_W = PAGE_W - 2 * MARGIN


def _styles():
    return {
        "section": ParagraphStyle(
            "Section",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=11,
            spaceBefore=2,
            spaceAfter=3,
        ),
        "corps": ParagraphStyle(
            "Corps",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=11,
        ),
        "corps_b": ParagraphStyle(
            "CorpsB",
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=11,
        ),
        "label": ParagraphStyle(
            "Label",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=10,
        ),
        "valeur": ParagraphStyle(
            "Valeur",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=11,
        ),
        "th": ParagraphStyle(
            "TH",
            fontName="Helvetica-Bold",
            fontSize=7.5,
            textColor=BLANC,
            alignment=TA_CENTER,
            leading=9.5,
        ),
        "td_l": ParagraphStyle(
            "TDL",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10.5,
        ),
        "td_c": ParagraphStyle(
            "TDC",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_CENTER,
            leading=10.5,
        ),
        "td_r": ParagraphStyle(
            "TDR",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_RIGHT,
            leading=10.5,
        ),
        "total": ParagraphStyle(
            "Total",
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=BLANC,
            alignment=TA_CENTER,
            leading=14,
        ),
        "legal": ParagraphStyle(
            "Legal",
            fontName="Helvetica-Oblique",
            fontSize=7.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10,
        ),
        "legal_corps": ParagraphStyle(
            "LegalCorps",
            fontName="Helvetica",
            fontSize=7.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10,
        ),
        "banque": ParagraphStyle(
            "Banque",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10.5,
        ),
        "banque_b": ParagraphStyle(
            "BanqueB",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10.5,
        ),
        "sign": ParagraphStyle(
            "Sign",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=12,
        ),
        "sign_b": ParagraphStyle(
            "SignB",
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=12,
        ),
    }


def _bandeau():
    gauche = Paragraph(
        '<font color="white"><b>ENERGIA CONSEIL IA®</b></font>',
        ParagraphStyle(
            "BandeauG",
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=BLANC,
            alignment=TA_LEFT,
            leading=14,
        ),
    )
    droite = Paragraph(
        '<font color="white"><b>FACTURE</b></font>',
        ParagraphStyle(
            "BandeauD",
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=BLANC,
            alignment=TA_RIGHT,
            leading=18,
        ),
    )
    t = Table(
        [[gauche, droite]],
        colWidths=[CONTENT_W * 0.55, CONTENT_W * 0.45],
        rowHeights=[BANDEAU_H],
    )
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BLEU_NUIT),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (0, 0), 10),
                ("RIGHTPADDING", (1, 0), (1, 0), 10),
                ("LEFTPADDING", (1, 0), (1, 0), 4),
                ("RIGHTPADDING", (0, 0), (0, 0), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return t


def _bloc_parties(s):
    emetteur = [
        Paragraph("ÉMETTEUR", s["section"]),
        Paragraph("<b>ENERGIA CONSEIL</b>", s["corps"]),
        Paragraph("SAS — Capital 100 €", s["corps"]),
        Paragraph("16 Rue Cuvier, 69006 Lyon", s["corps"]),
        Paragraph("SIRET : 941 819 427 00019", s["corps"]),
        Paragraph("Sylvain LEMBELEMBE, Président", s["corps"]),
        Paragraph("lembelembe.sylvain@gmail.com", s["corps"]),
        Paragraph("06 10 59 68 98", s["corps"]),
    ]
    destinataire = [
        Paragraph("DESTINATAIRE", s["section"]),
        Paragraph("<b>SRD CONSEILS</b>", s["corps"]),
        Paragraph("Damien RICHARD", s["corps"]),
        Paragraph("49 Hameau Des Cipières", s["corps"]),
        Paragraph("42210 Montrond-les-Bains", s["corps"]),
        Paragraph("SIRET : 903 542 371 R.C.S. Saint-Étienne", s["corps"]),
        Paragraph("damien.srdconseil@gmail.com", s["corps"]),
        Paragraph("06 72 68 09 68", s["corps"]),
    ]
    left = Table([[c] for c in emetteur], colWidths=[CONTENT_W * 0.48])
    right = Table([[c] for c in destinataire], colWidths=[CONTENT_W * 0.48])
    left.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), GRIS_FOND),
                ("BOX", (0, 0), (-1, -1), 0.6, GRIS_CLAIR),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
                ("TOPPADDING", (0, 1), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -2), 1),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    right.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), GRIS_FOND),
                ("BOX", (0, 0), (-1, -1), 0.6, GRIS_CLAIR),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
                ("TOPPADDING", (0, 1), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -2), 1),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    wrap = Table([[left, right]], colWidths=[CONTENT_W * 0.5, CONTENT_W * 0.5])
    wrap.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, 0), 6),
                ("LEFTPADDING", (1, 0), (1, 0), 6),
                ("RIGHTPADDING", (1, 0), (1, 0), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return wrap


def _bloc_details(s):
    rows = [
        [
            Paragraph("N° Facture", s["label"]),
            Paragraph("EC-FAC-2026-004-RECT <font size='7'>(RECT = rectification)</font>", s["valeur"]),
        ],
        [
            Paragraph("Date", s["label"]),
            Paragraph("21 juillet 2026", s["valeur"]),
        ],
        [
            Paragraph("Échéance", s["label"]),
            Paragraph("21 août 2026", s["valeur"]),
        ],
        [
            Paragraph("Objet", s["label"]),
            Paragraph(
                "Prestation d'apport d'affaires et de gestion commerciale — Dossier Luc GRANVILLE",
                s["valeur"],
            ),
        ],
    ]
    t = Table(rows, colWidths=[3.2 * cm, CONTENT_W - 3.2 * cm])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LINEBELOW", (0, 0), (-1, -2), 0.4, GRIS_LIGNE),
            ]
        )
    )
    return t


def _tableau_prestations(s):
    header = [
        Paragraph("Désignation", s["th"]),
        Paragraph("Qté", s["th"]),
        Paragraph("Prix unit. HT", s["th"]),
        Paragraph("Montant HT", s["th"]),
        Paragraph("TVA", s["th"]),
        Paragraph("Montant TTC", s["th"]),
    ]
    ligne = [
        Paragraph(
            "Prestation d'apport d'affaires et de gestion commerciale — Dossier Luc GRANVILLE",
            s["td_l"],
        ),
        Paragraph("1", s["td_c"]),
        Paragraph("3 178,00 €", s["td_r"]),
        Paragraph("3 178,00 €", s["td_r"]),
        Paragraph("0 %", s["td_c"]),
        Paragraph("3 178,00 €", s["td_r"]),
    ]
    col_w = [
        CONTENT_W * 0.42,
        CONTENT_W * 0.08,
        CONTENT_W * 0.14,
        CONTENT_W * 0.14,
        CONTENT_W * 0.08,
        CONTENT_W * 0.14,
    ]
    t = Table([header, ligne], colWidths=col_w)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BLEU_NUIT),
                ("BACKGROUND", (0, 1), (-1, 1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.7, BLEU_NUIT),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, GRIS_CLAIR),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
                ("TOPPADDING", (0, 1), (-1, 1), 8),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 8),
            ]
        )
    )
    return t


def _bloc_total(s):
    t = Table(
        [[Paragraph("TOTAL TTC : 3 178,00 €", s["total"])]],
        colWidths=[CONTENT_W],
        rowHeights=[12 * mm],
    )
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BLEU_NUIT),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return t


def _bloc_legal(s):
    return [
        Paragraph("MENTIONS LÉGALES", s["section"]),
        Paragraph(
            "TVA non applicable — Art. 293 B du CGI (franchise en base de TVA)",
            s["legal"],
        ),
        Spacer(1, 2 * mm),
        Paragraph(
            "En cas de retard de paiement, des pénalités de retard seront appliquées "
            "au taux de 3× le taux d'intérêt légal (Art. L441-10 C. com.), ainsi qu'une "
            "indemnité forfaitaire de recouvrement de 40 €.",
            s["legal_corps"],
        ),
    ]


def _bloc_banque(s):
    rows = [
        [Paragraph("COORDONNÉES BANCAIRES — Virement SEPA uniquement", s["section"])],
        [Paragraph("<b>Titulaire :</b> ENERGIA CONSEIL", s["banque"])],
        [
            Paragraph(
                "<b>Banque :</b> Tiime Business (Treezor SAS — 33 av de Wagram, 75017 Paris)",
                s["banque"],
            )
        ],
        [Paragraph("<b>IBAN :</b> FR76 1679 8000 0100 0197 1554 609", s["banque_b"])],
        [Paragraph("<b>BIC :</b> TRZOFR21XXX", s["banque"])],
        [
            Paragraph(
                "<b>Référence virement :</b> EC-FAC-2026-004-RECT — Granville PV",
                s["banque_b"],
            )
        ],
    ]
    t = Table(rows, colWidths=[CONTENT_W])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), GRIS_FOND),
                ("BOX", (0, 0), (-1, -1), 0.6, GRIS_CLAIR),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
                ("TOPPADDING", (0, 1), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
            ]
        )
    )
    return t


def _bloc_signature(s):
    return [
        Paragraph("Pour ENERGIA CONSEIL", s["sign_b"]),
        Paragraph("Sylvain LEMBELEMBE — Président", s["sign"]),
        Spacer(1, 4 * mm),
        Paragraph("Signature : ___________________", s["sign"]),
        Spacer(1, 2 * mm),
        Paragraph("Cachet entreprise", s["sign"]),
    ]


def build_pdf():
    s = _styles()
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title="Facture EC-FAC-2026-004-RECT",
        author="ENERGIA CONSEIL",
    )

    story = []
    story.append(_bandeau())
    story.append(Spacer(1, 6 * mm))
    story.append(_bloc_parties(s))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph("DÉTAILS DE LA FACTURE", s["section"]))
    story.append(_bloc_details(s))
    story.append(Spacer(1, 5 * mm))
    story.append(Paragraph("PRESTATIONS", s["section"]))
    story.append(_tableau_prestations(s))
    story.append(Spacer(1, 4 * mm))
    story.append(_bloc_total(s))
    story.append(Spacer(1, 5 * mm))
    story.extend(_bloc_legal(s))
    story.append(Spacer(1, 4 * mm))
    story.append(_bloc_banque(s))
    story.append(Spacer(1, 8 * mm))
    story.extend(_bloc_signature(s))

    doc.build(story)


def main():
    build_pdf()
    if not OUTPUT_PDF.is_file():
        print(f"ERREUR : le PDF n'a pas été créé : {OUTPUT_PDF}", file=sys.stderr)
        sys.exit(1)
    taille = OUTPUT_PDF.stat().st_size
    print(f"OK — PDF généré : {OUTPUT_PDF.name} ({taille} octets)")
    print(f"Chemin : {OUTPUT_PDF}")


if __name__ == "__main__":
    main()
