import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Card, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'

export default function FacultyDashboard({ institution, currentUser, setScreen }) {
  const [domains, setDomains]       = useState([])
  const [responses, setResponses]   = useState([])
  const [enrolments, setEnrolments] = useState([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    if (institution?.id && currentUser?.id) loadData()
  }, [institution, currentUser])

  async function loadData() {
    setLoading(true)

    const { data: domainsData } = await supabase
      .from('domains')
      .select('*')
      .eq('institution_id', institution.id)
      .order('domain_number')

    const { data: responsesData } = await supabase
      .from('responses')
      .select('*, items(domain_id)')
      .eq('user_id', currentUser.id)

    const { data: enrolData } = await supabase
      .from('enrolments')
      .select('*, pathways(*)')
      .eq('user_id', currentUser.id)

    setDomains(domainsData || [])
    setResponses(responsesData || [])
    setEnrolments(enrolData || [])
    setLoading(false)
  }

  // Calculate domain TNI from responses
  function getDomainTNI(domainId) {
    const domainResponses = responses.filter(r => r.items?.domain_id === domainId)
    if (domainResponses.length === 0) return null
    const avgTNI = domainResponses.reduce((s, r) => s + (r.tni || 0), 0) / domainResponses.length
    return Math.round(avgTNI * 10) / 10
  }

  // TNI severity bands are a fixed semantic scale (not assessed/low/moderate/
  // high/critical), independent of institution branding — colors stay literal,
  // same precedent as Insight's gap-severity scale elsewhere in the platform.
  function getTNIBand(tni) {
    if (tni === null) return { band:'not assessed', color:'#94A3B8', bg:'#F1F5F9' }
    if (tni >= 13) return { band:'critical', color:'#DC2626', bg:'#FEE2E2' }
    if (tni >= 9)  return { band:'high',     color:'#EA580C', bg:'#FFEDD5' }
    if (tni >= 5)  return { band:'moderate', color:'#CA8A04', bg:'#FEF9C3' }
    return               { band:'low',      color:'#16A34A', bg:'#DCFCE7' }
  }

  const initials = currentUser?.full_name
    ? currentUser.full_name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'ME'

  const hasAssessed = responses.length > 0

  return (
    <div>
      {/* Profile banner — flat brand-primary fill, not gloss (gradient stays
          reserved for Card headers and primary buttons only) */}
      <Card hoverable={false} style={{ marginBottom:20 }}>
        <div style={{
          background: 'var(--brand-primary)', borderRadius: 'var(--radius-card)',
          padding:'20px 24px', display:'flex', alignItems:'center', gap:16
        }}>
          <div style={{
            width:52, height:52, borderRadius:'50%', flexShrink:0,
            background: 'var(--brand-secondary)', color: 'var(--brand-primary)',
            fontWeight:800, fontSize:18,
            display:'flex', alignItems:'center', justifyContent:'center'
          }}>{initials}</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:18, fontWeight:800, color:'white' }}>
              {currentUser?.full_name || 'Faculty Member'}
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,.65)', marginTop:3 }}>
              {currentUser?.rank} · {currentUser?.department} · Track {currentUser?.career_track}
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ textAlign:'center', background:'rgba(255,255,255,.1)',
                          padding:'8px 16px', borderRadius:'var(--radius-control)' }}>
              <div style={{ fontSize:20, fontWeight:800, color: 'var(--brand-secondary)' }}>
                {responses.length}
              </div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>Ratings</div>
            </div>
            <div style={{ textAlign:'center', background:'rgba(255,255,255,.1)',
                          padding:'8px 16px', borderRadius:'var(--radius-control)' }}>
              <div style={{ fontSize:20, fontWeight:800, color: 'var(--brand-secondary)' }}>
                {enrolments.length}
              </div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>Pathways</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Assessment prompt */}
      {!hasAssessed && (
        <Card hoverable={false} style={{ marginBottom:20, border:'2px solid var(--brand-secondary)' }}>
          <CardBody style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ fontSize:40 }}>📋</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:4 }}>
                Complete your needs assessment
              </div>
              <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
                Rate your competency across all 9 domains to generate your personalised development plan. Takes about 20 minutes.
              </div>
            </div>
            <Button onClick={() => setScreen('assess')} style={{ whiteSpace:'nowrap' }}>
              Start Assessment →
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Domain snapshot */}
      <Card hoverable={false} style={{ marginBottom:20 }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)',
                      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>
            My Competency Snapshot
          </div>
          <Button variant="ghost" onClick={() => setScreen('assess')} style={{ padding:'6px 14px', fontSize:12 }}>
            {hasAssessed ? 'Update Assessment' : 'Start Assessment'}
          </Button>
        </div>
        <CardBody>
          {loading ? (
            <div style={{ color:'var(--text-secondary)', fontSize:13 }}>Loading...</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
              {domains.map(d => {
                const tni = getDomainTNI(d.id)
                const { band, color, bg } = getTNIBand(tni)
                return (
                  <div key={d.id} onClick={() => setScreen('assess')}
                    style={{
                      padding:'12px 14px', borderRadius:'var(--radius-control)', cursor:'pointer',
                      border:`1.5px solid ${color}`, background:'var(--surface-card)',
                      borderLeft:`4px solid ${color}`,
                      transition:'transform var(--dur-micro) var(--ease), box-shadow var(--dur-panel) var(--ease)'
                    }}>
                    <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:700, marginBottom:3 }}>
                      D{d.domain_number}
                    </div>
                    <div style={{ fontSize:12.5, fontWeight:700, color:'var(--text-primary)',
                                  marginBottom:6, lineHeight:1.3 }}>
                      {d.name}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ fontSize:18, fontWeight:800, color }}>
                        {tni !== null ? tni : '—'}
                      </div>
                      <span style={{
                        fontSize:11, fontWeight:700, padding:'2px 8px',
                        borderRadius:'var(--radius-pill)', background: bg, color
                      }}>
                        {band}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Active pathways */}
      {enrolments.length > 0 && (
        <Card hoverable={false}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>
              My Active Pathways
            </div>
          </div>
          <CardBody>
            {enrolments.map(e => (
              <div key={e.id} style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'12px 0', borderBottom:'1px solid var(--border)'
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:14 }}>
                    {e.pathways?.name}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>
                    {e.pathways?.cpd_credits} CPD credits
                  </div>
                  <div style={{ marginTop:8, height:6, background:'var(--border)',
                                borderRadius:4, overflow:'hidden', maxWidth:200 }}>
                    <div style={{
                      height:'100%', borderRadius:4,
                      background: 'var(--brand-accent)',
                      width: `${e.progress_percent || 0}%`,
                      transition:'width var(--dur-page) var(--ease)'
                    }} />
                  </div>
                </div>
                <span style={{
                  fontSize:12, fontWeight:700, padding:'3px 10px',
                  borderRadius:'var(--radius-pill)',
                  background: e.status === 'completed' ? '#DCFCE7' : '#CCFBF1',
                  color: e.status === 'completed' ? '#15803D' : '#0F766E'
                }}>
                  {e.status}
                </span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
