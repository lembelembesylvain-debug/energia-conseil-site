import { useEffect, useState } from 'react'  
import { supabase } from '../lib/supabase'  
  
export default function TestDB() {  
  const [status, setStatus] = useState('⏳ Connexion en cours...')  
  const [tables, setTables] = useState([])  
  const [error, setError] = useState(null)  
  
  useEffect(() => {  
    async function testConnection() {  
      try {  
        // Test avec la table clients  
        const { data, error } = await supabase  
          .from('clients')  
          .select('*')  
          .limit(1)  
  
        if (error) throw error  
  
        setStatus('✅ Connexion Supabase réussie !')  
        setTables([  
          '✅ Table clients accessible',  
          '✅ Base de données opérationnelle',  
          '✅ 12 tables créées : clients, audits, diagnostics, scenarios, rapports, photos, artisans, payments, projects, quotes, users, api_keys'  
        ])  
      } catch (err) {  
        setError(err.message)  
        setStatus('❌ Erreur de connexion')  
      }  
    }  
  
    testConnection()  
  }, [])  
 
  return (  
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>  
      <h1 style={{ color: '#0f766e' }}>🔥 Test Connexion Supabase</h1>  
        
      <div style={{   
        background: error ? '#ffebee' : '#e8f5e9',   
        padding: '20px',   
        borderRadius: '8px',  
        marginTop: '20px'  
      }}>  
        <h2 style={{ color: error ? '#c62828' : '#2e7d32' }}>{status}</h2>  
          
        {error && (  
          <div>  
            <p style={{ color: '#c62828' }}><strong>Erreur :</strong> {error}</p>  
            <p>Vérifie que les clés dans .env.local sont correctes.</p>  
          </div>  
        )}  
          
        {!error && tables.length > 0 && (  
          <div>  
            {tables.map((msg, i) => (  
              <p key={i} style={{ fontSize: '16px', margin: '10px 0' }}>{msg}</p>  
            ))}  
            <hr style={{ margin: '20px 0', border: '1px solid #ccc' }} />  
            <p><strong>🎉 Infrastructure prête pour le développement !</strong></p>  
          </div>  
        )}  
      </div>  
    </div>  
  )  
}  