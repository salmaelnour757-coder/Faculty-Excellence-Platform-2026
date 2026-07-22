// modules/connect/Connect.jsx
// New module — merges what were previously two separately-conceived ideas
// (Mentoring, Experts Capital) into one. Tier is computed live from Assess's
// own competence ratings — never a separately maintained "expert list" that
// could drift out of sync with actual assessment data.
//
// Tier rule: a faculty member is Expert-tier if their average competence
// rating (the 1-5 "B. Competence" scale from Assess, where 4=Proficient,
// 5=Expert) across all their rated items is >= 4.0. Their listed area(s)
// of expertise are the domain(s) where their average competence is highest.

import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Card, CardHeader, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'

const EXPERT_THRESHOLD = 4.0

export default function Connect({ institution, currentUser }) {
  const [domains, setDomains] = useState([])
  const [items, setItems] = useState([])
  const [faculty, setFaculty] = useState([])
  const [responses, setResponses] = useState([])
  const [requestsSent, setRequestsSent] = useState([])
  const [requestsReceived, setRequestsReceived] = useState([])
  const [loading, setLoading] = useState(true)
  const [openRequestFor, setOpenRequestFor] = useState(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { if (institution?.id) loadData() }, [institution?.id])

  async function loadData() {
    setLoading(true)
    const [d, it, fac, resp, sent, received] = await Promise.all([
      supabase.from('domains').select('*').eq('institution_id', institution.id),
      supabase.from('items').select('*').eq('institution_id', institution.id),
      supabase.from('users').select('id, full_name, email, rank').eq('institution_id', institution.id),
      supabase.from('responses').select('user_id, item_id, competence').eq('institution_id', institution.id),
      supabase.from('mentoring_requests').select('*, users!mentoring_requests_expert_id_fkey(full_name)').eq('requester_id', currentUser.id),
      supabase.from('mentoring_requests').select('*, users!mentoring_requests_requester_id_fkey(full_name)').eq('expert_id', currentUser.id),
    ])
    setDomains(d.data || [])
    setItems(it.data || [])
    setFaculty(fac.data || [])
    setResponses(resp.data || [])
    setRequestsSent(sent.data || [])
    setRequestsReceived(received.data || [])
    setLoading(false)
  }

  const itemToDomain = {}
  items.forEach(i => { itemToDomain[i.id] = i.domain_id })

  // Build each faculty member's expert profile: overall avg competence +
  // per-domain avg competence, to find their strongest area(s).
  function profileFor(userId) {
    const own = responses.filter(r => r.user_id === userId)
    if (own.length === 0) return null

    const overall = own.reduce((s, r) => s + (r.competence || 0), 0) / own.length

    const byDomain = {}
    own.forEach(r => {
      const domainId = itemToDomain[r.item_id]
      if (!domainId) return
      if (!byDomain[domainId]) byDomain[domainId] = { sum: 0, count: 0 }
      byDomain[domainId].sum += r.competence || 0
      byDomain[domainId].count += 1
    })

    const domainAverages = Object.entries(byDomain)
      .map(([domainId, v]) => ({ domainId, avg: v.sum / v.count }))
      .sort((a, b) => b.avg - a.avg)

    return { overall, topDomains: domainAverages.slice(0, 2) }
  }

  const experts = faculty
    .filter(f => f.id !== currentUser.id)
    .map(f => ({ ...f, profile: profileFor(f.id) }))
    .filter(f => f.profile && f.profile.overall >= EXPERT_THRESHOLD)
    .sort((a, b) => b.profile.overall - a.profile.overall)

  function domainName(domainId) {
    return domains.find(d => d.id === domainId)?.name || ''
  }

  async function sendRequest(expertId) {
    setSending(true)
    const { error } = await supabase.from('mentoring_requests').insert({
      requester_id: currentUser.id,
      expert_id: expertId,
      institution_id: institution.id,
      message,
    })
    setSending(false)
    if (!error) {
      setToast('Mentoring request sent.')
      setTimeout(() => setToast(''), 3000)
      setOpenRequestFor(null)
      setMessage('')
      loadData()
    } else {
      console.error(error)
    }
  }

  async function respondToRequest(requestId, status) {
    await supabase.from('mentoring_requests').update({ status }).eq('id', requestId)
    loadData()
  }

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading the expert directory...</div>

  return (
    <div>
      {toast && (
        <div style={{ background: 'color-mix(in srgb, #16A34A 12%, transparent)', color: '#15803D',
                      padding: '10px 16px', borderRadius: 'var(--radius-control)', fontSize: 13,
                      fontWeight: 600, marginBottom: 16 }}>
          {toast}
        </div>
      )}

      {requestsReceived.length > 0 && (
        <Card hoverable={false} style={{ marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Mentoring requests for you</div>
          </div>
          <CardBody>
            {requestsReceived.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {r.users?.full_name} <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>· {r.status}</span>
                  </div>
                  {r.message && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{r.message}</div>}
                </div>
                {r.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Button variant="secondary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => respondToRequest(r.id, 'accepted')}>Accept</Button>
                    <Button variant="ghost" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => respondToRequest(r.id, 'declined')}>Decline</Button>
                  </div>
                )}
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Expert directory</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Faculty rated Proficient or higher on their own assessment, browsable for mentoring.
        </div>
      </div>

      {experts.length === 0 ? (
        <Card hoverable={false}>
          <CardBody style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, padding: '32px 20px' }}>
            No Expert-tier faculty yet — this fills in automatically as assessment scores come in.
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {experts.map(f => {
            const alreadySent = requestsSent.some(r => r.expert_id === f.id)
            return (
              <Card key={f.id}>
                <CardHeader
                  eyebrow={f.rank || 'Faculty'}
                  title={f.full_name}
                  sub={f.profile.topDomains.map(t => domainName(t.domainId)).filter(Boolean).join(', ')}
                />
                <CardBody>
                  {openRequestFor === f.id ? (
                    <div>
                      <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="What would you like mentoring on?"
                        rows={3}
                        style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-control)',
                                 border: '1px solid var(--border)', background: 'var(--surface-card)',
                                 color: 'var(--text-primary)', boxSizing: 'border-box', resize: 'vertical', marginBottom: 8 }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button disabled={sending} onClick={() => sendRequest(f.id)} style={{ flex: 1, fontSize: 13 }}>
                          {sending ? 'Sending...' : 'Send request'}
                        </Button>
                        <Button variant="secondary" onClick={() => { setOpenRequestFor(null); setMessage('') }} style={{ fontSize: 13 }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant={alreadySent ? 'ghost' : 'secondary'}
                      disabled={alreadySent}
                      onClick={() => setOpenRequestFor(f.id)}
                      style={{ width: '100%' }}
                    >
                      {alreadySent ? 'Request sent' : 'Request mentoring'}
                    </Button>
                  )}
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
