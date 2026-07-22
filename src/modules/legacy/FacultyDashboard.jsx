import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'

export default function FacultyDashboard({ institution, currentUser, branding, setScreen }) {
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
      {/* Profile banner */}
      <div style={{
        background: branding.primary, borderRadius:12,
        padding:'20px 24px', marginBottom:20,
        display:'flex', alignItems:'center', gap:16
      }}>
        <div style={{
          width:52, height:52, borderRadius:'50%', flexShrink:0,
          background: branding.gold, color: branding.primary,
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
                        padding:'8px 16px', borderRadius:8 }}>
            <div style={{ fontSize:20, fontWeight:800, color: branding.gold }}>
              {responses.length}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>Ratings</div>
          </div>
          <div style={{ textAlign:'center', background:'rgba(255,255,255,.1)',
                        padding:'8px 16px', borderRadius:8 }}>
            <div style={{ fontSize:20, fontWeight:800, color: branding.gold }}>
              {enrolments.length}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>Pathways</div>
          </div>
        </div>
      </div>

      {/* Assessment prompt */}
      {!hasAssessed && (
        <div style={{
          background:'white', borderRadius:12, padding:'20px 24px',
          border:`2px solid ${branding.gold}`, marginBottom:20,
          display:'flex', alignItems:'center', gap:16
        }}>
          <div style={{ fontSize:40 }}>📋</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#0D2B5E', marginBottom:4 }}>
              Complete your needs assessment
            </div>
            <div style={{ fontSize:13, color:'#64748B' }}>
              Rate your competency across all 9 domains to generate your personalised development plan. Takes about 20 minutes.
            </div>
          </div>
          <button onClick={() => setScreen('assessment')} style={{
            padding:'10px 24px', borderRadius:8, border:'none',
            background: branding.gold, color: branding.primary,
            fontWeight:700, fontSize:14, cursor:'pointer', whiteSpace:'nowrap'
          }}>
            Start Assessment →
          </button>
        </div>
      )}

      {/* Domain snapshot */}
      <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                    marginBottom:20, boxShadow:'0 2px 12px rgba(13,43,94,.06)' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #DDE3EF',
                      display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#0D2B5E' }}>
            My Competency Snapshot
          </div>
          <button onClick={() => setScreen('assessment')} style={{
            padding:'6px 14px', borderRadius:8, border:'1.5px solid #DDE3EF',
            background:'white', color:'#0D2B5E', fontWeight:600,
            fontSize:12, cursor:'pointer'
          }}>
            {hasAssessed ? 'Update Assessment' : 'Start Assessment'}
          </button>
        </div>
        <div style={{ padding:'16px 20px' }}>
          {loading ? (
            <div style={{ color:'#64748B', fontSize:13 }}>Loading...</div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10 }}>
              {domains.map(d => {
                const tni = getDomainTNI(d.id)
                const { band, color, bg } = getTNIBand(tni)
                return (
                  <div key={d.id} onClick={() => setScreen('assessment')}
                    style={{
                      padding:'12px 14px', borderRadius:8, cursor:'pointer',
                      border:`1.5px solid ${color}`, background:'white',
                      borderLeft:`4px solid ${color}`, transition:'all .15s'
                    }}>
                    <div style={{ fontSize:11, color:'#64748B', fontWeight:700, marginBottom:3 }}>
                      D{d.domain_number}
                    </div>
                    <div style={{ fontSize:12.5, fontWeight:700, color:'#0D2B5E',
                                  marginBottom:6, lineHeight:1.3 }}>
                      {d.name}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div style={{ fontSize:18, fontWeight:800, color }}>
                        {tni !== null ? tni : '—'}
                      </div>
                      <span style={{
                        fontSize:11, fontWeight:700, padding:'2px 8px',
                        borderRadius:10, background: bg, color
                      }}>
                        {band}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Active pathways */}
      {enrolments.length > 0 && (
        <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                      boxShadow:'0 2px 12px rgba(13,43,94,.06)' }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #DDE3EF' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#0D2B5E' }}>
              My Active Pathways
            </div>
          </div>
          <div style={{ padding:'16px 20px' }}>
            {enrolments.map(e => (
              <div key={e.id} style={{
                display:'flex', alignItems:'center', gap:14,
                padding:'12px 0', borderBottom:'1px solid #F1F5F9'
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#0D2B5E', fontSize:14 }}>
                    {e.pathways?.name}
                  </div>
                  <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>
                    {e.pathways?.cpd_credits} CPD credits
                  </div>
                  <div style={{ marginTop:8, height:6, background:'#DDE3EF',
                                borderRadius:4, overflow:'hidden', maxWidth:200 }}>
                    <div style={{
                      height:'100%', borderRadius:4,
                      background: branding.accent,
                      width: `${e.progress_percent || 0}%`
                    }} />
                  </div>
                </div>
                <span style={{
                  fontSize:12, fontWeight:700, padding:'3px 10px',
                  borderRadius:10,
                  background: e.status === 'completed' ? '#DCFCE7' : '#CCFBF1',
                  color: e.status === 'completed' ? '#15803D' : '#0F766E'
                }}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}