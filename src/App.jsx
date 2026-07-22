import { useState, useEffect } from 'react'
import { supabase } from './shared/lib/supabase'
import Auth from './shared/components/Auth'
import Shell from './shared/components/Shell'
import Onboarding from './shared/components/Onboarding'

export default function App() {
  const [session, setSession]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [institution, setInstitution]   = useState(null)
  const [currentUser, setCurrentUser]   = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadUser(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadUser(session.user.id)
      else { setCurrentUser(null); setInstitution(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadUser(authId) {
    setLoading(true)
    const { data: user } = await supabase
      .from('users')
      .select('*, institutions(*)')
      .eq('auth_id', authId)
      .single()

    if (user) {
      setCurrentUser(user)
      setInstitution(user.institutions)
    }
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  height:'100vh', fontFamily:'Arial,sans-serif', color:'var(--brand-primary)',
                  background:'var(--surface-page)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:32, marginBottom:12 }}>⚡</div>
        <div style={{ fontWeight:'bold', fontSize:18 }}>Faculty Excellence Platform</div>
        <div style={{ color:'var(--text-secondary)', marginTop:6 }}>Loading...</div>
      </div>
    </div>
  )

  if (!session) return <Auth />

  if (!institution) return (
    <Onboarding
      session={session}
      onComplete={(inst, user) => {
        setInstitution(inst)
        setCurrentUser(user)
      }}
    />
  )

  return <Shell currentUser={currentUser} institution={institution} />
}