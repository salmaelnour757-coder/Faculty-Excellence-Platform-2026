import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Card, CardHeader, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'

export default function AdminDashboard({ institution, currentUser }) {
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
      background:'var(--surface-card)', borderRadius:'var(--radius-control)', padding:'18px 20px',
      border:'1px solid var(--border)', borderLeft:`4px solid ${accent}`,
      boxShadow:'0 1px 2px rgba(var(--shadow-color),0.04), 0 6px 16px rgba(var(--shadow-color),0.06)'
    }}>
      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-secondary)',
                    textTransform:'uppercase', letterSpacing:.4, marginBottom:6 }}>
        {label}
      </div>
      <div style={{ fontSize:28, fontWeight:800, color:'var(--text-primary)', lineHeight:1 }}>
        {loading ? '—' : value}
      </div>
      <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:4 }}>{sub}</div>
    </div>
  )

  return (
    <div>
      {/* Welcome — the gloss card header, one of the two permitted gloss surfaces */}
      <Card hoverable={false} style={{ marginBottom:20 }}>
        <CardHeader
          eyebrow={institution?.name}
          title={`Welcome back, ${currentUser?.full_name?.split(' ')[0] || 'Admin'} 👋`}
          sub="Faculty Excellence Platform"
        />
      </Card>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
                    gap:14, marginBottom:20 }}>
        {card('Total Faculty',    stats.faculty,    'Registered users',    'var(--brand-primary)')}
        {card('Assessments',      stats.assessed,   'Completed this cycle', 'var(--brand-accent)')}
        {card('Active IDPs',      stats.idps,       'In progress',          'var(--brand-secondary)')}
        {card('Enrolments',       stats.enrolments, 'Across all pathways',  '#22C55E')}
      </div>

      {/* Domains */}
      <Card hoverable={false} style={{ marginBottom:20 }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)',
                      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>
            Competency Framework
          </div>
          <span style={{ fontSize:12, color:'var(--text-secondary)' }}>
            {domains.length} domains configured
          </span>
        </div>
        <CardBody>
          {loading ? (
            <div style={{ color:'var(--text-secondary)', fontSize:13 }}>Loading domains...</div>
          ) : domains.length === 0 ? (
            <div style={{ color:'var(--text-secondary)', fontSize:13 }}>No domains found.</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
              {domains.map(d => (
                <div key={d.id} style={{
                  padding:'10px 14px', borderRadius:'var(--radius-control)',
                  border:'1px solid var(--border)', background:'var(--surface-page)',
                  display:'flex', gap:10, alignItems:'center'
                }}>
                  <span style={{
                    background: 'var(--brand-accent)', color:'white',
                    borderRadius:'50%', width:26, height:26,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:11, fontWeight:700, flexShrink:0
                  }}>{d.domain_number}</span>
                  <span style={{ fontSize:12.5, color:'var(--text-primary)', fontWeight:500 }}>
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Quick actions */}
      <Card hoverable={false}>
        <CardBody>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>
            Quick Actions
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <Button style={{ padding:'10px 20px', fontSize:13 }}>+ Add Faculty</Button>
            <Button style={{ padding:'10px 20px', fontSize:13 }}>📋 Launch Assessment</Button>
            <Button variant="secondary" style={{ padding:'10px 20px', fontSize:13 }}>📊 View Analytics</Button>
            <Button variant="ghost" style={{ padding:'10px 20px', fontSize:13 }}>⚙️ Settings</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
