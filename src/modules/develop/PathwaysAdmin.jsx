// modules/develop/PathwaysAdmin.jsx
// Ported from the old repo's PathwaysManagement.jsx (which was never
// actually wired into Shell's nav — a gap in the old app). Two additions
// beyond the port + restyle:
//
// 1. A jotform_form_id field on the workshop form — this is what lets
//    Evidence check evaluation status for this specific workshop.
// 2. An attendance-marking panel per workshop — this is new; attendance
//    confirmation didn't exist anywhere in the old app. It's what sets
//    enrolments.attendance_confirmed, the other half of Evidence's
//    certificate trigger.

import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Button } from '../../shared/components/Button'

export default function PathwaysAdmin({ institution }) {
  const [pathways, setPathways]     = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [workshops, setWorkshops]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(null)
  const [creating, setCreating]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [saved, setSaved]           = useState('')
  const [attendanceFor, setAttendanceFor] = useState(null)
  const [enrolledFaculty, setEnrolledFaculty] = useState([])

  const blank = {
    title: '', description: '', facilitator: '', format: 'in_person',
    location: '', meeting_link: '', start_time: '', end_time: '', capacity: '',
    jotform_form_id: '',
  }
  const [form, setForm] = useState(blank)

  useEffect(() => { loadPathways() }, [])
  useEffect(() => { if (selectedId) loadWorkshops() }, [selectedId])

  async function loadPathways() {
    const { data } = await supabase
      .from('pathways')
      .select('*')
      .eq('institution_id', institution.id)
      .order('name')
    setPathways(data || [])
    if (data && data.length > 0) setSelectedId(data[0].id)
    setLoading(false)
  }

  async function loadWorkshops() {
    const { data } = await supabase
      .from('workshops')
      .select('*')
      .eq('pathway_id', selectedId)
      .order('start_time')
    setWorkshops(data || [])
  }

  function openNew() {
    setForm(blank)
    setCreating(true)
    setEditing(null)
  }

  function openEdit(w) {
    setForm({
      title: w.title, description: w.description || '', facilitator: w.facilitator || '',
      format: w.format || 'in_person', location: w.location || '', meeting_link: w.meeting_link || '',
      start_time: toLocalInput(w.start_time), end_time: toLocalInput(w.end_time),
      capacity: w.capacity ?? '', jotform_form_id: w.jotform_form_id || '',
    })
    setEditing(w.id)
    setCreating(false)
  }

  function toLocalInput(iso) {
    const d = new Date(iso)
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  async function saveWorkshop() {
    if (!form.title || !form.start_time || !form.end_time) return
    setSaving(true)

    const payload = {
      institution_id: institution.id,
      pathway_id: selectedId,
      title: form.title,
      description: form.description,
      facilitator: form.facilitator,
      format: form.format,
      location: form.location,
      meeting_link: form.meeting_link,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      capacity: form.capacity ? parseInt(form.capacity) : null,
      jotform_form_id: form.jotform_form_id || null,
    }

    const { error } = editing
      ? await supabase.from('workshops').update(payload).eq('id', editing)
      : await supabase.from('workshops').insert(payload)

    setSaving(false)
    if (!error) {
      setSaved(editing ? 'Workshop updated.' : 'Workshop added.')
      setTimeout(() => setSaved(''), 3000)
      setEditing(null)
      setCreating(false)
      loadWorkshops()
    } else {
      console.error('Workshop save failed:', error)
    }
  }

  async function deleteWorkshop(id) {
    if (!confirm('Delete this workshop?')) return
    const { error } = await supabase.from('workshops').delete().eq('id', id)
    if (!error) loadWorkshops()
    else console.error('Delete failed:', error)
  }

  // ── Attendance marking — new, no old-repo equivalent ──────────────────
  // Faculty enrol at the pathway level (enrolments), so to find who might
  // attend a given workshop we start from that workshop's pathway's
  // enrolments, then check/create their per-workshop attendance row.
  async function openAttendance(workshop) {
    setAttendanceFor(workshop)

    const { data: enrolled } = await supabase
      .from('enrolments')
      .select('user_id, users(full_name, email)')
      .eq('pathway_id', workshop.pathway_id)

    const { data: attendanceRows } = await supabase
      .from('workshop_attendance')
      .select('*')
      .eq('workshop_id', workshop.id)

    const merged = (enrolled || []).map(en => {
      const existing = (attendanceRows || []).find(a => a.user_id === en.user_id)
      return {
        user_id: en.user_id,
        full_name: en.users?.full_name,
        email: en.users?.email,
        attendance_id: existing?.id || null,
        attendance_confirmed: existing?.attendance_confirmed || false,
      }
    })
    setEnrolledFaculty(merged)
  }

  async function toggleAttendance(row, workshopId) {
    if (row.attendance_id) {
      await supabase.from('workshop_attendance')
        .update({ attendance_confirmed: !row.attendance_confirmed })
        .eq('id', row.attendance_id)
    } else {
      await supabase.from('workshop_attendance')
        .insert({ user_id: row.user_id, workshop_id: workshopId, attendance_confirmed: true })
    }
    // Re-fetch rather than hand-patch state, so attendance_id is correct after a first-time insert.
    openAttendance(attendanceFor)
  }

  const selectedPathway = pathways.find(p => p.id === selectedId)
  const formatLabel = { in_person: 'In-person', online: 'Online', hybrid: 'Hybrid' }
  const inputStyle = { width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border)', boxSizing: 'border-box', background: 'var(--surface-card)', color: 'var(--text-primary)' }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: 5 }

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading pathways...</div>

  if (attendanceFor) {
    return (
      <div>
        <Button variant="ghost" onClick={() => setAttendanceFor(null)} style={{ marginBottom: 16, border: 'none' }}>← Back to workshops</Button>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          Attendance — {attendanceFor.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Marking attendance here is what allows Evidence to issue a certificate once the evaluation is also confirmed.
        </div>
        {enrolledFaculty.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No one is enrolled in this workshop yet.</div>
        ) : (
          enrolledFaculty.map(e => (
            <div key={e.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                      padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{e.full_name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{e.email}</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!e.attendance_confirmed} onChange={() => toggleAttendance(e, attendanceFor.id)} />
                Attended
              </label>
            </div>
          ))
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ width: 220, flexShrink: 0, background: 'var(--surface-card)', borderRadius: 'var(--radius-card)',
                    border: '1px solid var(--border)', padding: 10, alignSelf: 'flex-start' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
                      textTransform: 'uppercase', letterSpacing: .5, padding: '4px 8px 10px' }}>
          Pathways
        </div>
        {pathways.map(p => (
          <button key={p.id} onClick={() => setSelectedId(p.id)}
            style={{
              display: 'block', width: '100%', padding: '9px 10px', borderRadius: 'var(--radius-control)',
              border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 13,
              fontWeight: selectedId === p.id ? 700 : 400, marginBottom: 2,
              background: selectedId === p.id ? 'var(--pill-bg)' : 'transparent',
              color: selectedId === p.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
            }}>
            {p.name}
          </button>
        ))}
        {pathways.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 10px' }}>
            No pathways yet — add one in Settings first.
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        {saved && (
          <div style={{ background: 'color-mix(in srgb, #16A34A 12%, transparent)', color: '#15803D', padding: '10px 16px',
                        borderRadius: 'var(--radius-control)', fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            {saved}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              {selectedPathway?.name || 'Select a pathway'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {workshops.length} workshop{workshops.length !== 1 ? 's' : ''} scheduled
            </div>
          </div>
          {selectedId && <Button onClick={openNew}>Add workshop</Button>}
        </div>

        {(creating || editing) && (
          <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '2px solid var(--brand-accent)',
                        padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
              {editing ? 'Edit workshop' : 'New workshop'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Active Learning Strategies Workshop" style={inputStyle} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="What this session covers" style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={labelStyle}>Facilitator</label>
                <input value={form.facilitator} onChange={e => setForm(f => ({ ...f, facilitator: e.target.value }))}
                  placeholder="Name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Format</label>
                <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))} style={inputStyle}>
                  <option value="in_person">In-person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              {form.format !== 'online' && (
                <div>
                  <label style={labelStyle}>Location</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="Room / building" style={inputStyle} />
                </div>
              )}
              {form.format !== 'in_person' && (
                <div>
                  <label style={labelStyle}>Meeting link</label>
                  <input value={form.meeting_link} onChange={e => setForm(f => ({ ...f, meeting_link: e.target.value }))}
                    placeholder="https://zoom.us/..." style={inputStyle} />
                </div>
              )}
              <div>
                <label style={labelStyle}>Start</label>
                <input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>End</label>
                <input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Capacity (optional)</label>
                <input type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  placeholder="e.g. 30" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Jotform evaluation form ID</label>
                <input value={form.jotform_form_id} onChange={e => setForm(f => ({ ...f, jotform_form_id: e.target.value }))}
                  placeholder="From the Quality Department's evaluation form URL" style={inputStyle} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button disabled={saving} onClick={saveWorkshop}>{saving ? 'Saving...' : 'Save workshop'}</Button>
              <Button variant="secondary" onClick={() => { setCreating(false); setEditing(null) }}>Cancel</Button>
            </div>
          </div>
        )}

        {workshops.length === 0 && !creating ? (
          <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)',
                        padding: '32px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            No workshops scheduled for this pathway yet.
          </div>
        ) : (
          workshops.map(w => (
            <div key={w.id} style={{ background: 'var(--surface-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)',
                                      padding: '14px 18px', marginBottom: 10,
                                      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{w.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                  {new Date(w.start_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  {' – '}
                  {new Date(w.end_time).toLocaleTimeString([], { timeStyle: 'short' })}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>{formatLabel[w.format]}</span>
                  {w.location && <span>{w.location}</span>}
                  {w.facilitator && <span>{w.facilitator}</span>}
                  {w.capacity && <span>Capacity: {w.capacity}</span>}
                  {!w.jotform_form_id && <span style={{ color: '#CA8A04' }}>No evaluation form linked</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <Button variant="secondary" onClick={() => openAttendance(w)} style={{ padding: '6px 12px', fontSize: 12 }}>Attendance</Button>
                <Button variant="secondary" onClick={() => openEdit(w)} style={{ padding: '6px 12px', fontSize: 12 }}>Edit</Button>
                <Button variant="ghost" onClick={() => deleteWorkshop(w.id)} style={{ padding: '6px 12px', fontSize: 12, color: '#DC2626' }}>Delete</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
