import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savingId, setSavingId] = useState(null)
  const [feedback, setFeedback] = useState(null)

  async function fetchClientes() {
    setLoading(true)
    setError(null)

    const { data, error: supabaseError } = await supabase
      .from('clientes')
      .select('id, nome, email')
      .order('id', { ascending: true })

    if (supabaseError) {
      console.error('Erro ao buscar clientes:', supabaseError)
      setError('Nao foi possivel carregar os clientes. Tente novamente.')
      setClientes([])
    } else {
      setClientes(data ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  useEffect(() => {
    if (!feedback) {
      return
    }

    const timeout = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(timeout)
  }, [feedback])

  const handleChange = (id, field, value) => {
    setClientes((current) =>
      current.map((cliente) =>
        cliente.id === id ? { ...cliente, [field]: value } : cliente,
      ),
    )
  }

  const atualizarCliente = async (cliente) => {
    setSavingId(cliente.id)
    const { error: updateError } = await supabase
      .from('clientes')
      .update({ nome: cliente.nome, email: cliente.email })
      .eq('id', cliente.id)

    if (updateError) {
      console.error('Erro ao atualizar cliente:', updateError)
      setFeedback({
        type: 'error',
        message: `Erro ao atualizar cliente: ${updateError.message}`,
      })
    } else {
      setFeedback({ type: 'success', message: 'Cliente atualizado com sucesso.' })
    }

    setSavingId(null)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f5f6f7',
        padding: '2rem',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <main
        style={{
          maxWidth: 720,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 12,
          padding: '1.5rem',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Lista de Clientes</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#475569' }}>
              Conecta ao Supabase, permite edicao inline e sincroniza as mudancas.
            </p>
          </div>
          <button
            onClick={fetchClientes}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 999,
              border: 'none',
              fontWeight: 600,
              background: loading ? '#cbd5f5' : '#2563eb',
              color: loading ? '#1e3a8a' : '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 6px 14px rgba(37, 99, 235, 0.35)',
            }}
          >
            {loading ? 'Carregando...' : 'Recarregar'}
          </button>
        </header>

        {error && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: 8,
              background: '#fee2e2',
              color: '#b91c1c',
            }}
          >
            {error}
          </div>
        )}

        {feedback && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: 8,
              background: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: feedback.type === 'success' ? '#166534' : '#b91c1c',
            }}
          >
            {feedback.message}
          </div>
        )}

        <section style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
          {loading && <p style={{ color: '#64748b' }}>Carregando clientes...</p>}

          {!loading && clientes.length === 0 && !error && (
            <p style={{ color: '#64748b' }}>Nenhum cliente encontrado.</p>
          )}

          {!loading &&
            clientes.map((cliente) => (
              <article
                key={cliente.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '1rem',
                  background: '#f8fafc',
                  display: 'grid',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <label style={{ display: 'grid', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>Nome</span>
                    <input
                      type="text"
                      value={cliente.nome ?? ''}
                      onChange={(event) =>
                        handleChange(cliente.id, 'nome', event.target.value)
                      }
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 8,
                        border: '1px solid #cbd5f5',
                        fontSize: '1rem',
                      }}
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: '#475569' }}>Email</span>
                    <input
                      type="email"
                      value={cliente.email ?? ''}
                      onChange={(event) =>
                        handleChange(cliente.id, 'email', event.target.value)
                      }
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: 8,
                        border: '1px solid #cbd5f5',
                        fontSize: '1rem',
                      }}
                    />
                  </label>
                </div>

                <footer
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    ID: {cliente.id}
                  </span>
                  <button
                    onClick={() => atualizarCliente(cliente)}
                    disabled={savingId === cliente.id}
                    style={{
                      padding: '0.45rem 1rem',
                      borderRadius: 999,
                      border: 'none',
                      fontWeight: 600,
                      background: savingId === cliente.id ? '#cbd5f5' : '#10b981',
                      color: savingId === cliente.id ? '#0f172a' : '#fff',
                      cursor: savingId === cliente.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 6px 12px rgba(16, 185, 129, 0.35)',
                    }}
                  >
                    {savingId === cliente.id ? 'Salvando...' : 'Atualizar'}
                  </button>
                </footer>
              </article>
            ))}
        </section>
      </main>
    </div>
  )
}

export default App
