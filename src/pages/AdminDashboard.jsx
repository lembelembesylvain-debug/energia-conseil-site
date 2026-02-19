import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ENERGIA_GREEN = '#0f766e'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadAudits()
  }, [])

  async function loadAudits() {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('audits')
      .select('*, clients(nom, prenom)')
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
      setAudits([])
    } else {
      setAudits(data ?? [])
    }
    setLoading(false)
  }

  function getDisplayValue(row, field) {
    const keys = [field, field.replace(/_/g, '')]
    for (const k of keys) {
      if (row[k] != null) return row[k]
    }
    const camel = field.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    if (row[camel] != null) return row[camel]
    return '—'
  }

  function formatDate(value) {
    if (!value) return '—'
    const d = new Date(value)
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  function getStatusBadgeClass(status) {
    const s = (status ?? '').toLowerCase()
    if (s.includes('attente')) return 'bg-amber-100 text-amber-800'
    if (s.includes('cours')) return 'bg-blue-100 text-blue-800'
    if (s.includes('terminé') || s.includes('termine')) return 'bg-emerald-100 text-emerald-800'
    return 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className="px-6 py-4 shadow-sm"
        style={{ backgroundColor: ENERGIA_GREEN }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">
            Tableau de bord administration
          </h1>
          <button
            type="button"
            onClick={() => navigate('/nouvel-audit')}
            className="px-4 py-2 rounded-lg font-medium text-white bg-white/20 hover:bg-white/30 transition-colors"
          >
            Nouvel audit
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Liste des audits
            </h2>
          </div>

          {error && (
            <div className="mx-6 mt-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="px-6 py-12 text-center text-slate-500">
              Chargement des audits…
            </div>
          ) : audits.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">
              Aucun audit pour le moment.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Type logement
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((row) => (
                    <tr
                      key={row.id ?? row.created_at ?? Math.random()}
                      role="button"
                      tabIndex={0}
                      onClick={() => row.id != null && navigate(`/audit/${row.id}`)}
                      onKeyDown={(e) => e.key === 'Enter' && row.id != null && navigate(`/audit/${row.id}`)}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 text-sm text-slate-800">
                        {(() => {
                          const c = row.clients ?? row.client
                          return c
                            ? `${c.nom ?? ''} ${c.prenom ?? ''}`.trim() || '—'
                            : getDisplayValue(row, 'client')
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">
                        {getDisplayValue(row, 'type_logement')}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(row.status ?? row.statut)}`}
                        >
                          {row.status ?? getDisplayValue(row, 'statut')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(
                          row.created_at ?? row.date ?? getDisplayValue(row, 'date')
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
