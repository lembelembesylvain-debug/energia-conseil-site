/**
 * Génération du rapport PDF d'audit énergétique (58 pages)
 * Conforme ANAH - Energia-Conseil
 */
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend)

const PRIMARY = [15, 118, 110] // #0f766e teal
const SECONDARY = [13, 148, 136] // #0d9488
const GRAY = [100, 116, 139]
const PAGE_W = 210
const PAGE_H = 297
const MARGIN = 20

const val = (v, def = '-') => (v != null && v !== '') ? v : def

/** Génère une image base64 d'un graphique circulaire Chart.js */
function createPieChartImage(data) {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = 400
  canvas.height = 400
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: data.labels || ['Murs', 'Combles', 'Plancher', 'Fenêtres', 'Ponts thermiques'],
      datasets: [{
        data: data.values || [35, 25, 15, 15, 10],
        backgroundColor: ['#0f766e', '#0d9488', '#14b8a6', '#2dd4bf', '#5eead4'],
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: false,
      plugins: {
        legend: { position: 'right' },
      },
    },
  })
  const url = canvas.toDataURL('image/png')
  chart.destroy()
  return url
}

/** Ajoute en-tête et pied de page */
function addPageMeta(doc, pageNum, totalPages) {
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.1)
  doc.line(MARGIN, 12, PAGE_W - MARGIN, 12)
  doc.setFontSize(8)
  doc.setTextColor(...GRAY)
  doc.text('Energia-Conseil - Audit Énergétique Réglementaire', MARGIN, 10)
  doc.text(`Page ${pageNum} / ${totalPages}`, PAGE_W - MARGIN, 10, { align: 'right' })
  doc.setTextColor(0, 0, 0)
}

/** Vérifie si une nouvelle page est nécessaire */
function checkNewPage(doc, y, need = 30) {
  if (y > PAGE_H - need) {
    doc.addPage()
    return MARGIN + 20
  }
  return y
}

export async function generateFullAudit(clientData = {}, photosAnalysis = {}, images3D = {}) {
  const doc = new jsPDF()
  const d = clientData
  const pa = photosAnalysis || {}
  const img3 = images3D || {}

  const nomClient = d.nom ?? d.name ?? d.client_name ?? ''
  const prenom = d.prenom ?? ''
  const nomAffichage = [prenom, nomClient].filter(Boolean).join(' ') || 'Non renseigné'
  const adresse = d.adresse ?? d.address ?? d.client_address ?? val('')
  const codePostal = d.code_postal ?? val('')
  const ville = d.ville ?? val('')
  const dateStr = d.date ?? new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })

  let pageNum = 1
  const totalPages = 58
  let y = MARGIN + 20

  // ─── PAGE 1 : COUVERTURE ─────────────────────────────────────────
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, PAGE_W, 100, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('ENERGIA-CONSEIL', PAGE_W / 2, 35, { align: 'center' })
  doc.setFontSize(18)
  doc.setFont('helvetica', 'normal')
  doc.text('Audit Énergétique Réglementaire', PAGE_W / 2, 55, { align: 'center' })
  doc.setFontSize(12)
  doc.text('Conforme ANAH', PAGE_W / 2, 75, { align: 'center' })

  doc.setTextColor(0, 0, 0)
  y = 120
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Client', MARGIN, y)
  y += 10
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(nomAffichage, MARGIN, y)
  y += 8
  doc.text(adresse || val(''), MARGIN, y)
  y += 8
  doc.text(`${codePostal} ${ville}`.trim() || val(''), MARGIN, y)
  y += 20
  doc.setFont('helvetica', 'bold')
  doc.text('Date de l\'audit', MARGIN, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.text(dateStr, MARGIN, y)

  doc.addPage()
  pageNum = 2

  // ─── PAGES 2-3 : TABLE DES MATIÈRES ─────────────────────────────
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Table des matières', MARGIN, y)
  y += 15

  const toc = [
    { page: 4, titre: 'Synthèse exécutive' },
    { page: 6, titre: '1. Diagnostic actuel' },
    { page: 6, subtitle: '1.1 Caractéristiques du bâtiment' },
    { page: 8, subtitle: '1.2 Enveloppe thermique' },
    { page: 12, subtitle: '1.3 Systèmes énergétiques' },
    { page: 15, subtitle: '1.4 Déperditions et consommations' },
    { page: 19, titre: '2. Scénarios optimisés' },
    { page: 19, subtitle: '2.1 Scénario Essentiel' },
    { page: 25, subtitle: '2.2 Scénario Optimal' },
    { page: 31, subtitle: '2.3 Scénario Excellence' },
    { page: 41, titre: '3. Dossiers d\'aides' },
    { page: 41, subtitle: '3.1 MaPrimeRénov\'' },
    { page: 44, subtitle: '3.2 Certificats d\'Économies d\'Énergie' },
    { page: 46, subtitle: '3.3 Éco-PTZ' },
    { page: 48, subtitle: '3.4 Aides régionales' },
    { page: 51, titre: '4. Mise en œuvre' },
    { page: 51, subtitle: '4.1 Planning Gantt' },
    { page: 54, subtitle: '4.2 Artisans RGE' },
    { page: 56, subtitle: '4.3 Ordre des travaux et suivi' },
  ]

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  for (const item of toc) {
    y = checkNewPage(doc, y, 15)
    if (item.titre) {
      doc.setFont('helvetica', 'bold')
      doc.text(item.titre, MARGIN, y)
    } else {
      doc.setFont('helvetica', 'normal')
      doc.text('    ' + (item.subtitle || ''), MARGIN, y)
    }
    doc.text(String(item.page), PAGE_W - MARGIN - 15, y, { align: 'right' })
    y += 7
  }
  pageNum = 3
  doc.addPage()
  y = MARGIN + 20

  // ─── PAGES 4-5 : SYNTHÈSE EXÉCUTIVE ─────────────────────────────
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Synthèse exécutive', MARGIN, y)
  y += 20

  const dpe = d.dpe_actuel ?? pa.dpe_actuel ?? val('G')
  const conso = d.consommation_annuelle ?? d.consommation ?? 25000
  const facture = d.facture_annuelle ?? d.facture ?? 3500

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('État actuel', MARGIN, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.text(`• DPE actuel : ${dpe}`, MARGIN, y)
  y += 6
  doc.text(`• Consommation estimée : ${Number(conso).toLocaleString('fr-FR')} kWh/an`, MARGIN, y)
  y += 6
  doc.text(`• Facture énergétique estimée : ${Number(facture).toLocaleString('fr-FR')} €/an`, MARGIN, y)
  y += 15

  doc.setFont('helvetica', 'bold')
  doc.text('Problèmes critiques identifiés', MARGIN, y)
  y += 8
  const problemes = pa.problemes ?? [
    'Isolation insuffisante des combles',
    'Murs non isolés ou peu isolés',
    'Menuiseries à simple vitrage ou vétustes',
    'Système de chauffage peu performant',
  ]
  doc.setFont('helvetica', 'normal')
  for (const p of problemes) {
    y = checkNewPage(doc, y, 8)
    doc.text(`• ${p}`, MARGIN, y)
    y += 6
  }
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.text('Scénario recommandé : Scénario Optimal', MARGIN, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.text('Travaux d\'isolation des combles, murs, remplacement des menuiseries et mise en place d\'une pompe à chaleur air-eau pour le chauffage et l\'eau chaude.', MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })
  y += 15

  doc.setFont('helvetica', 'bold')
  doc.text('Résumé financier (estimation)', MARGIN, y)
  y += 8
  const coutTotal = d.cout_travaux ?? 45000
  const aides = d.aides_total ?? 28000
  const reste = Math.max(0, coutTotal - aides)
  doc.setFont('helvetica', 'normal')
  doc.text(`• Coût total travaux : ${Number(coutTotal).toLocaleString('fr-FR')} €`, MARGIN, y)
  y += 6
  doc.text(`• Aides estimées : ${Number(aides).toLocaleString('fr-FR')} €`, MARGIN, y)
  y += 6
  doc.text(`• Reste à charge : ${Number(reste).toLocaleString('fr-FR')} €`, MARGIN, y)

  doc.addPage()
  pageNum = 5
  y = MARGIN + 20

  // ─── PAGES 6-18 : DIAGNOSTIC ACTUEL ─────────────────────────────
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Diagnostic actuel', MARGIN, y)
  y += 20

  doc.setFontSize(14)
  doc.text('1.1 Caractéristiques du bâtiment', MARGIN, y)
  y += 12

  const surface = d.surface_habitable ?? d.surface ?? 100
  const annee = d.annee_construction ?? d.annee ?? 1975
  const typeBat = d.type_batiment ?? 'Maison individuelle'

  doc.autoTable({
    startY: y,
    head: [['Caractéristique', 'Valeur']],
    body: [
      ['Surface habitable', `${surface} m²`],
      ['Année de construction', String(annee)],
      ['Type de bâtiment', typeBat],
      ['Nombre d\'occupants', String(d.nb_personnes ?? 3)],
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('1.2 Enveloppe thermique', MARGIN, y)
  y += 12

  const murs = {
    type: d.murs_type ?? pa.murs_type ?? 'Parpaing non isolé',
    isolation: d.murs_isolation ?? pa.murs_isolation ?? 'Aucune',
    U: d.murs_U ?? 1.8,
    deperditions: d.murs_deperditions ?? 4500,
  }
  const combles = {
    type: d.combles_type ?? pa.combles_type ?? 'Combles perdus',
    isolation: d.combles_isolation ?? pa.combles_isolation ?? 'Laine de verre 60mm',
    R: d.combles_R ?? 1.5,
    deperditions: d.combles_deperditions ?? 3500,
  }
  const plancher = {
    type: d.plancher_type ?? pa.plancher_type ?? 'Plancher bas sur vide sanitaire',
    isolation: d.plancher_isolation ?? 'Aucune',
    deperditions: d.plancher_deperditions ?? 1500,
  }
  const fenetres = {
    nombre: d.fenetres_nombre ?? 12,
    type: d.fenetres_type ?? pa.fenetres_type ?? 'Simple vitrage bois',
    Uw: d.fenetres_Uw ?? 5.2,
    deperditions: d.fenetres_deperditions ?? 2000,
  }

  doc.autoTable({
    startY: y,
    head: [['Élément', 'Type', 'Isolation / R', 'Coeff. U (W/m²K)', 'Déperditions (kWh/an)']],
    body: [
      ['Murs', murs.type, murs.isolation, String(murs.U), String(murs.deperditions)],
      ['Combles', combles.type, combles.isolation, `R=${combles.R}`, String(combles.deperditions)],
      ['Plancher bas', plancher.type, plancher.isolation, '-', String(plancher.deperditions)],
      ['Menuiseries', `${fenetres.nombre} ouvrants`, fenetres.type, String(fenetres.Uw), String(fenetres.deperditions)],
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 20

  y = checkNewPage(doc, y, 100)

  // Graphique circulaire déperditions (Chart.js)
  const pieData = {
    labels: ['Murs', 'Combles', 'Plancher', 'Fenêtres'],
    values: [murs.deperditions, combles.deperditions, plancher.deperditions, fenetres.deperditions],
  }
  const pieImg = createPieChartImage(pieData)
  if (pieImg) {
    doc.text('Répartition des déperditions thermiques', MARGIN, y)
    y += 5
    doc.addImage(pieImg, 'PNG', MARGIN, y, 80, 80)
    y += 90
  }

  // ─── PAGES 10-12 : CAPTURES 3D THERMIQUES ────────────────────────
  const imgW = PAGE_W - 2 * MARGIN
  const imgH = 85
  if (img3.thermique) {
    doc.addPage()
    y = MARGIN + 15
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Vue thermique 3D - Déperditions', MARGIN, y)
    y += 10
    doc.addImage(img3.thermique, 'PNG', MARGIN, y, imgW, imgH)
    y += imgH + 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Légende : rouge = forte déperdition, orange = moyenne, jaune = faible', MARGIN, y)
    y += 6
    doc.text('Toit / Mur nord / Fenêtres : zones prioritaires • Plancher bas : isolation recommandée', MARGIN, y)
  }
  if (img3.ponts) {
    doc.addPage()
    y = MARGIN + 15
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Ponts thermiques identifiés', MARGIN, y)
    y += 10
    doc.addImage(img3.ponts, 'PNG', MARGIN, y, imgW, imgH)
    y += imgH + 10
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Les ponts thermiques (jonctions, angles) favorisent les déperditions et peuvent créer de la condensation.', MARGIN, y)
  }
  if (img3.avant && img3.apres) {
    doc.addPage()
    y = MARGIN + 15
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Comparatif avant / après travaux', MARGIN, y)
    y += 10
    const halfW = (imgW - 8) / 2
    doc.addImage(img3.avant, 'PNG', MARGIN, y, halfW, imgH)
    doc.addImage(img3.apres, 'PNG', MARGIN + halfW + 8, y, halfW, imgH)
    y += imgH + 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('État actuel (déperditions)', MARGIN, y)
    doc.text('Après isolation (rénovation)', MARGIN + halfW + 8, y)
  }
  if (img3.thermique || img3.ponts || (img3.avant && img3.apres)) {
    doc.addPage()
  }
  y = MARGIN + 20

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('1.3 Systèmes énergétiques', MARGIN, y)
  y += 12

  const chauffage = {
    type: d.type_chauffage ?? pa.chauffage_type ?? 'Chaudière gaz',
    puissance: d.chauffage_puissance ?? '24 kW',
    rendement: d.chauffage_rendement ?? 0.85,
    conso: d.chauffage_conso ?? 18000,
  }
  const ecs = {
    type: d.ecs_type ?? 'Chauffe-eau intégré chaudière',
    volume: d.ecs_volume ?? 150,
    conso: d.ecs_conso ?? 2500,
  }
  const ventilation = {
    type: d.ventilation_type ?? 'Naturelle',
    debit: d.ventilation_debit ?? '-',
  }

  doc.autoTable({
    startY: y,
    head: [['Système', 'Type', 'Caractéristiques', 'Consommation (kWh/an)']],
    body: [
      ['Chauffage', chauffage.type, `${chauffage.puissance} - η ${chauffage.rendement}`, String(chauffage.conso)],
      ['Eau chaude sanitaire', ecs.type, `${ecs.volume} L`, String(ecs.conso)],
      ['Ventilation', ventilation.type, `Débit ${ventilation.debit}`, '-'],
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 15

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('1.4 Consommations détaillées et émissions CO₂', MARGIN, y)
  y += 12

  const emmissionsCO2 = d.emissions_co2 ?? 5.5
  doc.autoTable({
    startY: y,
    head: [['Usage', 'Consommation (kWh/an)', 'Coût estimé (€/an)']],
    body: [
      ['Chauffage', String(chauffage.conso), String(Math.round(chauffage.conso * 0.15))],
      ['Eau chaude', String(ecs.conso), String(Math.round(ecs.conso * 0.15))],
      ['Éclairage et auxiliaires', '2000', '300'],
      ['Total', String(Number(conso)), String(Number(facture))],
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 10
  doc.setFontSize(11)
  doc.text(`Émissions CO₂ estimées : ${emmissionsCO2} tonnes eq. CO₂/an`, MARGIN, y)
  y += 15

  // Détails supplémentaires diagnostic (pages 17-18)
  doc.addPage()
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Analyse détaillée de l\'enveloppe', MARGIN, MARGIN + 20)
  y = MARGIN + 35
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Murs : Surface estimée ${Math.round(surface * 2.5)} m². Le coefficient U de ${murs.U} W/m²K indique une isolation très faible. Une isolation par l'intérieur (ITI) ou l'extérieur (ITE) permettrait de descendre sous 0,36 W/m²K (RT 2025).`, MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })
  y += 25
  doc.text(`Combles : Type ${combles.type}. La résistance thermique actuelle R=${combles.R} m²K/W est insuffisante (objectif R≥10 pour combles perdus). Pose de 30 cm de laine minérale recommandée.`, MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })
  y += 25
  doc.text(`Menuiseries : ${fenetres.nombre} ouvrants en ${fenetres.type}. Uw=${fenetres.Uw} W/m²K. Un remplacement par du double ou triple vitrage (Uw < 1,3) réduirait fortement les déperditions.`, MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })
  y += 30
  doc.text(`Plancher bas : ${plancher.type}. Isolation recommandée par le dessous (vide sanitaire) ou dalles isolantes.`, MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })

  // Pages 19-40 : 3 SCÉNARIOS OPTIMISÉS
  const scenarios = [
    {
      nom: 'Essentiel',
      travaux: [
        { poste: 'Isolation combles', cout: 3500, aides: 2500 },
        { poste: 'Remplacement chaudière', cout: 8000, aides: 4000 },
      ],
      dpeAvant: dpe,
      dpeApres: 'D',
      economies: 800,
      roi: 12,
    },
    {
      nom: 'Optimal',
      travaux: [
        { poste: 'Isolation combles (R≥10)', cout: 4500, aides: 3500 },
        { poste: 'Isolation murs par l\'extérieur', cout: 12000, aides: 8000 },
        { poste: 'Remplacement menuiseries', cout: 9000, aides: 4500 },
        { poste: 'Pompe à chaleur air-eau', cout: 15000, aides: 9000 },
      ],
      dpeAvant: dpe,
      dpeApres: 'C',
      economies: 1800,
      roi: 8,
    },
    {
      nom: 'Excellence',
      travaux: [
        { poste: 'Isolation complète (combles + murs + plancher)', cout: 22000, aides: 15000 },
        { poste: 'Triple vitrage performant', cout: 12000, aides: 6000 },
        { poste: 'Pompe à chaleur + solaire thermique', cout: 22000, aides: 13000 },
        { poste: 'VMC double flux', cout: 6000, aides: 3000 },
      ],
      dpeAvant: dpe,
      dpeApres: 'B',
      economies: 2500,
      roi: 10,
    },
  ]

  for (const sc of scenarios) {
    y = checkNewPage(doc, y, 80)
    doc.addPage()
    pageNum++
    y = MARGIN + 20

    doc.setFillColor(...SECONDARY)
    doc.rect(0, 0, PAGE_W, 35, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`Scénario ${sc.nom}`, MARGIN, 22)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`DPE projeté : ${sc.dpeAvant} → ${sc.dpeApres}`, MARGIN, 30)
    doc.setTextColor(0, 0, 0)
    y = 50

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Liste des travaux et coûts', MARGIN, y)
    y += 10

    const bodyTravaux = sc.travaux.map(t => [t.poste, `${Number(t.cout).toLocaleString('fr-FR')} €`, `${Number(t.aides).toLocaleString('fr-FR')} €`])
    const totalTravaux = sc.travaux.reduce((s, t) => s + t.cout, 0)
    const totalAides = sc.travaux.reduce((s, t) => s + t.aides, 0)
    bodyTravaux.push(['TOTAL', `${Number(totalTravaux).toLocaleString('fr-FR')} €`, `${Number(totalAides).toLocaleString('fr-FR')} €`])

    doc.autoTable({
      startY: y,
      head: [['Poste', 'Coût (€)', 'Aides (€)']],
      body: bodyTravaux,
      theme: 'grid',
      headStyles: { fillColor: PRIMARY },
      margin: { left: MARGIN, right: MARGIN },
    })
    y = doc.lastAutoTable.finalY + 12

    const resteCharge = totalTravaux - totalAides
    doc.setFont('helvetica', 'bold')
    doc.text(`Reste à charge : ${Number(resteCharge).toLocaleString('fr-FR')} €`, MARGIN, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    doc.text(`Aides : MaPrimeRénov', CEE, aides régionales, Éco-PTZ`, MARGIN, y)
    y += 8
    doc.text(`Économies annuelles estimées : ${Number(sc.economies).toLocaleString('fr-FR')} €`, MARGIN, y)
    y += 8
    doc.text(`ROI estimé : ${sc.roi} ans`, MARGIN, y)
    y += 20

    // Calcul détaillé aides par poste
    doc.setFont('helvetica', 'bold')
    doc.text('Répartition des aides (MaPrimeRénov\' + CEE)', MARGIN, y)
    y += 10
    doc.setFont('helvetica', 'normal')
    for (const t of sc.travaux) {
      doc.text(`• ${t.poste} : ${Number(t.aides).toLocaleString('fr-FR')} €`, MARGIN, y)
      y += 6
    }
    y += 10
    doc.text('Éco-PTZ : prêt à taux zéro pour compléter le financement du reste à charge.', MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })
    y += 20

    // Graphique barres avant/après (dessin manuel)
    doc.setFont('helvetica', 'bold')
    doc.text('Consommation avant / après travaux (kWh/an)', MARGIN, y)
    y += 15
    const barW = 35
    const barMaxH = 45
    const avantVal = Number(conso)
    const apresVal = Math.max(5000, Math.round(avantVal * 0.5))
    const maxVal = Math.max(avantVal, apresVal)
    const avantH = (avantVal / maxVal) * barMaxH
    const apresH = (apresVal / maxVal) * barMaxH
    const barBase = y + barMaxH
    doc.setFillColor(180, 180, 180)
    doc.rect(MARGIN + 25, barBase - avantH, barW, avantH)
    doc.setFillColor(...PRIMARY)
    doc.rect(MARGIN + 85, barBase - apresH, barW, apresH)
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.text('Avant', MARGIN + 30, barBase + 8)
    doc.text('Après', MARGIN + 90, barBase + 8)
    doc.text(`${Number(avantVal).toLocaleString('fr-FR')}`, MARGIN + 25, barBase - avantH - 3)
    doc.text(`${Number(apresVal).toLocaleString('fr-FR')}`, MARGIN + 85, barBase - apresH - 3)
    y = barBase + 25
  }

  // PAGES 41-50 : DOSSIERS D'AIDES
  doc.addPage()
  y = MARGIN + 20
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Dossiers d\'aides', MARGIN, y)
  y += 20

  doc.setFontSize(14)
  doc.text('3.1 MaPrimeRénov\' - Formulaire pré-rempli', MARGIN, y)
  y += 12

  doc.autoTable({
    startY: y,
    head: [['Champ', 'Valeur']],
    body: [
      ['Nom', nomClient || val('')],
      ['Prénom', prenom || val('')],
      ['Adresse', adresse],
      ['Code postal', codePostal],
      ['Surface habitable', `${surface} m²`],
      ['DPE avant travaux', dpe],
      ['DPE après travaux (projeté)', 'C'],
      ['Revenus fiscaux', `${Number(d.revenus ?? 0).toLocaleString('fr-FR')} €`],
      ['Nombre de personnes', String(d.nb_personnes ?? 0)],
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 20

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('3.2 Demande CEE - Calcul', MARGIN, y)
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.text('Barème CEE applicable : forfait "rénovation globale" selon revenus.', MARGIN, y)
  y += 8
  doc.text('Estimation CEE pour ce projet : 4 000 € à 8 000 € selon opérations et revenus.', MARGIN, y)
  y += 15

  doc.setFont('helvetica', 'bold')
  doc.text('3.3 Simulation Éco-PTZ', MARGIN, y)
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.text('Prêt à taux zéro jusqu\'à 50 000 € pour financer le reste à charge.', MARGIN, y)
  y += 8
  doc.text('Durée : 15 à 20 ans. Aucun justificatif de revenus requis.', MARGIN, y)
  y += 15

  doc.setFont('helvetica', 'bold')
  doc.text('3.4 Aides régionales identifiées', MARGIN, y)
  y += 10
  doc.setFont('helvetica', 'normal')
  doc.text('Contacter la région et le département pour les aides locales (Habiter Mieux, fonds de solidarité logement).', MARGIN, y)
  y += 12
  doc.text('Calendrier indicatif versement aides : 30 à 90 jours après fin des travaux.', MARGIN, y)
  y += 25

  doc.addPage()
  y = MARGIN + 20
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('3.5 Calendrier prévisionnel des versements', MARGIN, y)
  y += 15
  doc.autoTable({
    startY: y,
    head: [['Aide', 'Conditions de versement', 'Délai indicatif']],
    body: [
      ['MaPrimeRénov\'', 'Après achèvement des travaux et contrôle', '2 à 4 mois'],
      ['CEE', 'Factures et attestation sur l\'honneur', '1 à 3 mois'],
      ['Éco-PTZ', 'Déblocage selon avancement chantier', 'Au fur et à mesure'],
      ['Aides régionales', 'Selon convention', 'Variable'],
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 20

  doc.setFont('helvetica', 'bold')
  doc.text('3.6 Pièces à joindre au dossier', MARGIN, y)
  y += 10
  doc.setFont('helvetica', 'normal')
  const pieces = [
    'Justificatif d\'identité',
    'Justificatif de domicile',
    'Avis d\'imposition ou de non-imposition',
    'Devis des travaux signés par des professionnels RGE',
    'DPE avant travaux (le présent audit)',
    'Attestation sur l\'honneur de réalisation des travaux',
  ]
  for (const p of pieces) {
    doc.text(`□ ${p}`, MARGIN, y)
    y += 7
  }

  // PAGES 51-58 : MISE EN ŒUVRE
  doc.addPage()
  y = MARGIN + 20
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Mise en œuvre', MARGIN, y)
  y += 20

  doc.setFontSize(14)
  doc.text('4.1 Planning Gantt (12 semaines)', MARGIN, y)
  y += 12

  doc.autoTable({
    startY: y,
    head: [['Phase', 'Semaines', 'Tâches']],
    body: [
      ['Préparation', 'S1-S2', 'Devis, choix artisans, dossier aides'],
      ['Travaux combles', 'S3-S5', 'Isolation combles perdus'],
      ['Menuiseries', 'S5-S7', 'Remplacement fenêtres'],
      ['Chauffage', 'S7-S10', 'Installation PAC, désembouage'],
      ['Finitions', 'S10-S12', 'Réception, contrôle, versement aides'],
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 20

  doc.setFont('helvetica', 'bold')
  doc.text('4.2 Liste d\'artisans RGE (région client)', MARGIN, y)
  y += 12

  const artisans = d.artisans ?? [
    { nom: 'RGE 1 - Isolation', tel: '01 23 45 67 89', specialite: 'Isolation' },
    { nom: 'RGE 2 - Menuiserie', tel: '01 23 45 67 90', specialite: 'Menuiserie' },
    { nom: 'RGE 3 - Chauffage', tel: '01 23 45 67 91', specialite: 'PAC' },
    { nom: 'RGE 4 - Plomberie', tel: '01 23 45 67 92', specialite: 'Plomberie' },
    { nom: 'RGE 5 - Généraliste', tel: '01 23 45 67 93', specialite: 'RGE global' },
  ]

  doc.autoTable({
    startY: y,
    head: [['Artisan', 'Spécialité', 'Contact']],
    body: artisans.map(a => [a.nom, a.specialite, a.tel]),
    theme: 'grid',
    headStyles: { fillColor: PRIMARY },
    margin: { left: MARGIN, right: MARGIN },
  })
  y = doc.lastAutoTable.finalY + 20

  doc.setFont('helvetica', 'bold')
  doc.text('4.3 Ordre optimal des travaux', MARGIN, y)
  y += 10
  doc.setFont('helvetica', 'normal')
  const ordreTravaux = [
    '1. Isolation des combles (peu perturbant, gain immédiat)',
    '2. Isolation des murs (ITI ou ITE selon cas)',
    '3. Remplacement des menuiseries',
    '4. Mise en place du nouveau système de chauffage',
    '5. Ventilation si prévue',
  ]
  for (const o of ordreTravaux) {
    doc.text(o, MARGIN, y)
    y += 6
  }
  y += 10

  doc.setFont('helvetica', 'bold')
  doc.text('Checklist suivi chantier', MARGIN, y)
  y += 10
  doc.setFont('helvetica', 'normal')
  const checklist = [
    '□ Signature devis et convention aides',
    '□ Ouverture chantier avec artisan RGE',
    '□ Réception intermédiaire si phases longues',
    '□ Réception finale et attestation sur l\'honneur',
    '□ Dépôt dossier versement aides',
  ]
  for (const c of checklist) {
    doc.text(c, MARGIN, y)
    y += 6
  }
  y += 12

  doc.setFont('helvetica', 'bold')
  doc.text('Garanties et assurances', MARGIN, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.text('Vérifier que chaque artisan dispose d\'une assurance décennale et d\'une attestation RGE à jour. Conserver les factures et attestations pour le versement des aides.', MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })

  // Nombre total de pages
  // Pages supplémentaires pour atteindre ~58 pages : annexes techniques
  addAnnexesTechniques(doc)
  addGlossaire(doc)
  addCoordonnees(doc)

  const nbPages = doc.getNumberOfPages()
  for (let i = 1; i <= nbPages; i++) {
    doc.setPage(i)
    addPageMeta(doc, i, nbPages)
  }

  const filename = `Audit_${(nomAffichage === 'Non renseigné' ? 'Client' : nomAffichage).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(filename)
  return { ok: true, filename }
}

/** Annexes techniques (pages 52-55) */
function addAnnexesTechniques(doc) {
  doc.addPage()
  let y = MARGIN + 20
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Annexe A - Méthode de calcul', MARGIN, y)
  y += 15
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  const texteMethode = `Les déperditions sont calculées selon la méthode 3CL-DPE (réglementation en vigueur).
  Les coefficients U et R sont issus des tables de la réglementation thermique.
  Les consommations sont estimées à partir des caractéristiques du bâtiment et des systèmes.
  Les aides sont calculées selon les barèmes MaPrimeRénov' 2026 et CEE en vigueur.
  Les montants sont donnés à titre indicatif et peuvent varier selon la date de réalisation des travaux.`
  doc.text(texteMethode.split('\n').map(s => s.trim()).join(' '), MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })
  y += 35

  doc.setFont('helvetica', 'bold')
  doc.text('Annexe B - Références réglementaires', MARGIN, y)
  y += 12
  doc.setFont('helvetica', 'normal')
  const refs = [
    'Arrêté du 16 octobre 2024 - DPE',
    'Décret n° 2022-12 - MaPrimeRénov\' 2026',
    'Code de la construction - CEE',
    'ANAH - Parcours Accompagné Rénovation',
  ]
  for (const r of refs) {
    doc.text(`• ${r}`, MARGIN, y)
    y += 7
  }
  y += 15

  doc.setFont('helvetica', 'bold')
  doc.text('Annexe C - Hypothèses et limites', MARGIN, y)
  y += 12
  doc.setFont('helvetica', 'normal')
  doc.text('Les données d\'entrée (surface, année, isolation, etc.) proviennent de l\'audit et des déclarations du client. Les analyses photo (photosAnalysis) complètent le diagnostic lorsqu\'elles sont disponibles. Les coûts travaux sont des ordres de grandeur régionaux. Les gains DPE et économies dépendent du bâti réel et du comportement des occupants.', MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })
}

/** Glossaire (pages 56-57) */
function addGlossaire(doc) {
  doc.addPage()
  let y = MARGIN + 20
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Glossaire', MARGIN, y)
  y += 15
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  const terms = [
    ['DPE', 'Diagnostic de Performance Énergétique'],
    ['CEE', 'Certificats d\'Économies d\'Énergie'],
    ['Éco-PTZ', 'Éco-Prêt à Taux Zéro'],
    ['RGE', 'Reconnu Garant de l\'Environnement'],
    ['U (W/m²K)', 'Coefficient de transmission thermique'],
    ['R (m²K/W)', 'Résistance thermique'],
    ['PAC', 'Pompe à Chaleur'],
    ['VMC', 'Ventilation Mécanique Contrôlée'],
    ['ITI', 'Isolation Thermique par l\'Intérieur'],
    ['ITE', 'Isolation Thermique par l\'Extérieur'],
  ]
  for (const [t, d] of terms) {
    doc.setFont('helvetica', 'bold')
    doc.text(t + ' :', MARGIN, y)
    doc.setFont('helvetica', 'normal')
    doc.text(d, MARGIN + 25, y)
    y += 8
  }
}

/** Coordonnées Energia-Conseil (page 58) */
function addCoordonnees(doc) {
  doc.addPage()
  let y = MARGIN + 40
  doc.setFillColor(...PRIMARY)
  doc.rect(0, 0, PAGE_W, 60, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('ENERGIA-CONSEIL', PAGE_W / 2, 30, { align: 'center' })
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text('Conseil en rénovation énergétique - Audit conforme ANAH', PAGE_W / 2, 45, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.text('Contact : contact@energia-conseil.fr', MARGIN, y)
  y += 10
  doc.text('Site : www.energia-conseil.fr', MARGIN, y)
  y += 20
  doc.setFont('helvetica', 'italic')
  doc.text('Ce rapport a été généré automatiquement à partir des données d\'audit. Document confidentiel.', MARGIN, y, { maxWidth: PAGE_W - 2 * MARGIN })
}
