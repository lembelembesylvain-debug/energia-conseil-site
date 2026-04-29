'use client'  
import { useState } from 'react'

export default function Dashboard() {  
  const [step, setStep] = useState(1)  
  const [revenus, setRevenus] = useState(0)  
  const [combles, setCombles] = useState(0)  
  const [pac, setPac] = useState(false)

  const cat = () => {  
    if (revenus <= 21805) return 'Bleu'  
    if (revenus <= 29148) return 'Jaune'  
    if (revenus <= 43792) return 'Violet'  
    return 'Rose'  
  }

  const mpr = () => {  
    const c = cat()  
    let t = 0  
    if (c === 'Bleu') { t += combles * 25; if (pac) t += 5000 }  
    if (c === 'Jaune') { t += combles * 20; if (pac) t += 4000 }  
    if (c === 'Violet') { t += combles * 15; if (pac) t += 3000 }  
    return t  
  }

  return (  
    <div className="min-h-screen bg-gray-50 p-8">  
      <h1 className="text-2xl font-bold text-green-600 mb-6">Renov Optim IA</h1>  
      <div className="flex gap-2 mb-6">  
        {[1,2,3].map(s => (  
          <div key={s} className={`px-4 py-2 rounded font-bold ${step===s ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>  
            Etape {s}  
          </div>  
        ))}  
      </div>

      {step === 1 && (  
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">  
          <h2 className="text-xl font-bold mb-4">Logement & Profil</h2>  
          <label className="block mb-2 font-medium">Revenus fiscaux annuels (euros)</label>  
          <input type="number" className="w-full border p-3 rounded mb-2" onChange={e => setRevenus(Number(e.target.value))} />  
          <p className="text-green-600 font-bold mb-4">Categorie MPR : {cat()}</p>  
          <button onClick={() => setStep(2)} className="bg-green-600 text-white p-3 rounded w-full font-bold">Etape suivante</button>  
        </div>  
      )}

      {step === 2 && (  
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">  
          <h2 className="text-xl font-bold mb-4">Travaux</h2>  
          <label className="block mb-2 font-medium">Isolation combles (m2)</label>  
          <input type="number" className="w-full border p-3 rounded mb-4" onChange={e => setCombles(Number(e.target.value))} />  
          <label className="flex items-center gap-3 mb-6 cursor-pointer">  
            <input type="checkbox" className="w-5 h-5" onChange={e => setPac(e.target.checked)} />  
            <span className="font-medium">PAC air/eau</span>  
          </label>  
          <button onClick={() => setStep(3)} className="bg-green-600 text-white p-3 rounded w-full font-bold">Voir les resultats</button>  
        </div>  
      )}

      {step === 3 && (  
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">  
          <h2 className="text-xl font-bold mb-6">Resultats</h2>  
          <div className="grid grid-cols-2 gap-4 mb-6">  
            <div className="bg-green-50 p-4 rounded-lg text-center">  
              <p className="text-sm text-gray-600">Categorie MPR</p>  
              <p className="text-2xl font-bold text-green-600">{cat()}</p>  
            </div>  
            <div className="bg-green-50 p-4 rounded-lg text-center">  
              <p className="text-sm text-gray-600">MaPrimeRenov</p>  
              <p className="text-2xl font-bold text-green-600">{mpr().toLocaleString('fr-FR')} euros</p>  
            </div>  
          </div>  
          <button onClick={() => window.print()} className="bg-green-600 text-white p-3 rounded w-full font-bold">  
            Imprimer / Enregistrer PDF  
          </button>  
        </div>  
      )}  
    </div>  
  )  
}  