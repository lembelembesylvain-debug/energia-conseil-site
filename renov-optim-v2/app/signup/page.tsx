'use client'  
import { useState } from 'react'

export default function Dashboard() {  
  const [step, setStep] = useState(1)  
  const [surface, setSurface] = useState(0)  
  const [revenus, setRevenus] = useState(0)  
  const [personnes, setPersonnes] = useState(1)  
  const [combles, setCombles] = useState(0)  
  const [pac, setPac] = useState(false)

  const getCategorie = () => {  
    if (revenus <= 21805) return 'Bleu'  
    if (revenus <= 29148) return 'Jaune'  
    if (revenus <= 43792) return 'Violet'  
    return 'Rose'  
  }

  const calcMPR = () => {  
    const cat = getCategorie()  
    let total = 0  
    if (cat === 'Bleu') { total += combles * 25; if (pac) total += 5000 }  
    if (cat === 'Jaune') { total += combles * 20; if (pac) total += 4000 }  
    if (cat === 'Violet') { total += combles * 15; if (pac) total += 3000 }  
    return total  
  }

  return (  
    <div className="min-h-screen bg-gray-50 p-8">  
      <h1 className="text-2xl font-bold text-green-600 mb-6">Renov Optim IA</h1>

      {step === 1 && (  
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">  
          <h2 className="text-xl font-bold mb-4">Etape 1 — Logement</h2>  
          <label className="block mb-2">Surface (m²)</label>  
          <input type="number" className="w-full border p-3 rounded mb-4" onChange={e => setSurface(Number(e.target.value))} />  
          <label className="block mb-2">Revenus fiscaux (€/an)</label>  
          <input type="number" className="w-full border p-3 rounded mb-4" onChange={e => setRevenus(Number(e.target.value))} />  
          <label className="block mb-2">Personnes au foyer</label>  
          <input type="number" className="w-full border p-3 rounded mb-4" onChange={e => setPersonnes(Number(e.target.value))} />  
          <p className="text-green-600 font-bold mb-4">Categorie : {getCategorie()}</p>  
          <button onClick={() => setStep(2)} className="bg-green-600 text-white p-3 rounded w-full font-bold">Etape suivante</button>  
        </div>  
      )}

      {step === 2 && (  
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">  
          <h2 className="text-xl font-bold mb-4">Etape 2 — Travaux</h2>  
          <label className="block mb-2">Isolation combles (m²)</label>  
          <input type="number" className="w-full border p-3 rounded mb-4" onChange={e => setCombles(Number(e.target.value))} />  
          <label className="flex items-center gap-2 mb-4">  
            <input type="checkbox" onChange={e => setPac(e.target.checked)} />  
            PAC air/eau  
          </label>  
          <button onClick={() => setStep(3)} className="bg-green-600 text-white p-3 rounded w-full font-bold">Voir les resultats</button>  
        </div>  
      )}

      {step === 3 && (  
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">  
          <h2 className="text-xl font-bold mb-4">Etape 3 — Resultats</h2>  
          <p className="text-lg mb-2">Categorie MPR : <strong className="text-green-600">{getCategorie()}</strong></p>  
          <p className="text-lg mb-2">MaPrimeRenov : <strong className="text-green-600">{calcMPR().toLocaleString('fr-FR')} €</strong></p>  
          <button onClick={() => window.print()} className="bg-green-600 text-white p-3 rounded w-full font-bold mt-4">  
            Imprimer / Enregistrer PDF  
          </button>  
        </div>  
      )}  
    </div>  
  )  
}  