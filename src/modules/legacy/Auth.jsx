import { useState } from 'react'
import { supabase } from '../../shared/lib/supabase'

export default function Auth() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [mode, setMode]         = useState('login') // login | signup

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    let result
    if (mode === 'login') {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
    }

    if (result.error) setError(result.error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg)', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'var(--navy)', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 12
          }}>⚡</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>
            Faculty Excellence Platform
          </div>
          <div style={{ color: 'var(--muted)', marginTop: 4, fontSize: 14 }}>
            Competency-driven. Evidence-informed. Built for HPE.
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--white)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)', padding: 32,
          boxShadow: 'var(--shadow)'
        }}>
          <h2 style={{ color: 'var(--navy)', marginBottom: 24, fontSize: 18, fontWeight: 700 }}>
            {mode === 'login' ? 'Sign in to your platform' : 'Create your account'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontWeight: 600,
                              color: 'var(--navy)', fontSize: 13, marginBottom: 6 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@institution.edu"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid var(--border)', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontWeight: 600,
                              color: 'var(--navy)', fontSize: 13, marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  border: '1px solid var(--border)', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                background: '#FEE2E2', color: '#DC2626', padding: '10px 14px',
                borderRadius: 8, fontSize: 13, marginBottom: 16
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', borderRadius: 8,
                background: loading ? 'var(--muted)' : 'var(--navy)',
                color: 'white', border: 'none', fontSize: 15,
                fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer'
              }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => setMode('signup')}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)',
                           fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)',
                           fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--muted)' }}>
          © 2026 Faculty Excellence Platform
        </div>
      </div>
    </div>
  )
}