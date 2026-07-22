import { useState } from 'react'
import { supabase } from '../../shared/lib/supabase'

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
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid #DDE3EF', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', background: 'white'
  }

  if (success) return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{
        background: 'white', borderRadius: 12,
        border: '1px solid #DDE3EF', padding: 32,
        boxShadow: '0 2px 12px rgba(13,43,94,.08)', textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#0D2B5E', marginBottom: 6 }}>
          Invitation created for {form.full_name}
        </div>
        <div style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>
          Share this link — it expires in 7 days.
        </div>

        <div style={{
          background: '#F2F5FA', borderRadius: 8, padding: '14px 16px',
          border: '1px solid #DDE3EF', marginBottom: 16, textAlign: 'left'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B',
                        marginBottom: 6, textTransform: 'uppercase' }}>
            Invitation Link
          </div>
          <div style={{ fontSize: 12, color: '#0D2B5E',
                        wordBreak: 'break-all', marginBottom: 10 }}>
            {inviteLink}
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(inviteLink)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              background: '#0D2B5E', color: 'white',
              fontWeight: 700, fontSize: 12, cursor: 'pointer'
            }}>
            📋 Copy Link
          </button>
        </div>

        <div style={{
          background: '#EEF2FF', borderRadius: 8, padding: '12px 16px',
          fontSize: 13, color: '#0D2B5E', marginBottom: 24, textAlign: 'left'
        }}>
          ℹ️ When {form.full_name} opens the link they will create a password.
          Their role and profile will be set automatically.
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => {
              setSuccess(false)
              setForm({ email:'', full_name:'', role:'faculty',
                rank:'Assistant Professor', department:'', college:'', career_track:'B' })
            }}
            style={{
              flex: 1, padding: 12, borderRadius: 8, border: 'none',
              background: '#1A7B8C', color: 'white',
              fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}>
            + Invite Another
          </button>
          <button onClick={onClose}
            style={{
              flex: 1, padding: 12, borderRadius: 8,
              border: '1.5px solid #DDE3EF', background: 'white',
              color: '#0D2B5E', fontWeight: 700, fontSize: 13, cursor: 'pointer'
            }}>
            Done
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{
        background: 'white', borderRadius: 12,
        border: '1px solid #DDE3EF', padding: 32,
        boxShadow: '0 2px 12px rgba(13,43,94,.08)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 24
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0D2B5E' }}>
            ✉️ Invite Faculty Member
          </div>
          <button onClick={onClose}
            style={{
              background: 'none', border: 'none',
              fontSize: 20, cursor: 'pointer', color: '#64748B'
            }}>✕</button>
        </div>

        {/* Role selector */}
        <div style={{ marginBottom: 20 }}>
          <label style={{
            display: 'block', fontWeight: 600, color: '#0D2B5E',
            fontSize: 13, marginBottom: 8
          }}>
            Role *
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))',
            gap: 8
          }}>
            {ROLES.map(r => (
              <button key={r.value} onClick={() => set('role', r.value)}
                style={{
                  padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                  border: `2px solid ${form.role === r.value ? '#0D2B5E' : '#DDE3EF'}`,
                  background: form.role === r.value ? '#EEF2FF' : 'white',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13,
                  fontWeight: form.role === r.value ? 700 : 400,
                  color: '#0D2B5E'
                }}>
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form fields */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 14, marginBottom: 16
        }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{
              display: 'block', fontWeight: 600, color: '#0D2B5E',
              fontSize: 13, marginBottom: 6
            }}>Full Name *</label>
            <input style={inp} value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              placeholder="e.g. Dr. Sara Ali" />
          </div>

          <div style={{ gridColumn: '1/-1' }}>
            <label style={{
              display: 'block', fontWeight: 600, color: '#0D2B5E',
              fontSize: 13, marginBottom: 6
            }}>Email Address *</label>
            <input style={inp} type="email" value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="e.g. sara.ali@gmu.ac.ae" />
          </div>

          <div>
            <label style={{
              display: 'block', fontWeight: 600, color: '#0D2B5E',
              fontSize: 13, marginBottom: 6
            }}>Academic Rank</label>
            <select style={inp} value={form.rank}
              onChange={e => set('rank', e.target.value)}>
              {RANKS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block', fontWeight: 600, color: '#0D2B5E',
              fontSize: 13, marginBottom: 6
            }}>Career Track</label>
            <select style={inp} value={form.career_track}
              onChange={e => set('career_track', e.target.value)}>
              {TRACKS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{
              display: 'block', fontWeight: 600, color: '#0D2B5E',
              fontSize: 13, marginBottom: 6
            }}>Department</label>
            <input style={inp} value={form.department}
              onChange={e => set('department', e.target.value)}
              placeholder="e.g. Medical Laboratory Sciences" />
          </div>

          <div>
            <label style={{
              display: 'block', fontWeight: 600, color: '#0D2B5E',
              fontSize: 13, marginBottom: 6
            }}>College</label>
            <input style={inp} value={form.college}
              onChange={e => set('college', e.target.value)}
              placeholder="e.g. College of Health Sciences" />
          </div>
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2', color: '#DC2626',
            padding: '10px 14px', borderRadius: 8,
            fontSize: 13, marginBottom: 16
          }}>
            {error}
          </div>
        )}

        <button onClick={handleInvite} disabled={loading}
          style={{
            width: '100%', padding: 13, borderRadius: 8, border: 'none',
            background: loading ? '#94A3B8' : '#0D2B5E',
            color: 'white', fontWeight: 700, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
          {loading ? 'Creating invitation...' : '✉️ Create Invitation'}
        </button>
      </div>
    </div>
  )
}