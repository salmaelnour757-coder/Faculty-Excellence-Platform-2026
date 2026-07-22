import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, CardBody } from './Card'
import { Button } from './Button'

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

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-control)',
    border: '1px solid var(--border)', fontSize: 14, outline: 'none',
    boxSizing: 'border-box', background: 'var(--surface-card)', color: 'var(--text-primary)',
  }
  const labelStyle = { display: 'block', fontWeight: 600, color: 'var(--text-primary)', fontSize: 13, marginBottom: 6 }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--surface-page)', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--gloss-start) 0%, var(--gloss-mid) 55%, var(--gloss-end) 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, marginBottom: 12, boxShadow: '0 8px 20px var(--accent-shadow)',
          }}>⚡</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            Faculty Excellence Platform
          </div>
          <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            Competency-driven. Evidence-informed. Built for HPE.
          </div>
        </div>

        {/* Card */}
        <Card hoverable={false}>
          <CardBody style={{ padding: 32 }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: 24, fontSize: 18, fontWeight: 700 }}>
              {mode === 'login' ? 'Sign in to your platform' : 'Create your account'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@institution.edu"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={inputStyle}
                />
              </div>

              {error && (
                <div style={{
                  background: 'color-mix(in srgb, #DC2626 10%, transparent)', color: '#DC2626',
                  padding: '10px 14px', borderRadius: 'var(--radius-control)', fontSize: 13, marginBottom: 16
                }}>
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: 15 }}>
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => setMode('signup')}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-accent)',
                             fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                    Sign up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => setMode('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--brand-accent)',
                             fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </CardBody>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
          © 2026 Faculty Excellence Platform
        </div>
      </div>
    </div>
  )
}
