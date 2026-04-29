'use client'

import { useState } from 'react'

type Categorie = 'Bleu' | 'Jaune' | 'Violet' | 'Rose'
type ZoneClimatique = 'H1' | 'H2' | 'H3'
type ModeChauffage = 'electrique' | 'gaz' | 'fioul'
type PvMode = 'edfoa' | 'batterie'

const PLAFONDS_REVENUS = [
  { personnes: 1, bleu: 17009, jaune: 21805, violet: 30549 },
  { personnes: 2, bleu: 24875, jaune: 31892, violet: 44674 },
  { personnes: 3, bleu: 29917, jaune: 38349, violet: 53714 },
  { personnes: 4, bleu: 34948, jaune: 44802, violet: 62753 },
  { personnes: 5, bleu: 40002, jaune: 51281, violet: 71793 },
]

const REGIONS: { label: string; zone: ZoneClimatique }[] = [
  { label: 'Hauts-de-France', zone: 'H1' },
  { label: 'Grand Est', zone: 'H1' },
  { label: 'Bourgogne-Franche-Comte', zone: 'H1' },
  { label: 'Ile-de-France', zone: 'H1' },
  { label: 'Normandie', zone: 'H1' },
  { label: 'Bretagne', zone: 'H1' },
  { label: 'Pays de la Loire', zone: 'H2' },
  { label: 'Centre-Val de Loire', zone: 'H2' },
  { label: 'Nouvelle-Aquitaine', zone: 'H2' },
  { label: 'Auvergne-Rhone-Alpes', zone: 'H2' },
  { label: 'Occitanie', zone: 'H3' },
  { label: 'PACA', zone: 'H3' },
  { label: 'Corse', zone: 'H3' },
]

const COEFF_ZONE: Record<ZoneClimatique, number> = { H1: 100, H2: 80, H3: 60 }
const TAUX_MPR: Record<Categorie, number> = { Bleu: 0.7, Jaune: 0.6, Violet: 0.45, Rose: 0.3 }
const MPR_CET: Record<Categorie, number> = { Bleu: 1200, Jaune: 800, Violet: 400, Rose: 0 }
const PLAFONDS_TRAVAUX = { pacAirEau: 16000, pacAirAir: 4000, vmcDouble: 6000, vmcSimple: 3000, fenetres: 700, portes: 500, volets: 300 }
const COULEURS: Record<Categorie, string> = {
  Bleu: 'bg-blue-100 text-blue-800 border-blue-300',
  Jaune: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  Violet: 'bg-purple-100 text-purple-800 border-purple-300',
  Rose: 'bg-pink-100 text-pink-800 border-pink-300',
}

const fmt = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

function getCategorie(revenus: number, personnes: number): Categorie {
  const p = PLAFONDS_REVENUS[Math.min(Math.max(personnes, 1) - 1, 4)]
  if (revenus <= p.bleu) return 'Bleu'
  if (revenus <= p.jaune) return 'Jaune'
  if (revenus <= p.violet) return 'Violet'
  return 'Rose'
}

export default function Dashboard() {
  const [revenus, setRevenus] = useState(0)
  const [personnes, setPersonnes] = useState(1)
  const [surface, setSurface] = useState(0)
  const [region, setRegion] = useState('Ile-de-France')
  const [factureEDF, setFactureEDF] = useState(0)
  const [modeChauffage, setModeChauffage] = useState<ModeChauffage>('electrique')

  const [combles, setCombles] = useState(0)
  const [ite, setIte] = useState(0)
  const [iti, setIti] = useState(0)
  const [plancher, setPlancher] = useState(0)

  const [pacAirEauPuissance, setPacAirEauPuissance] = useState(0)
  const [pacAirEauPrix, setPacAirEauPrix] = useState(0)
  const [pacAirAirSplits, setPacAirAirSplits] = useState(0)
  const [pacAirAirPrix, setPacAirAirPrix] = useState(0)
  const [cetPrix, setCetPrix] = useState(0)

  const [vmcDouble, setVmcDouble] = useState(false)
  const [vmcSimple, setVmcSimple] = useState(false)
  const [fenetres, setFenetres] = useState(0)
  const [portes, setPortes] = useState(0)
  const [volets, setVolets] = useState(0)

  const [pvKwc, setPvKwc] = useState(0)
  const [pvPrix, setPvPrix] = useState(0)
  const [pvMode, setPvMode] = useState<PvMode>('edfoa')

  const [tarifCombles, setTarifCombles] = useState(25)
  const [tarifITE, setTarifITE] = useState(150)
  const [tarifITI, setTarifITI] = useState(50)
  const [tarifPlancher, setTarifPlancher] = useState(20)
  const [tarifPacAirEau, setTarifPacAirEau] = useState(12000)
  const [tarifPacAirAirParSplit, setTarifPacAirAirParSplit] = useState(2400)
  const [tarifCET, setTarifCET] = useState(3000)
  const [tarifVmcDouble, setTarifVmcDouble] = useState(6000)
  const [tarifVmcSimple, setTarifVmcSimple] = useState(3000)
  const [tarifFenetre, setTarifFenetre] = useState(1500)
  const [tarifPorte, setTarifPorte] = useState(1200)
  const [tarifVolet, setTarifVolet] = useState(600)
  const [tarifPVParKwc, setTarifPVParKwc] = useState(1800)

  const [showTarifs, setShowTarifs] = useState(false)
  const [calcule, setCalcule] = useState(false)

  const zoneRegion = REGIONS.find((r) => r.label === region)?.zone ?? 'H2'
  const coeffZone = COEFF_ZONE[zoneRegion]
  const categorie = getCategorie(revenus, personnes)
  const taux = TAUX_MPR[categorie]

  const pacRecommandeeKw = surface > 0 ? Math.round(((surface * coeffZone) / 1000) * 10) / 10 : 0
  const pvRecommande = factureEDF <= 0 ? 0 : factureEDF < 100 ? 3 : factureEDF < 200 ? 6 : factureEDF < 300 ? 9 : 12

  const coutPacAirEau = pacAirEauPrix > 0 ? pacAirEauPrix : pacAirEauPuissance > 0 ? tarifPacAirEau : 0
  const coutPacAirAir = pacAirAirPrix > 0 ? pacAirAirPrix : pacAirAirSplits > 0 ? pacAirAirSplits * tarifPacAirAirParSplit : 0
  const coutPV = pvPrix > 0 ? pvPrix : pvKwc > 0 ? Math.round(pvKwc * tarifPVParKwc) : 0
  const prixBatterie = pvMode === 'batterie' ? 5000 : 0

  const aideCombles = combles > 0 ? Math.round(combles * 30 * taux) : 0
  const aideITE = ite > 0 ? Math.round(ite * 75 * taux) : 0
  const aideITI = iti > 0 ? Math.round(iti * 25 * taux) : 0
  const aidePlancher = plancher > 0 ? Math.round(plancher * 25 * taux) : 0
  const aidePacAirEau = coutPacAirEau > 0 ? Math.round(Math.min(coutPacAirEau, PLAFONDS_TRAVAUX.pacAirEau) * taux) : 0
  const aidePacAirAir = coutPacAirAir > 0 ? Math.round(Math.min(coutPacAirAir, PLAFONDS_TRAVAUX.pacAirAir * Math.max(1, pacAirAirSplits)) * taux) : 0
  const aideCET = cetPrix > 0 ? MPR_CET[categorie] : 0
  const aideVmcDouble = vmcDouble ? Math.round(PLAFONDS_TRAVAUX.vmcDouble * taux) : 0
  const aideVmcSimple = vmcSimple ? Math.round(PLAFONDS_TRAVAUX.vmcSimple * taux) : 0
  const aideFenetres = fenetres > 0 ? Math.round(fenetres * PLAFONDS_TRAVAUX.fenetres * taux) : 0
  const aidePortes = portes > 0 ? Math.round(portes * PLAFONDS_TRAVAUX.portes * taux) : 0
  const aideVolets = volets > 0 ? Math.round(volets * PLAFONDS_TRAVAUX.volets * taux) : 0
  const totalMPR = aideCombles + aideITE + aideITI + aidePlancher + aidePacAirEau + aidePacAirAir + aideCET + aideVmcDouble + aideVmcSimple + aideFenetres + aidePortes + aideVolets

  const ceePacAirEau = coutPacAirEau > 0 ? 2500 : 0
  const ceeCombles = combles > 0 ? Math.round(combles * 8) : 0
  const ceeITE = ite > 0 ? Math.round(ite * 15) : 0
  const ceeITI = iti > 0 ? Math.round(iti * 8) : 0
  const ceePlancher = plancher > 0 ? Math.round(plancher * 6) : 0
  const ceeVmcDouble = vmcDouble ? 500 : 0
  const ceeFenetres = fenetres > 0 ? Math.round(fenetres * 75) : 0
  const totalCEE = ceePacAirEau + ceeCombles + ceeITE + ceeITI + ceePlancher + ceeVmcDouble + ceeFenetres

  const totalTravaux =
    combles * tarifCombles + ite * tarifITE + iti * tarifITI + plancher * tarifPlancher +
    coutPacAirEau + coutPacAirAir + cetPrix +
    (vmcDouble ? tarifVmcDouble : 0) + (vmcSimple ? tarifVmcSimple : 0) +
    fenetres * tarifFenetre + portes * tarifPorte + volets * tarifVolet +
    coutPV + prixBatterie
  const totalAides = totalMPR + totalCEE
  const resteACharge = totalTravaux - totalAides

  const nbGestes = [combles, ite, iti, plancher, coutPacAirEau, vmcDouble ? 1 : 0, fenetres].filter((v) => v > 0).length
  const ecoPTZMax = nbGestes === 1 ? 15000 : nbGestes === 2 ? 25000 : nbGestes >= 3 ? 30000 : 0

  const primeAutoConsommation = pvKwc <= 0 || pvMode === 'batterie' ? 0 : pvKwc <= 9 ? pvKwc * 80 : pvKwc <= 36 ? pvKwc * 140 : pvKwc * 70
  const productionAnnuelle = pvKwc * 1100
  const tarifRachat = pvKwc <= 9 ? 0.04 : 0.0536
  const revenuSurplusAnnuel = pvMode === 'edfoa' ? Math.round(productionAnnuelle * 0.4 * tarifRachat) : 0
  const economieBatterieAnnuelle = pvMode === 'batterie' ? Math.round(productionAnnuelle * 0.85 * 0.25) : 0

  const gainChauffage = modeChauffage === 'electrique' ? 0.7 : modeChauffage === 'gaz' ? 0.5 : 0.6
  const econoChauffage = factureEDF > 0 ? Math.round(factureEDF * 0.6 * gainChauffage) : 0
  const econoECS = factureEDF > 0 ? Math.round(factureEDF * 0.2 * 0.6) : 0
  const econoDeperditions = factureEDF > 0 ? Math.round(factureEDF * 0.2 * 0.4) : 0
  const totalEconomiesMois = econoChauffage + econoECS + econoDeperditions
  const totalEconomiesAn = totalEconomiesMois * 12

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 print:bg-white'>
      <header className='bg-green-700 text-white px-6 py-4 flex items-center justify-between print:hidden'>
        <div><h1 className='text-2xl font-bold'>⚡ Renov&apos;Optim IA</h1><p className='text-green-200 text-sm'>Calculateur d&apos;aides financieres 2026</p></div>
        <span className='text-xs bg-green-600 px-3 py-1 rounded-full'>MaPrimeRenov&apos; 2026</span>
      </header>
      <div className='max-w-5xl mx-auto px-4 py-8 space-y-8'>
        <section className='bg-white rounded-2xl shadow-lg p-6 border border-green-100'>
          <h2 className='text-xl font-bold text-green-800 mb-4'>👤 Etape 1 — Votre foyer</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <input type='number' value={revenus || ''} onChange={(e) => setRevenus(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='Revenus' />
            <select value={personnes} onChange={(e) => setPersonnes(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2'>{[1,2,3,4,5].map((n)=><option key={n} value={n}>{n} personne{n>1?'s':''}</option>)}</select>
            <input type='number' value={surface || ''} onChange={(e) => setSurface(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='Surface m²' />
            <select value={region} onChange={(e) => setRegion(e.target.value)} className='w-full border rounded-lg px-3 py-2'>{REGIONS.map((r)=><option key={r.label} value={r.label}>{r.label} — Zone {r.zone}</option>)}</select>
          </div>
        </section>

        <section className='bg-white rounded-2xl shadow-lg p-6 border border-green-100'>
          <h2 className='text-lg font-bold text-green-800 mb-4'>⚡ Situation energetique actuelle</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <input type='number' value={factureEDF || ''} onChange={(e) => setFactureEDF(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='Facture EDF / mois' />
            <select value={modeChauffage} onChange={(e) => setModeChauffage(e.target.value as ModeChauffage)} className='w-full border rounded-lg px-3 py-2'><option value='electrique'>Electrique</option><option value='gaz'>Gaz</option><option value='fioul'>Fioul</option></select>
          </div>
        </section>

        <section className='bg-white rounded-2xl shadow-lg p-6 border border-green-100'>
          <h2 className='text-xl font-bold text-green-800 mb-6'>🏠 Etape 2 — Vos travaux</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <input type='number' value={combles || ''} onChange={(e) => setCombles(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='Combles m²' />
            <input type='number' value={ite || ''} onChange={(e) => setIte(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='ITE m²' />
            <input type='number' value={iti || ''} onChange={(e) => setIti(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='ITI m²' />
            <input type='number' value={plancher || ''} onChange={(e) => setPlancher(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='Plancher m²' />
            <input type='number' value={pacAirEauPuissance || ''} onChange={(e) => setPacAirEauPuissance(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder={`PAC Air/Eau kW (rec ${pacRecommandeeKw || 0})`} />
            <input type='number' value={pacAirEauPrix || ''} onChange={(e) => setPacAirEauPrix(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder={`PAC Air/Eau prix (auto ${fmt(tarifPacAirEau)})`} />
            <input type='number' value={pacAirAirSplits || ''} onChange={(e) => setPacAirAirSplits(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='PAC Air/Air splits' />
            <input type='number' value={pacAirAirPrix || ''} onChange={(e) => setPacAirAirPrix(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder={`PAC Air/Air prix (auto ${fmt(tarifPacAirAirParSplit)}/split)`} />
            <input type='number' value={cetPrix || ''} onChange={(e) => setCetPrix(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2 md:col-span-2' placeholder={`CET prix (forfait MPR: B1200/J800/V400)`} />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
            <label className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition ${vmcDouble ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200'}`}>
              <input type='checkbox' checked={vmcDouble} onChange={(e) => { setVmcDouble(e.target.checked); if (e.target.checked) setVmcSimple(false) }} className='w-5 h-5 accent-cyan-600' />
              <span>VMC Double Flux</span>
            </label>
            <label className={`flex items-center gap-3 border-2 rounded-xl p-4 cursor-pointer transition ${vmcSimple ? 'border-cyan-400 bg-cyan-50' : 'border-gray-200'}`}>
              <input type='checkbox' checked={vmcSimple} onChange={(e) => { setVmcSimple(e.target.checked); if (e.target.checked) setVmcDouble(false) }} className='w-5 h-5 accent-cyan-600' />
              <span>VMC Simple Flux</span>
            </label>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
            <input type='number' value={fenetres || ''} onChange={(e) => setFenetres(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='Fenetres' />
            <input type='number' value={portes || ''} onChange={(e) => setPortes(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='Portes' />
            <input type='number' value={volets || ''} onChange={(e) => setVolets(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2' placeholder='Volets' />
          </div>

          <div className='border rounded-xl p-4 bg-gray-50 space-y-3'>
            <input type='number' value={pvKwc || ''} onChange={(e) => setPvKwc(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2 bg-white' placeholder={`PV kWc (rec ${pvRecommande || 0})`} />
            <input type='number' value={pvPrix || ''} onChange={(e) => setPvPrix(Number(e.target.value))} className='w-full border rounded-lg px-3 py-2 bg-white' placeholder={`PV prix (auto ${fmt(tarifPVParKwc)}/kWc)`} />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <label className={`flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition ${pvMode === 'edfoa' ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}><input type='radio' checked={pvMode === 'edfoa'} onChange={() => setPvMode('edfoa')} /> EDF OA</label>
              <label className={`flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition ${pvMode === 'batterie' ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}><input type='radio' checked={pvMode === 'batterie'} onChange={() => setPvMode('batterie')} /> Batterie 5000€</label>
            </div>
          </div>
        </section>

        <section className='bg-white rounded-2xl shadow-lg border border-orange-100'>
          <button onClick={() => setShowTarifs(!showTarifs)} className='w-full flex items-center justify-between px-6 py-4'><h2 className='text-lg font-bold text-orange-700'>Tarifs modifiables</h2><span>{showTarifs ? '▲' : '▼'}</span></button>
          {showTarifs && (
            <div className='px-6 pb-6 border-t border-orange-100 grid grid-cols-1 md:grid-cols-3 gap-2 pt-4'>
              <input type='number' value={tarifCombles} onChange={(e) => setTarifCombles(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifITE} onChange={(e) => setTarifITE(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifITI} onChange={(e) => setTarifITI(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifPlancher} onChange={(e) => setTarifPlancher(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifPacAirEau} onChange={(e) => setTarifPacAirEau(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifPacAirAirParSplit} onChange={(e) => setTarifPacAirAirParSplit(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifCET} onChange={(e) => setTarifCET(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifVmcDouble} onChange={(e) => setTarifVmcDouble(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifVmcSimple} onChange={(e) => setTarifVmcSimple(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifFenetre} onChange={(e) => setTarifFenetre(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifPorte} onChange={(e) => setTarifPorte(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifVolet} onChange={(e) => setTarifVolet(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
              <input type='number' value={tarifPVParKwc} onChange={(e) => setTarifPVParKwc(Number(e.target.value))} className='w-full border rounded px-2 py-1' />
            </div>
          )}
        </section>

        <div className='flex justify-center print:hidden'><button onClick={() => setCalcule(true)} className='bg-green-600 text-white font-bold text-lg px-10 py-4 rounded-2xl'>⚡ Calculer mes aides 2026</button></div>

        {calcule && (
          <section className='bg-white rounded-2xl shadow-xl p-6 border-2 border-green-400'>
            <h2 className='text-xl font-bold text-green-800 mb-4'>💰 Resultats</h2>
            <div className='space-y-2'>
              <div className='flex justify-between py-2 px-4 bg-gray-50 rounded-xl'><span>Cout travaux</span><span className='font-bold'>{fmt(totalTravaux)}</span></div>
              <div className='flex justify-between py-2 px-4 bg-green-50 rounded-xl'><span>Total MPR</span><span className='font-bold'>{fmt(totalMPR)}</span></div>
              <div className='flex justify-between py-2 px-4 bg-purple-50 rounded-xl'><span>Total CEE</span><span className='font-bold'>{fmt(totalCEE)}</span></div>
              <div className='flex justify-between py-2 px-4 bg-green-100 rounded-xl'><span>Total aides</span><span className='font-bold'>{fmt(totalAides)}</span></div>
              <div className='flex justify-between py-3 px-4 bg-green-600 rounded-xl text-white'><span className='font-bold'>Reste a charge</span><span className='font-black'>{fmt(resteACharge)}</span></div>
            </div>
            {ecoPTZMax > 0 && <p className='mt-3'>Eco-PTZ: jusqu&apos;a {fmt(ecoPTZMax)} ({nbGestes} gestes)</p>}
            {pvKwc > 0 && <p className='mt-2'>PV {pvKwc} kWc: prime {fmt(primeAutoConsommation)} | surplus {fmt(revenuSurplusAnnuel)} | batterie {fmt(economieBatterieAnnuelle)}/an</p>}
            <p className='mt-2'>Economies: -{fmt(totalEconomiesMois)}/mois | -{fmt(totalEconomiesAn)}/an</p>
          </section>
        )}
      </div>
    </div>
  )
}
