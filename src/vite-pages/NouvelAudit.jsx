import { useState } from 'react'  
import { useNavigate } from 'react-router-dom'  
import { supabase } from '../lib/supabase'  
import { calculateEnergyAids } from '../lib/calculateEnergyAids'  
 
const formatDate = (date) => {  
  if (!date) return ''  
  const d = new Date(date)  
  const year = d.getFullYear()  
  const month = String(d.getMonth() + 1).padStart(2, '0')  
  const day = String(d.getDate()).padStart(2, '0')  
  return `${year}-${month}-${day}`  
}  
 
const initialForm = {  
  client_name: '',  
  client_prenom: '',  
  client_email: '',  
  client_phone: '',  
  client_address: '',  
  client_postal_code: '',  
  client_city: '',  
  client_departement: '',  
  type_logement: 'maison',  
  annee_construction: '',  
  surface_habitable: '',  
  nb_personnes: '',  
  revenus: '',  
  type_chauffage: '',  
  chauffage_actuel: '',  
  dpe_actuel: 'D',  
  dpe_vise: 'B'  
}  
 
export default function NouvelAudit() {  
  const navigate = useNavigate()  
  const [form, setForm] = useState(initialForm)  
  const [photos, setPhotos] = useState([])  
  const [loading, setLoading] = useState(false)  
  const [loadingMessage, setLoadingMessage] = useState('')  
  const [error, setError] = useState(null)  
 
  const handleChange = (e) => {  
    const { name, value } = e.target  
    setForm((prev) => ({ ...prev, [name]: value }))  
  }  
 
  const handlePhotoChange = (e) => {  
    const files = Array.from(e.target.files)  
    setPhotos(files)  
  }  
  
  const handleSubmit = async (e) => {  
    e.preventDefault()  
    setLoading(true)  
    setError(null)  
 
    try {  
      // 1. Upload photos  
      const photoUrls = []  
      if (photos.length > 0) {  
        setLoadingMessage('Upload des photos...')  
        for (const photo of photos) {  
          // Nettoyer le nom du fichier (remplacer caractères spéciaux par "_")  
          const cleanFileName = photo.name.replace(/[^a-zA-Z0-9.-]/g, '_')  
          const fileName = `${Date.now()}_${cleanFileName}`  
            
          const { data: uploadData, error: uploadError } = await supabase.storage  
            .from('photos')  
            .upload(fileName, photo)  
 
          if (uploadError) throw uploadError  
 
          const { data: { publicUrl } } = supabase.storage  
            .from('photos')  
            .getPublicUrl(fileName)  
 
          photoUrls.push({ url: publicUrl, type: 'facade' })  
        }  
      }  
 
      // 2. Create client  
      setLoadingMessage('Création du client...')  
      const { data: clientData, error: clientError } = await supabase  
        .from('clients')  
        .insert({  
          nom: form.client_name,  
          prenom: form.client_prenom || '',  
          email: form.client_email,  
          telephone: form.client_phone,  
          adresse: form.client_address,  
          code_postal: form.client_postal_code,  
          ville: form.client_city || '',  
          departement: form.client_departement || ''  
        })  
        .select()  
        .single()  
 
      if (clientError) throw clientError  
  
      // 3. Create audit (SIMPLIFIÉ)  
      setLoadingMessage("Création de l'audit...")  
      const { data: auditData, error: auditError } = await supabase  
        .from('audits')  
        .insert({  
          client_id: clientData.id,  
          status: 'en_attente'  
        })  
        .select()  
        .single()  
 
      if (auditError) throw auditError  
 
      // 4. Insert photos  
      if (photoUrls.length > 0) {  
        setLoadingMessage('Enregistrement des photos...')  
        const photosToInsert = photoUrls.map(p => ({  
          audit_id: auditData.id,  
          url: p.url,  
          type: p.type  
        }))  
 
        const { error: photosError } = await supabase  
          .from('photos')  
          .insert(photosToInsert)  
 
        if (photosError) throw photosError  
      }  
 
      // 5. Calculate aids  
      setLoadingMessage('Calcul des aides financières...')  
      const aides = calculateEnergyAids({  
        revenus: parseFloat(form.revenus) || 0,  
        nb_personnes: parseInt(form.nb_personnes) || 1,  
        code_postal: form.client_postal_code,  
        dpe_actuel: form.dpe_actuel,  
        dpe_vise: form.dpe_vise || 'B'  
      })  
  
      // Success  
      setLoadingMessage('Audit créé avec succès !')  
      setTimeout(() => {  
        navigate(`/audits/${auditData.id}`)  
      }, 1000)  

    } catch (err) {  
      console.error('Erreur:', err)  
      setError(err.message)  
      setLoading(false)  
    }  
  }  
 
  return (  
    <div className="min-h-screen bg-gray-50 py-8">  
      <div className="max-w-4xl mx-auto px-4">  
        <div className="mb-6">  
          <button  
            onClick={() => navigate('/audits')}  
            className="text-teal-600 hover:text-teal-700 flex items-center gap-2"  
          >  
            ← Retour  
          </button>  
        </div>  
 
        <div className="bg-white rounded-lg shadow-sm p-8">  
          <h1 className="text-3xl font-bold text-teal-700 mb-8">  
            Nouvel Audit Énergétique  
          </h1>  
 
          {error && (  
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">  
              {error}  
            </div>  
          )}  
 
          {loading && (  
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700">  
              {loadingMessage}  
            </div>  
          )}  

          <form onSubmit={handleSubmit} className="space-y-8">  
            {/* Informations client */}  
            <section>  
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">  
                👤 Informations client  
              </h2>  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Nom complet *  
                  </label>  
                  <input  
                    type="text"  
                    name="client_name"  
                    value={form.client_name}  
                    onChange={handleChange}  
                    required  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
 
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Prénom  
                  </label>  
                  <input  
                    type="text"  
                    name="client_prenom"  
                    value={form.client_prenom}  
                    onChange={handleChange}  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
 
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Téléphone *  
                  </label>  
                  <input  
                    type="tel"  
                    name="client_phone"  
                    value={form.client_phone}  
                    onChange={handleChange}  
                    required  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
 
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Email  
                  </label>  
                  <input  
                    type="email"  
                    name="client_email"  
                    value={form.client_email}  
                    onChange={handleChange}  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
 
                <div className="md:col-span-2">  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Adresse *  
                  </label>  
                  <input  
                    type="text"  
                    name="client_address"  
                    value={form.client_address}  
                    onChange={handleChange}  
                    required  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
 
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Code postal *  
                  </label>  
                  <input  
                    type="text"  
                    name="client_postal_code"  
                    value={form.client_postal_code}  
                    onChange={handleChange}  
                    required  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
  
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Ville  
                  </label>  
                  <input  
                    type="text"  
                    name="client_city"  
                    value={form.client_city}  
                    onChange={handleChange}  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  

                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Nombre de personnes *  
                  </label>  
                  <input  
                    type="number"  
                    name="nb_personnes"  
                    value={form.nb_personnes}  
                    onChange={handleChange}  
                    required  
                    min="1"  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
 
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Revenus annuels (€) *  
                  </label>  
                  <input  
                    type="number"  
                    name="revenus"  
                    value={form.revenus}  
                    onChange={handleChange}  
                    required  
                    min="0"  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
              </div>  
            </section>  
 
            {/* Caractéristiques du logement */}  
            <section>  
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">  
                🏠 Caractéristiques du logement  
              </h2>  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Type de logement  
                  </label>  
                  <select  
                    name="type_logement"  
                    value={form.type_logement}  
                    onChange={handleChange}  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  >  
                    <option value="maison">Maison individuelle</option>  
                    <option value="appartement">Appartement</option>  
                  </select>  
                </div>  
 
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Année de construction  
                  </label>  
                  <input  
                    type="text"  
                    name="annee_construction"  
                    value={form.annee_construction}  
                    onChange={handleChange}  
                    placeholder="Ex: 1975"  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
 
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Surface habitable (m²) *  
                  </label>  
                  <input  
                    type="number"  
                    name="surface_habitable"  
                    value={form.surface_habitable}  
                    onChange={handleChange}  
                    required  
                    min="0"  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  

                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    Type de chauffage  
                  </label>  
                  <input  
                    type="text"  
                    name="type_chauffage"  
                    value={form.type_chauffage}  
                    onChange={handleChange}  
                    placeholder="Ex: Gaz, Électrique, Fioul..."  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  />  
                </div>  
 
                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    DPE actuel  
                  </label>  
                  <select  
                    name="dpe_actuel"  
                    value={form.dpe_actuel}  
                    onChange={handleChange}  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  >  
                    <option value="A">A</option>  
                    <option value="B">B</option>  
                    <option value="C">C</option>  
                    <option value="D">D</option>  
                    <option value="E">E</option>  
                    <option value="F">F</option>  
                    <option value="G">G</option>  
                  </select>  
                </div>  

                <div>  
                  <label className="block text-sm font-medium text-gray-700 mb-1">  
                    DPE visé  
                  </label>  
                  <select  
                    name="dpe_vise"  
                    value={form.dpe_vise}  
                    onChange={handleChange}  
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
                  >  
                    <option value="A">A</option>  
                    <option value="B">B</option>  
                    <option value="C">C</option>  
                    <option value="D">D</option>  
                    <option value="E">E</option>  
                  </select>  
                </div>  
              </div>  
            </section>  
 
            {/* Photos */}  
            <section>  
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">  
                📸 Photos du logement  
              </h2>  
              <input  
                type="file"  
                multiple  
                accept="image/*"  
                onChange={handlePhotoChange}  
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"  
              />  
              {photos.length > 0 && (  
                <p className="mt-2 text-sm text-gray-600">  
                  {photos.length} photo(s) sélectionnée(s)  
                </p>  
              )}  
            </section>  

            {/* Submit */}  
            <div className="flex gap-4">  
              <button  
                type="button"  
                onClick={() => navigate('/audits')}  
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"  
                disabled={loading}  
              >  
                Annuler  
              </button>  
              <button  
                type="submit"  
                disabled={loading}  
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:bg-gray-400"  
              >  
                {loading ? loadingMessage : "Créer l'audit"}  
              </button>  
            </div>  
          </form>  
        </div>  
      </div>  
    </div>  
  )  
}  