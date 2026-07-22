import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'

export default function AdminDashboard({ institution, currentUser, branding }) {
  const [stats, setStats]   = useState({ faculty:0, assessed:0, idps:0, enrolments:0 })
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (institution?.id) loadData()
  }, [institution])

  async function loadData() {
    setLoading(true)

    // Faculty count
    const { count: facultyCount } = await supabase
      .from('users')
      .select('*', { count:'exact', head:true })
      .eq('institution_id', institution.id)

    // Enrolments count
    const { count: enrolCount } = await supabase
      .from('enrolments')
      .select('*', { count:'exact', head:true })
      .eq('institution_id', institution.id)

    // Domains
    const { data: domainsData } = await supabase
      .from('domains')
      .select('*')
      .eq('institution_id', institution.id)
      .order('domain_number')

    setStats({
      faculty:     facultyCount || 0,
      assessed:    0,
      idps:        0,
      enrolments:  enrolCount  || 0,
    })

    setDomains(domainsData || [])
    setLoading(false)
  }

  const card = (label, value, sub, accent) => (
    <div style={{
      background:'white', borderRadius:10, padding:'18px 20px',
      border:'1px solid #DDE3EF', borderLeft:`4px solid ${accent}`,
      boxShadow:'0 2px 12px rgba(13,43,94,.06)'
    }}>
      <div style={{ fontSize:11, fontWeight:700, color:'#64748B',
                    textTransform:'uppercase', letterSpacing:.4, marginBottom:6 }}>
        {label}
      </div>
      <div style={{ fontSize:28, fontWeight:800, color:'#0D2B5E', lineHeight:1 }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize:12, color:'#64748B', marginTop:4 }}>{sub}</div>
    </div>
  )

  return (
    <div>
      {/* Welcome */}
      <div style={{
        background: branding.primary, borderRadius:12, padding:'20px 24px',
        marginBottom:20, color:'white'
      }}>
        <div style={{ fontSize:18, fontWeight:800, color:branding.gold }}>
          Welcome back, {currentUser?.full_name?.split(' ')[0] || 'Admin'} 👋
        </div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.7)', marginTop:4 }}>
          {institution?.name} · Faculty Excellence Platform
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
                    gap:14, marginBottom:20 }}>
        {card('Total Faculty',    stats.faculty,    'Registered users',         '#0D2B5E')}
        {card('Assessments',      stats.assessed,   'Completed this cycle',      '#1A7B8C')}
        {card('Active IDPs',      stats.idps,       'In progress',               '#C9982A')}
        {card('Enrolments',       stats.enrolments, 'Across all pathways',        '#22C55E')}
      </div>

      {/* Domains */}
      <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                    boxShadow:'0 2px 12px rgba(13,43,94,.06)', marginBottom:20 }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #DDE3EF',
                      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#0D2B5E' }}>
            Competency Framework
          </div>
          <span style={{ fontSize:12, color:'#64748B' }}>
            {domains.length} domains configured
          </span>
        </div>
        <div style={{ padding:'16px 20px' }}>
          {loading ? (
            <div style={{ color:'#64748B', fontSize:13 }}>Loading domains...</div>
          ) : domains.length === 0 ? (
            <div style={{ color:'#64748B', fontSize:13 }}>No domains found.</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
              {domains.map(d => (
                <div key={d.id} style={{
                  padding:'10px 14px', borderRadius:8,
                  border:'1px solid #DDE3EF', background:'#F2F5FA',
                  display:'flex', gap:10, alignItems:'center'
                }}>
                  <span style={{
                    background: branding.accent, color:'white',
                    borderRadius:'50%', width:26, height:26,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700, flexShrink:0
                  }}>{d.domain_number}</span>
                  <span style={{ fontSize:12.5, color:'#0D2B5E', fontWeight:500 }}>
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                    padding:'16px 20px', boxShadow:'0 2px 12px rgba(13,43,94,.06)' }}>
        <div style={{ fontSize:15, fontWeight:700, color:'#0D2B5E', marginBottom:16 }}>
          Quick Actions
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {[
            { label:'+ Add Faculty',       color:'#0D2B5E' },
            { label:'📋 Launch Assessment', color:'#1A7B8C' },
            { label:'📊 View Analytics',    color:'#C9982A', textColor:'#0D2B5E' },
            { label:'⚙️ Settings',          color:'#F2F5FA', textColor:'#0D2B5E', border:true },
          ].map(a => (
            <button key={a.label} style={{
              padding:'10px 20px', borderRadius:8, fontWeight:700,
              fontSize:13, cursor:'pointer',
              background: a.color,
              color: a.textColor || 'white',
              border: a.border ? '1.5px solid #DDE3EF' : 'none'
            }}>{a.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}