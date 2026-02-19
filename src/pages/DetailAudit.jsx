import { useEffect, useState } from 'react'  
import { useParams, useNavigate } from 'react-router-dom'  
import { supabase } from '../lib/supabase'
const ENERGIA_GREEN = '#0f766e'  
 
function val(value) {  
  return value || '-'  
}  
 
function formatDate(value) {  
  if (!value) return '-'  
  const d = new Date(value)  
  return isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR', {  
    day: '2-digit',  
    month: '2-digit',  
    year: 'numeric',  
  })  
}  
  
const PHOTO_TYPE_LABELS = {  
  facade: '🏠 Façade',  
  combles: '🏚️ Combles',  
  chauffage: '🔥 Chauffage',  
  autre: '📷 Autre',  
}  
  
export default function DetailAudit() {
  const generatePDF = () => {
    window.print()
  }

  const { id } = useParams()  
  const navigate = useNavigate()  
  const [audit, setAudit] = useState(null)  
  const [client, setClient] = useState(null)  
  const [photos, setPhotos] = useState([])  
  const [loading, setLoading] = useState(true)  
  const [error, setError] = useState(null)  
 
  useEffect(() => {  
    async function fetchData() {  
      try {  
        setLoading(true)  
        setError(null)  
 
        const { data: auditData, error: auditError } = await supabase  
          .from('audits')  
          .select('*')  
          .eq('id', id)  
          .single()  
 
        if (auditError) throw auditError  
        setAudit(auditData)  
 
        if (auditData.client_id) {  
          const { data: clientData, error: clientError } = await supabase  
            .from('clients')  
            .select('*')  
            .eq('id', auditData.client_id)  
            .single()  
 
          if (clientError) console.error('Erreur client:', clientError)  
          else setClient(clientData)  
        }  
  
        const { data: photosData, error: photosError } = await supabase  
          .from('photos')  
          .select('*')  
          .eq('audit_id', id)  
 
        if (photosError) console.error('Erreur photos:', photosError)  
        else setPhotos(photosData || [])  
  
      } catch (err) {  
        console.error('Erreur:', err)  
        setError(err.message || 'Une erreur est survenue')  
      } finally {  
        setLoading(false)  
      }  
    }  
 
    if (id) fetchData()  
  }, [id])  
 
  if (loading) {  
    return (  
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">  
        <div className="text-center">  
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: ENERGIA_GREEN }}></div>  
          <p className="text-slate-600">Chargement...</p>  
        </div>  
      </div>  
    )  
  }  
 
  if (error || !audit) {  
    return (  
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">  
        <div className="text-center">  
          <p className="text-red-600 mb-4">{error || 'Audit non trouvé'}</p>  
          <button  
            onClick={() => navigate('/audits')}  
            className="text-sm font-medium hover:underline"  
            style={{ color: ENERGIA_GREEN }}  
          >  
            ← Retour à la liste  
          </button>  
        </div>  
      </div>  
    )  
  }  
  
  return (  
    <div className="min-h-screen bg-slate-50">  
      <header className="px-6 py-4 shadow-sm bg-white sticky top-0 z-10">  
        <div className="max-w-4xl mx-auto flex items-center justify-between">  
          <h1 className="text-2xl font-bold" style={{ color: ENERGIA_GREEN }}>
            Détail de l'audit
          </h1>
          <div className="flex gap-3">
            <button
              onClick={generatePDF}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📄 Télécharger PDF
            </button>
            <button
              onClick={() => navigate('/audits')}
              className="text-sm font-medium hover:underline"
              style={{ color: ENERGIA_GREEN }}
            >
              ← Retour au dashboard
            </button>
          </div>
        </div>  
      </header>  
  
      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">  
        {/* EN-TÊTE */}  
        <div className="bg-white rounded-lg shadow-sm p-6">  
          <div className="flex items-center justify-between mb-4">  
            <h2 className="text-2xl font-bold text-slate-900">  
              Audit #{audit.id?.slice(0, 8)}  
            </h2>  
            <span  
              className={`px-3 py-1 rounded-full text-sm font-medium ${  
                audit.status === 'Terminé'  
                  ? 'bg-green-100 text-green-800'  
                  : audit.status === 'En cours'  
                  ? 'bg-blue-100 text-blue-800'  
                  : 'bg-slate-100 text-slate-700'  
              }`}  
            >  
              {audit.status || 'En attente'}  
            </span>  
          </div>  
        </div>  
 
        {/* INFORMATIONS CLIENT */}  
        <div className="bg-white rounded-lg shadow-sm p-6">  
          <h2 className="text-xl font-semibold mb-4" style={{ color: ENERGIA_GREEN }}>  
            👤 Informations client  
          </h2>  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
            <div>  
              <span className="text-sm text-slate-700">Nom</span>  
              <p className="font-medium text-slate-900">  
                {val(client?.name || audit.client_name)}  
              </p>  
            </div>  
            <div>  
              <span className="text-sm text-slate-700">Téléphone</span>  
              <p className="font-medium text-slate-900">  
                {val(client?.telephone || audit.telephone)}  
              </p>  
            </div>  
            <div>  
              <span className="text-sm text-slate-700">Email</span>  
              <p className="font-medium text-slate-900">  
                {val(client?.email || audit.email)}  
              </p>  
            </div>  
            <div className="md:col-span-2">  
              <span className="text-sm text-slate-700">Adresse</span>  
              <p className="font-medium text-slate-900">  
                {val(client?.address || audit.client_address)}  
              </p>  
            </div>  
            <div>  
              <span className="text-sm text-slate-700">Code postal</span>  
              <p className="font-medium text-slate-900">  
                {val(audit.code_postal)}  
              </p>  
            </div>  
            <div>  
              <span className="text-sm text-slate-700">Nombre de personnes</span>  
              <p className="font-medium text-slate-900">  
                {val(audit.nb_personnes)}  
              </p>  
            </div>  
            <div className="md:col-span-2">  
              <span className="text-sm text-slate-700">Revenus annuels</span>  
              <p className="font-medium text-slate-900">  
                {audit.revenus ? `${audit.revenus.toLocaleString('fr-FR')} €` : '-'}  
              </p>  
            </div>  
          </div>  
        </div>  
  
        {/* INFORMATIONS LOGEMENT */}  
        <div className="bg-white rounded-lg shadow-sm p-6">  
          <h2 className="text-xl font-semibold mb-4" style={{ color: ENERGIA_GREEN }}>  
            🏠 Informations logement  
          </h2>  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
            <div>  
              <span className="text-sm text-slate-700">Surface habitable</span>  
              <p className="font-medium text-slate-900">  
                {audit.surface_habitable ? `${audit.surface_habitable} m²` : '-'}  
              </p>  
            </div>  
            <div>  
              <span className="text-sm text-slate-700">Année de construction</span>  
              <p className="font-medium text-slate-900">  
                {val(audit.annee_construction)}  
              </p>  
            </div>  
            <div>  
              <span className="text-sm text-slate-700">Type de chauffage</span>  
              <p className="font-medium text-slate-900">  
                {val(audit.type_chauffage)}  
              </p>  
            </div>  
            <div>  
              <span className="text-sm text-slate-700">DPE actuel</span>  
              <p className="font-medium text-slate-900">  
                {val(audit.dpe_actuel)}  
              </p>  
            </div>  
            <div className="md:col-span-2">  
              <span className="text-sm text-slate-700">Isolation actuelle</span>  
              <p className="font-medium text-slate-900">  
                {val(audit.isolation_actuelle)}  
              </p>  
            </div>  
          </div>  
        </div>  
 
        {/* DIAGNOSTIC ÉNERGÉTIQUE */}  
        <div className="bg-white rounded-lg shadow-sm p-6">  
          <h2 className="text-xl font-semibold mb-4" style={{ color: ENERGIA_GREEN }}>  
            🔍 Diagnostic énergétique  
          </h2>  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
            <div>  
              <span className="text-sm text-slate-700">Date de création</span>  
              <p className="font-medium text-slate-900">  
                {formatDate(audit.created_at)}  
              </p>  
            </div>  
          </div>  
        </div>  
 
        {/* AIDES FINANCIÈRES */}  
        {audit.aides_montant && (  
          <div className="bg-white rounded-lg shadow-sm p-6">  
            <h2 className="text-xl font-semibold mb-4" style={{ color: ENERGIA_GREEN }}>  
              💰 Aides financières estimées  
            </h2>  
            <div className="text-center">  
              <p className="text-4xl font-bold mb-2" style={{ color: ENERGIA_GREEN }}>  
                {audit.aides_montant.toLocaleString('fr-FR')} €  
              </p>  
              <p className="text-sm text-slate-600">  
                Estimation des aides pour une rénovation globale  
              </p>  
            </div>  
          </div>  
        )}  
 
        {/* PHOTOS DE L'AUDIT */}  
        <div className="bg-white rounded-lg shadow-sm p-6">  
          <h2 className="text-xl font-semibold mb-4" style={{ color: ENERGIA_GREEN }}>  
            📸 Photos de l'audit  
          </h2>  
          {photos.length > 0 ? (  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
              {photos.map((photo) => (  
                <div key={photo.id} className="border rounded-lg overflow-hidden">  
                  <img  
                    src={photo.url}  
                    alt={PHOTO_TYPE_LABELS[photo.type] || 'Photo'}  
                    className="w-full h-48 object-cover"  
                  />  
                  <div className="p-3 bg-slate-50">  
                    <p className="text-sm font-medium text-slate-700">  
                      {PHOTO_TYPE_LABELS[photo.type] || '📷 Photo'}  
                    </p>  
                  </div>  
                </div>  
              ))}  
            </div>  
          ) : (  
            <p className="text-slate-600 text-center py-8">  
              Aucune photo pour cet audit  
            </p>  
          )}  
        </div>  
      </main>  
    </div>  
  )  
}  