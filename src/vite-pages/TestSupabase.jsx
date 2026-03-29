import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function TestSupabase() {
  const [status, setStatus] = useState('⏳ Connexion en cours...')
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testConnection() {
      try {
        const { error: err } = await supabase
          .from('clients')
          .select('*')
          .limit(1)

        if (err) throw err

        setStatus('✅ Connexion réussie')
        setError(null)
      } catch (err) {
        setError(err?.message ?? String(err))
        setStatus('❌ Erreur de connexion')
      }
    }

    testConnection()
  }, [])

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#0f766e' }}>Test Supabase</h1>

      <div
        style={{
          background: error ? '#fef2f2' : '#f0fdf4',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '20px',
          border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}`,
        }}
      >
        <h2 style={{ color: error ? '#b91c1c' : '#15803d', margin: '0 0 12px 0' }}>
          {status}
        </h2>
        {error && (
          <p style={{ color: '#b91c1c', margin: 0 }}>
            <strong>Détail :</strong> {error}
          </p>
        )}
      </div>
    </div>
  )
}
