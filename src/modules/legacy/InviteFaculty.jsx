import { useState } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Card, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { Pill } from '../../shared/components/Pill'

const ROLES = [
  { value: 'faculty',          label: 'Faculty Member',   icon: '👤' },
  { value: 'supervisor',       label: 'Supervisor',       icon: '👁️' },
  { value: 'chair',            label: 'Department Chair', icon: '🏢' },
  { value: 'quality_director', label: 'Quality Director', icon: '✅' },
  { value: 'program_director', label: 'Program Director', icon: '📋' },
  { value: 'dean',             label: 'Dean',             icon: '🎓' },
  { value: 'admin',            label: 'Administrator',    icon: '⚙️' },
]

const RANKS = [
  'Professor', 'Associate Professor', 'Assistant Professor',
  'Lecturer', 'Clinical Faculty', 'Staff'
]

const TRACKS = [
  { value: 'A', label: 'Track A — New Faculty (Year 1)'     },
  { value: 'B', label: 'Track B — Early Career (Years 2–5)' },
  { value: 'C', label: 'Track C — Mid Career (Years 6–12)'  },
  { value: 'D', label: 'Track D — Senior Faculty (Years 12+)'},
]

export default function InviteFaculty({ institution, currentUser, onClose, onInvited }) {
  const [form, setForm] = useState({
    email: '', full_name: '', role: 'faculty',
    rank: 'Assistant Professor', department: '',
    college: '', career_track: 'B'
  })
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')
  const [inviteLink, setInviteLink] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleInvite() {
    if (!form.email || !form.full_name) {
      setError('Email and full name are required.')
      return
    }
    setLoading(true)
    setError('')

    const { data: invitation, error: invErr } = await supabase
      .from('invitations')
      .insert({
        institution_id: institution.id,
        invited_by:     currentUser.id,
        email:          form.email,
        full_name:      form.full_name,
        role:           form.role,
        rank:           form.rank,
        department:     form.department,
        college:        form.college,
        career_track:   form.career_track,
      })
      .select()
      .single()

    if (invErr) {
      setError(invErr.message)
      setLoading(false)
      return
    }

    const link = `${window.location.origin}/faculty-excellence-platform/?invite=${invitation.token}`
    setInviteLink(link)
    setSuccess(true)
    setLoading(false)
    if (onInvited) onInvited()
  }

  const inp = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-control)',
    border: '1px solid var(--border)', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', background: 'var(--surface-card)', color: 'var(--text-primary)',
  }
  const label = {
    display: 'block', fontWeight: 600, color: 'var(--text-primary)',
    fontSize: 13, marginBottom: 6
  }

  if (success) return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card hoverable={false}>
        <CardBody style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Invitation created for {form.full_name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
            Share this link — it expires in 7 days.
          </div>

          <div style={{
            background: 'var(--surface-page)', borderRadius: 'var(--radius-control)', padding: '14px 16px',
            border: '1px solid var(--border)', marginBottom: 16, textAlign: 'left'
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)',
                          marginBottom: 6, textTransform: 'uppercase' }}>
              Invitation Link
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)',
                          wordBreak: 'break-all', marginBottom: 10 }}>
              {inviteLink}
            </div>
            <Button onClick={() => navigator.clipboard.writeText(inviteLink)} style={{ padding: '7px 16px', fontSize: 12 }}>
              📋 Copy Link
            </Button>
          </div>

          <div style={{
            background: 'var(--pill-bg)', borderRadius: 'var(--radius-control)', padding: '12px 16px',
            fontSize: 13, color: 'var(--text-primary)', marginBottom: 24, textAlign: 'left'
          }}>
            ℹ️ When {form.full_name} opens the link they will create a password.
            Their role and profile will be set automatically.
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              onClick={() => {
                setSuccess(false)
                setForm({ email:'', full_name:'', role:'faculty',
                  rank:'Assistant Professor', department:'', college:'', career_track:'B' })
              }}
              style={{ flex: 1, padding: 12, fontSize: 13 }}>
              + Invite Another
            </Button>
            <Button variant="secondary" onClick={onClose} style={{ flex: 1, padding: 12, fontSize: 13 }}>
              Done
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card hoverable={false}>
        <CardBody style={{ padding: 32 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 24
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
              ✉️ Invite Faculty Member
            </div>
            <button onClick={onClose}
              style={{
                background: 'none', border: 'none',
                fontSize: 20, cursor: 'pointer', color: 'var(--text-secondary)'
              }}>✕</button>
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={label}>Role *</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))',
              gap: 8
            }}>
              {ROLES.map(r => (
                <Pill key={r.value} active={form.role === r.value} onClick={() => set('role', r.value)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start' }}>
                  <span>{r.icon}</span>
                  <span>{r.label}</span>
                </Pill>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 14, marginBottom: 16
          }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label style={label}>Full Name *</label>
              <input style={inp} value={form.full_name}
                onChange={e => set('full_name', e.target.value)}
                placeholder="e.g. Dr. Sara Ali" />
            </div>

            <div style={{ gridColumn: '1/-1' }}>
              <label style={label}>Email Address *</label>
              <input style={inp} type="email" value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="e.g. sara.ali@gmu.ac.ae" />
            </div>

            <div>
              <label style={label}>Academic Rank</label>
              <select style={inp} value={form.rank}
                onChange={e => set('rank', e.target.value)}>
                {RANKS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label style={label}>Career Track</label>
              <select style={inp} value={form.career_track}
                onChange={e => set('career_track', e.target.value)}>
                {TRACKS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={label}>Department</label>
              <input style={inp} value={form.department}
                onChange={e => set('department', e.target.value)}
                placeholder="e.g. Medical Laboratory Sciences" />
            </div>

            <div>
              <label style={label}>College</label>
              <input style={inp} value={form.college}
                onChange={e => set('college', e.target.value)}
                placeholder="e.g. College of Health Sciences" />
            </div>
          </div>

          {error && (
            <div style={{
              background: 'color-mix(in srgb, #DC2626 10%, transparent)', color: '#DC2626',
              padding: '10px 14px', borderRadius: 'var(--radius-control)',
              fontSize: 13, marginBottom: 16
            }}>
              {error}
            </div>
          )}

          <Button onClick={handleInvite} disabled={loading} style={{ width: '100%', padding: 13, fontSize: 15 }}>
            {loading ? 'Creating invitation...' : '✉️ Create Invitation'}
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
