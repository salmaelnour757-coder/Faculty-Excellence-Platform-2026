// modules/develop/Develop.jsx
// Ported and consolidated from the old repo's IDP.jsx + FacultyPathways.jsx
// (master branch). Those two components independently fetched overlapping
// data (domains, responses, pathways, enrolments) and computed similar
// domain-TNI rankings by two different routes. Develop does it once:
//
//   1. Compute per-domain average TNI from this faculty member's responses
//   2. Use that single ranking for both the gap-analysis chart AND the
//      "matches your training need" pathway tag — previously two separate
//      calculations that could in principle disagree
//
// Business logic (enrolment status/pending-approval, .ics generation) is
// unchanged from FacultyPathways.jsx. Styling ported onto tokens.
//
// NOT YET in this port: the attendance + Jotform-evaluation-status check
// that will gate certificate issuance in Evidence. That's tracked in
// docs/02-module-specs/develop.md as the next addition to this module —
// enrolments currently track status/progress only, not attendance/evaluation.

import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Card, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { Pill } from '../../shared/components/Pill'

export default function Develop({ institution, currentUser, setScreen }) {
  const [domains, setDomains]         = useState([])
  const [responses, setResponses]     = useState([])
  const [pathways, setPathways]       = useState([])
  const [enrolments, setEnrolments]   = useState([])
  const [workshopsByPathway, setWorkshopsByPathway] = useState({})
  const [loading, setLoading]         = useState(true)
  const [enrolling, setEnrolling]     = useState(null)
  const [message, setMessage]         = useState('')
  const [expanded, setExpanded]       = useState(null)

  useEffect(() => {
    if (institution?.id && currentUser?.id) loadData()
  }, [institution?.id, currentUser?.id])

  async function loadData() {
    setLoading(true)

    const { data: domainsData } = await supabase
      .from('domains')
      .select('*')
      .eq('institution_id', institution.id)
      .order('domain_number')

    // responses joined to items so we can attribute each response's TNI to a domain
    const { data: responsesData } = await supabase
      .from('responses')
      .select('*, items(domain_id)')
      .eq('user_id', currentUser.id)

    const { data: pathwaysData } = await supabase
      .from('pathways')
      .select('*')
      .eq('institution_id', institution.id)
      .eq('is_active', true)
      .contains('career_tracks', [currentUser.career_track])

    const { data: enrolData } = await supabase
      .from('enrolments')
      .select('*')
      .eq('user_id', currentUser.id)

    const activePathways = pathwaysData || []
    const pathwayIds = activePathways.map(p => p.id)
    let workshopsData = []
    if (pathwayIds.length > 0) {
      const { data: w } = await supabase
        .from('workshops')
        .select('*')
        .in('pathway_id', pathwayIds)
        .order('start_time')
      workshopsData = w || []
    }
    const grouped = {}
    workshopsData.forEach(w => {
      if (!grouped[w.pathway_id]) grouped[w.pathway_id] = []
      grouped[w.pathway_id].push(w)
    })

    setDomains(domainsData || [])
    setResponses(responsesData || [])
    setPathways(activePathways)
    setEnrolments(enrolData || [])
    setWorkshopsByPathway(grouped)
    setLoading(false)
  }

  // One TNI-by-domain calculation, used for both the gap chart and pathway matching.
  function getDomainTNI(domainId) {
    const dr = responses.filter(r => r.items?.domain_id === domainId)
    if (dr.length === 0) return 0
    return Math.round(dr.reduce((s, r) => s + (r.tni || 0), 0) / dr.length * 10) / 10
  }

  const domainProfiles = domains
    .map(d => ({ ...d, tni: getDomainTNI(d.id) }))
    .sort((a, b) => b.tni - a.tni)

  const recommendedCodes = domainProfiles
    .filter(d => d.tni > 0)
    .slice(0, 3)
    .flatMap(d => [String(d.domain_number), `D${d.domain_number}`])

  function getTNIBand(tni) {
    if (tni >= 13) return { label: 'Critical', color: '#DC2626' }
    if (tni >= 9)  return { label: 'High',     color: '#EA580C' }
    if (tni >= 5)  return { label: 'Moderate', color: '#CA8A04' }
    return               { label: 'Low',      color: '#16A34A' }
  }

  function matchesNeed(pathway) {
    return (pathway.domain_codes || []).some(c => recommendedCodes.includes(String(c)))
  }

  function enrolmentFor(pathwayId) {
    return enrolments.find(e => e.pathway_id === pathwayId)
  }

  async function enrol(pathway) {
    setEnrolling(pathway.id)
    const status = pathway.requires_approval ? 'pending' : 'active'

    const { error } = await supabase.from('enrolments').insert({
      user_id: currentUser.id,
      pathway_id: pathway.id,
      institution_id: institution.id,
      status,
      progress_percent: 0,
    })

    setEnrolling(null)
    if (!error) {
      setMessage(
        pathway.requires_approval
          ? `Enrolment request sent for "${pathway.name}" — awaiting approval.`
          : `Enrolled in "${pathway.name}".`
      )
      setTimeout(() => setMessage(''), 4000)
      loadData()
    } else {
      console.error('Enrolment failed:', error)
    }
  }

  function fmtIcsDate(d) {
    return new Date(d).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  function triggerDownload(content, filename) {
    const blob = new Blob([content], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadWorkshopIcs(w) {
    const loc = w.format === 'online' ? (w.meeting_link || 'Online') : (w.location || '')
    const desc = (w.description || '').replace(/\n/g, '\\n')
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `UID:${w.id}@fep`,
      `DTSTAMP:${fmtIcsDate(new Date())}`,
      `DTSTART:${fmtIcsDate(w.start_time)}`,
      `DTEND:${fmtIcsDate(w.end_time)}`,
      `SUMMARY:${w.title}`,
      `DESCRIPTION:${desc}${w.facilitator ? `\\nFacilitator: ${w.facilitator}` : ''}`,
      `LOCATION:${loc}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n')
    triggerDownload(ics, `${w.title.replace(/[^a-z0-9]/gi, '_')}.ics`)
  }

  function downloadPathwayIcs(pathway) {
    const sessions = workshopsByPathway[pathway.id] || []
    if (sessions.length === 0) return
    const events = sessions.map(w => {
      const loc = w.format === 'online' ? (w.meeting_link || 'Online') : (w.location || '')
      const desc = (w.description || '').replace(/\n/g, '\\n')
      return [
        'BEGIN:VEVENT',
        `UID:${w.id}@fep`,
        `DTSTAMP:${fmtIcsDate(new Date())}`,
        `DTSTART:${fmtIcsDate(w.start_time)}`,
        `DTEND:${fmtIcsDate(w.end_time)}`,
        `SUMMARY:${w.title}`,
        `DESCRIPTION:${desc}${w.facilitator ? `\\nFacilitator: ${w.facilitator}` : ''}`,
        `LOCATION:${loc}`,
        'END:VEVENT'
      ].join('\r\n')
    }).join('\r\n')
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${events}\r\nEND:VCALENDAR`
    triggerDownload(ics, `${pathway.name.replace(/[^a-z0-9]/gi, '_')}_schedule.ics`)
  }

  const formatLabel = { in_person: 'In-person', online: 'Online', hybrid: 'Hybrid' }

  const statusBadge = (status) => {
    const map = {
      active:    { color: '#15803D', label: 'Enrolled' },
      pending:   { color: '#92400E', label: 'Pending approval' },
      completed: { color: 'var(--brand-primary)', label: 'Completed' },
    }
    return map[status] || map.active
  }

  if (loading) return (
    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading your development plan...</div>
  )

  if (responses.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '50vh', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
        Complete your assessment first
      </div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Your development plan is generated from your assessment responses.
      </div>
      <Button onClick={() => setScreen('assess')}>Start assessment →</Button>
    </div>
  )

  return (
    <div>
      {/* Competency gap analysis */}
      <Card hoverable={false} style={{ marginBottom: 20 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Competency gap analysis
          </div>
        </div>
        <CardBody>
          {domainProfiles.map(d => {
            const { label, color } = getTNIBand(d.tni)
            const width = Math.max((d.tni / 20) * 100, 2)
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 220, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>
                  {d.name}
                </div>
                <div style={{ flex: 1, height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: color, width: `${width}%`,
                                transition: 'width var(--dur-page) var(--ease)' }} />
                </div>
                <div style={{ fontWeight: 700, color, width: 36, textAlign: 'right' }}>{d.tni}</div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 10,
                               background: `color-mix(in srgb, ${color} 12%, transparent)`, color, width: 76,
                               textAlign: 'center', flexShrink: 0 }}>
                  {label}
                </span>
              </div>
            )
          })}
        </CardBody>
      </Card>

      {/* Pathways */}
      {message && (
        <div style={{ background: 'color-mix(in srgb, #16A34A 12%, transparent)', color: '#15803D',
                      padding: '10px 16px', borderRadius: 'var(--radius-control)', fontSize: 13,
                      fontWeight: 600, marginBottom: 16 }}>
          {message}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Development pathways</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Pathways available for your career track, ranked by your assessed training needs
        </div>
      </div>

      {pathways.length === 0 ? (
        <Card hoverable={false}>
          <CardBody style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, padding: '32px 20px' }}>
            No pathways are currently available for your career track.
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pathways.map(p => {
            const enrolment = enrolmentFor(p.id)
            const badge = enrolment ? statusBadge(enrolment.status) : null
            const sessions = workshopsByPathway[p.id] || []
            const isOpen = expanded === p.id
            const recommended = matchesNeed(p)

            return (
              <Card key={p.id} hoverable={false}>
                <div style={{ padding: '16px 18px', display: 'flex', gap: 12, flexWrap: 'wrap',
                              justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 15,
                                  display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {p.name}
                      {recommended && <Pill active>Matches your training need</Pill>}
                      {p.is_flagship && <Pill>Flagship</Pill>}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 480 }}>
                      {p.description || 'No description provided.'}
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12, color: 'var(--text-muted)', marginTop: 8, flexWrap: 'wrap' }}>
                      <span>{p.cpd_credits} CPD credits</span>
                      <span>{p.duration_hours} hrs</span>
                      <span>{sessions.length} session{sessions.length !== 1 ? 's' : ''} scheduled</span>
                    </div>
                    {badge && (
                      <span style={{ color: badge.color, fontSize: 11, fontWeight: 700,
                                     display: 'inline-block', marginTop: 8 }}>
                        {badge.label}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    {!enrolment && (
                      <Button onClick={() => enrol(p)} disabled={enrolling === p.id} style={{ padding: '9px 18px', fontSize: 13 }}>
                        {enrolling === p.id ? 'Enrolling...' : p.requires_approval ? 'Request enrolment' : 'Enrol now'}
                      </Button>
                    )}
                    {enrolment?.status === 'active' && (
                      <div style={{ width: 140 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4, textAlign: 'right' }}>
                          {enrolment.progress_percent || 0}% complete
                        </div>
                        <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${enrolment.progress_percent || 0}%`, background: 'var(--brand-accent)' }} />
                        </div>
                      </div>
                    )}
                    {sessions.length > 0 && (
                      <Button variant="secondary" onClick={() => downloadPathwayIcs(p)} style={{ padding: '7px 14px', fontSize: 12 }}>
                        Add all sessions to calendar
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => setExpanded(isOpen ? null : p.id)} style={{ padding: '6px 14px', fontSize: 12, border: 'none' }}>
                      {isOpen ? 'Hide schedule ▲' : 'View schedule ▼'}
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '14px 18px', background: 'var(--surface-page)' }}>
                    {sessions.length === 0 ? (
                      <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>No sessions scheduled for this pathway yet.</div>
                    ) : (
                      sessions.map(w => (
                        <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                                                  gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{w.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                              {new Date(w.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              {' – '}
                              {new Date(w.end_time).toLocaleTimeString([], { timeStyle: 'short' })}
                            </div>
                            <div style={{ display: 'flex', gap: 12, fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, flexWrap: 'wrap' }}>
                              <span>{formatLabel[w.format]}</span>
                              {w.location && <span>{w.location}</span>}
                              {w.meeting_link && (
                                <a href={w.meeting_link} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-accent)' }}>Join link</a>
                              )}
                              {w.facilitator && <span>{w.facilitator}</span>}
                            </div>
                          </div>
                          <Button variant="secondary" onClick={() => downloadWorkshopIcs(w)} style={{ padding: '6px 12px', fontSize: 11.5, flexShrink: 0 }}>
                            Add to calendar
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
