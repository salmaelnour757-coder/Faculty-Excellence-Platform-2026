// modules/assess/Assess.jsx
// Ported from the old repo's Assessment.jsx (master branch). Business logic
// — data loading, save-per-domain, TNI gap/priority calculation, cycle
// handling — is unchanged. Only the styling layer changed: hardcoded hex
// values are replaced with theme tokens, and the header/wrapper use the
// shared Card system instead of one-off inline styles.
//
// See docs/02-module-specs/assess.md for the module's scope.

import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Card, CardHeader, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { Pill } from '../../shared/components/Pill'

export default function Assess({ institution, currentUser, setScreen }) {
  const [domains, setDomains]             = useState([])
  const [items, setItems]                 = useState([])
  const [ratings, setRatings]             = useState({})
  const [currentDomain, setCurrentDomain] = useState(0)
  const [loading, setLoading]             = useState(true)
  const [saving, setSaving]               = useState(false)
  const [saved, setSaved]                 = useState(false)
  const [cycleId, setCycleId]             = useState(null)
  const [error, setError]                 = useState('')

  useEffect(() => {
    if (institution?.id && currentUser?.id) loadData()
  }, [institution?.id, currentUser?.id])

  async function loadData() {
    setLoading(true)
    setError('')

    try {
      const { data: domainsData, error: dErr } = await supabase
        .from('domains')
        .select('*')
        .eq('institution_id', institution.id)
        .order('domain_number')
      if (dErr) throw dErr

      const { data: itemsData, error: iErr } = await supabase
        .from('items')
        .select('*')
        .eq('institution_id', institution.id)
        .order('item_number')
      if (iErr) throw iErr

      // Get most recent active cycle — never create duplicates
      const { data: cycles } = await supabase
        .from('assessment_cycles')
        .select('*')
        .eq('institution_id', institution.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)

      let cycle = cycles?.[0] || null

      if (!cycle) {
        const { data: newCycle, error: cErr } = await supabase
          .from('assessment_cycles')
          .insert({
            institution_id: institution.id,
            name: `Assessment Cycle ${new Date().getFullYear()}`,
            start_date: new Date().toISOString().split('T')[0],
            status: 'active'
          })
          .select()
          .single()
        if (cErr) throw cErr
        cycle = newCycle
      }

      setCycleId(cycle.id)

      const { data: existingResponses, error: rErr } = await supabase
        .from('responses')
        .select('item_id, importance, competence, priority')
        .eq('user_id', currentUser.id)
        .eq('cycle_id', cycle.id)
      if (rErr) throw rErr

      const ratingsMap = {}
      existingResponses?.forEach(r => {
        ratingsMap[`${r.item_id}_importance`] = r.importance
        ratingsMap[`${r.item_id}_competence`] = r.competence
        ratingsMap[`${r.item_id}_priority`]   = r.priority
      })

      setDomains(domainsData || [])
      setItems(itemsData || [])
      setRatings(ratingsMap)

    } catch (err) {
      setError(err.message || 'Failed to load assessment.')
    }

    setLoading(false)
  }

  function setRating(itemId, scale, value) {
    setRatings(prev => ({ ...prev, [`${itemId}_${scale}`]: value }))
  }

  function getDomainItems(domainId) {
    return items.filter(i => i.domain_id === domainId)
  }

  function isDomainComplete(domainId) {
    return getDomainItems(domainId).every(item =>
      ratings[`${item.id}_importance`] &&
      ratings[`${item.id}_competence`] &&
      ratings[`${item.id}_priority`]
    )
  }

  function getTotalRated() {
    return items.filter(item =>
      ratings[`${item.id}_importance`] &&
      ratings[`${item.id}_competence`] &&
      ratings[`${item.id}_priority`]
    ).length
  }

  async function saveDomain(domainIndex) {
    if (!cycleId) return
    setSaving(true)
    setError('')

    const domain = domains[domainIndex ?? currentDomain]
    if (!domain) { setSaving(false); return }

    const domainItems = getDomainItems(domain.id)

    for (const item of domainItems) {
      const importance = ratings[`${item.id}_importance`]
      const competence = ratings[`${item.id}_competence`]
      const priority   = ratings[`${item.id}_priority`]
      if (!importance || !competence || !priority) continue

      try {
        const { data: existing } = await supabase
          .from('responses')
          .select('id')
          .eq('user_id', currentUser.id)
          .eq('item_id', item.id)
          .eq('cycle_id', cycleId)
          .maybeSingle()

        if (existing?.id) {
          await supabase
            .from('responses')
            .update({ importance, competence, priority })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('responses')
            .insert({
              user_id:        currentUser.id,
              item_id:        item.id,
              cycle_id:       cycleId,
              institution_id: institution.id,
              importance,
              competence,
              priority
            })
        }
      } catch (err) {
        console.error('Save error:', err)
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleNext() {
    await saveDomain(currentDomain)
    setCurrentDomain(d => Math.min(domains.length - 1, d + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handlePrev() {
    await saveDomain(currentDomain)
    setCurrentDomain(d => Math.max(0, d - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleJump(index) {
    await saveDomain(currentDomain)
    setCurrentDomain(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSubmit() {
    await saveDomain(currentDomain)
    setScreen('develop') // was 'idp' — Develop absorbs IDP generation
  }

  const SCALE_LABELS = {
    importance: { 1:'Not Important', 2:'Slightly Important', 3:'Moderately Important', 4:'Important', 5:'Very Important' },
    competence: { 1:'Novice', 2:'Basic', 3:'Competent', 4:'Proficient', 5:'Expert' },
    priority:   { 1:'No Need', 2:'Low Priority', 3:'Moderate', 4:'High Priority', 5:'Immediate' },
  }

  // Scale colors now derive from theme tokens instead of hardcoded hex —
  // importance/priority ride the brand primary/secondary, competence
  // rides the brand accent, matching the rest of the platform.
  const SCALE_TOKENS = {
    importance: 'var(--brand-primary)',
    competence: 'var(--brand-accent)',
    priority:   'var(--brand-secondary)',
  }

  const SCALE_NAMES = {
    importance: 'A. Importance',
    competence: 'B. Competence',
    priority:   'C. Priority',
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  height:'60vh', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:17, fontWeight:700, color:'var(--text-primary)' }}>
        Loading your assessment...
      </div>
      <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
        Fetching your domains and saved responses
      </div>
    </div>
  )

  if (error) return (
    <div style={{ maxWidth:600, margin:'40px auto', padding:24,
                  background:'color-mix(in srgb, red 10%, var(--surface-card))',
                  borderRadius:'var(--radius-card)', color:'#DC2626' }}>
      <div style={{ fontWeight:700, marginBottom:8 }}>Error loading assessment</div>
      <div style={{ fontSize:13 }}>{error}</div>
      <Button variant="secondary" onClick={loadData} style={{ marginTop:16 }}>Retry</Button>
    </div>
  )

  if (domains.length === 0) return (
    <div style={{ textAlign:'center', padding:40, color:'var(--text-secondary)' }}>
      No domains found. Please check your framework configuration in Settings.
    </div>
  )

  const domain      = domains[currentDomain]
  const domainItems = getDomainItems(domain.id)
  const totalItems  = items.length
  const totalRated  = getTotalRated()
  const progress    = totalItems > 0
    ? Math.round((totalRated / totalItems) * 100) : 0
  const isLast      = currentDomain === domains.length - 1
  const isFirst     = currentDomain === 0

  return (
    <div style={{ maxWidth:820, margin:'0 auto' }}>

      {/* Decoupling notice */}
      <div style={{
        background:'var(--pill-bg)', border:'1px solid var(--border)',
        borderRadius:'var(--radius-control)', padding:'12px 16px', marginBottom:16,
        fontSize:13, color:'var(--text-primary)'
      }}>
        Your responses are <strong>not linked to performance appraisal</strong>.
        Rate honestly — this generates your personal development plan.
      </div>

      {/* Progress card */}
      <Card hoverable={false} style={{ padding:'16px 20px', marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', marginBottom:10 }}>
          <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:14 }}>
            Overall progress
          </div>
          <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
            {totalRated} / {totalItems} items · {progress}%
          </div>
        </div>

        <div style={{ background:'var(--border)', borderRadius:4,
                      height:8, overflow:'hidden', marginBottom:14 }}>
          <div style={{
            height:'100%', borderRadius:4,
            background:'linear-gradient(90deg, var(--brand-accent), color-mix(in srgb, var(--brand-accent) 100%, white 25%))',
            width:`${progress}%`, transition:'width var(--dur-page) var(--ease)'
          }} />
        </div>

        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {domains.map((d, i) => (
            <Pill key={d.id} active={currentDomain === i} onClick={() => handleJump(i)}>
              D{d.domain_number}{isDomainComplete(d.id) ? ' ✓' : ''}
            </Pill>
          ))}
        </div>
      </Card>

      {/* Domain card */}
      <Card style={{ marginBottom:16 }}>
        <CardHeader
          eyebrow={domain.core_focus}
          title={domain.name}
          right={<span style={{ fontSize:13, opacity:.8 }}>Domain {currentDomain + 1} of {domains.length}</span>}
        />
        <CardBody style={{ padding:0 }}>
          {domainItems.length === 0 ? (
            <div style={{ padding:24, color:'var(--text-secondary)', fontSize:13, textAlign:'center' }}>
              No items found for this domain.
            </div>
          ) : domainItems.map((item, idx) => {
            const imp = ratings[`${item.id}_importance`] || 0
            const com = ratings[`${item.id}_competence`] || 0
            const pri = ratings[`${item.id}_priority`]   || 0
            const gap = imp - com
            const tni = gap * pri
            const allRated = imp && com && pri

            let band = null
            if (allRated) {
              band = tni >= 13 ? { label:'Critical', color:'#DC2626' }
                   : tni >= 9  ? { label:'High',     color:'#EA580C' }
                   : tni >= 5  ? { label:'Moderate', color:'#CA8A04' }
                   :             { label:'Low',      color:'#16A34A' }
            }

            return (
              <div key={item.id} style={{
                padding:'20px 22px',
                borderBottom: idx < domainItems.length - 1 ? '1px solid var(--border)' : 'none',
                background: allRated ? 'color-mix(in srgb, var(--brand-accent) 4%, var(--surface-card))' : 'var(--surface-card)',
                transition:'background var(--dur-panel) var(--ease)'
              }}>
                <div style={{
                  fontSize:14, fontWeight:600, color:'var(--text-primary)',
                  marginBottom:16, lineHeight:1.6, display:'flex', gap:10
                }}>
                  <span style={{
                    background:'var(--pill-bg)', color:'var(--pill-text)', borderRadius:6,
                    padding:'2px 9px', fontWeight:800, fontSize:12,
                    flexShrink:0, alignSelf:'flex-start', marginTop:2
                  }}>
                    {idx + 1}
                  </span>
                  {item.item_text}
                </div>

                {['importance','competence','priority'].map(scale => {
                  const current = ratings[`${item.id}_${scale}`] || 0
                  const col = SCALE_TOKENS[scale]
                  return (
                    <div key={scale} style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                      <div style={{ width:140, fontSize:12, fontWeight:700, color:'var(--text-secondary)', flexShrink:0 }}>
                        {SCALE_NAMES[scale]}
                      </div>
                      <div style={{ display:'flex', gap:6 }}>
                        {[1,2,3,4,5].map(v => (
                          <button key={v}
                            onClick={() => setRating(item.id, scale, v)}
                            title={SCALE_LABELS[scale][v]}
                            style={{
                              width:38, height:38, borderRadius:'var(--radius-control)',
                              cursor:'pointer', fontSize:14, fontWeight:700,
                              transition:'all var(--dur-micro) var(--ease)',
                              border: current === v ? 'none' : '1.5px solid var(--border)',
                              background: current === v ? col : 'var(--surface-card)',
                              color: current === v ? '#fff' : 'var(--text-muted)',
                              transform: current === v ? 'scale(1.1)' : 'scale(1)',
                            }}>
                            {v}
                          </button>
                        ))}
                      </div>
                      {current > 0 && (
                        <span style={{ fontSize:12, color: col, fontWeight:600 }}>
                          {SCALE_LABELS[scale][current]}
                        </span>
                      )}
                    </div>
                  )
                })}

                {allRated && band && (
                  <div style={{
                    display:'inline-flex', gap:12, alignItems:'center',
                    marginTop:4, padding:'7px 14px',
                    background:'color-mix(in srgb, ' + band.color + ' 12%, transparent)',
                    borderRadius:'var(--radius-control)'
                  }}>
                    <span style={{ fontSize:12, color:'var(--text-secondary)' }}>
                      Gap: <strong style={{ color:'var(--text-primary)' }}>{gap}</strong>
                    </span>
                    <span style={{ fontSize:12, color:'var(--text-secondary)' }}>
                      TNI: <strong style={{ color: band.color }}>{tni}</strong>
                    </span>
                    <span style={{
                      fontSize:11, fontWeight:700, padding:'2px 10px',
                      borderRadius:10, background:'var(--surface-card)',
                      color: band.color, border:`1px solid ${band.color}`
                    }}>
                      {band.label} need
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </CardBody>
      </Card>

      {saved && (
        <div style={{
          background:'color-mix(in srgb, #16A34A 12%, transparent)', color:'#15803D',
          padding:'11px 16px', borderRadius:'var(--radius-control)',
          fontSize:13, fontWeight:600, marginBottom:12
        }}>
          Responses saved to database successfully
        </div>
      )}

      {error && (
        <div style={{
          background:'color-mix(in srgb, #DC2626 10%, transparent)', color:'#DC2626',
          padding:'11px 16px', borderRadius:'var(--radius-control)',
          fontSize:13, marginBottom:12
        }}>
          {error}
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10 }}>
        <Button variant="secondary" disabled={isFirst} onClick={handlePrev}>← Previous</Button>
        <Button variant="ghost" disabled={saving} onClick={() => saveDomain(currentDomain)}>
          {saving ? 'Saving...' : 'Save progress'}
        </Button>
        {isLast ? (
          <Button disabled={saving} onClick={handleSubmit}>Submit assessment</Button>
        ) : (
          <Button disabled={saving} onClick={handleNext}>Next domain →</Button>
        )}
      </div>
    </div>
  )
}
