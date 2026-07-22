import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Card, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { Pill } from '../../shared/components/Pill'

const SECTIONS = [
  { id: 'institution',   icon: '🏛️', label: 'Institution Profile'    },
  { id: 'framework',     icon: '🗂️', label: 'Framework Editor'       },
  { id: 'instrument',    icon: '📋', label: 'Instrument Editor'      },
  { id: 'pathways',      icon: '🎓', label: 'Pathways Manager'       },
  { id: 'tracks',        icon: '🛤️', label: 'Career Tracks'          },
  { id: 'roles',         icon: '👥', label: 'Roles & Permissions'    },
  { id: 'comms',         icon: '📬', label: 'Communication Settings' },
  { id: 'policy',        icon: '⚙️', label: 'Policy Settings'        },
  { id: 'users',         icon: '👤', label: 'User Management'        },
]

export default function Settings({ institution, currentUser, onUpdate }) {
  const [section, setSection] = useState('institution')

  return (
    <div style={{ display:'flex', gap:20 }}>

      {/* Sidebar */}
      <div style={{
        width: 220, flexShrink: 0,
        background: 'var(--surface-card)', borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
        padding: 10,
        boxShadow: '0 1px 2px rgba(var(--shadow-color),0.04), 0 6px 16px rgba(var(--shadow-color),0.06)',
        alignSelf: 'flex-start'
      }}>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-secondary)',
                      textTransform:'uppercase', letterSpacing:.5,
                      padding:'4px 8px 10px' }}>
          Settings
        </div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            style={{
              display:'flex', alignItems:'center', gap:10,
              width:'100%', padding:'9px 10px', borderRadius:'var(--radius-control)',
              border:'none', cursor:'pointer', textAlign:'left',
              fontSize:13, fontWeight: section === s.id ? 700 : 400,
              marginBottom:2,
              background: section === s.id ? 'var(--pill-bg)' : 'transparent',
              color: section === s.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
              transition:'all var(--dur-panel) var(--ease)'
            }}>
            <span style={{ fontSize:16 }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex:1 }}>
        {section === 'institution' && <InstitutionSettings institution={institution} onUpdate={onUpdate} />}
        {section === 'framework'   && <FrameworkSettings   institution={institution} />}
        {section === 'instrument'  && <InstrumentSettings  institution={institution} />}
        {section === 'pathways'    && <PathwaysSettings    institution={institution} />}
        {section === 'tracks'      && <TracksSettings      institution={institution} onUpdate={onUpdate} />}
        {section === 'roles'       && <RolesSettings />}
        {section === 'comms'       && <CommsSettings       institution={institution} onUpdate={onUpdate} />}
        {section === 'policy'      && <PolicySettings      institution={institution} onUpdate={onUpdate} />}
        {section === 'users'       && <UsersSettings       institution={institution} />}
      </div>
    </div>
  )
}

// ── Shared components ─────────────────────────────────────────────────────────

function SettingsCard({ title, subtitle, children, onSave, saving }) {
  return (
    <Card hoverable={false} style={{ marginBottom:16 }}>
      <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>{title}</div>
        {subtitle && <div style={{ fontSize:13, color:'var(--text-secondary)', marginTop:3 }}>{subtitle}</div>}
      </div>
      <CardBody>
        {children}
        {onSave && (
          <div style={{ marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <Button onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontWeight:600, color:'var(--text-primary)',
                      fontSize:13, marginBottom:6 }}>{label}</label>
      {hint && <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:6 }}>{hint}</div>}
      {children}
    </div>
  )
}

function Inp({ value, onChange, placeholder, type='text' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width:'100%', padding:'10px 14px', borderRadius:'var(--radius-control)',
               border:'1px solid var(--border)', fontSize:14, outline:'none',
               boxSizing:'border-box', background:'var(--surface-card)', color:'var(--text-primary)' }} />
  )
}

function Sel({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange}
      style={{ width:'100%', padding:'10px 14px', borderRadius:'var(--radius-control)',
               border:'1px solid var(--border)', fontSize:14, outline:'none',
               boxSizing:'border-box', background:'var(--surface-card)', color:'var(--text-primary)' }}>
      {children}
    </select>
  )
}

function Toggle({ label, desc, value, onChange, recommended }) {
  return (
    <div style={{ display:'flex', gap:14, alignItems:'flex-start',
                  padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
      <button onClick={() => onChange(!value)}
        style={{
          width:46, height:26, borderRadius:13, border:'none', flexShrink:0,
          background: value ? 'var(--brand-accent)' : 'var(--border)',
          cursor:'pointer', position:'relative', transition:'background var(--dur-panel) var(--ease)'
        }}>
        <span style={{
          position:'absolute', top:3,
          left: value ? 23 : 3,
          width:20, height:20, background:'var(--surface-card)',
          borderRadius:'50%', transition:'left var(--dur-panel) var(--ease)'
        }} />
      </button>
      <div>
        <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:14,
                      display:'flex', alignItems:'center', gap:8 }}>
          {label}
          {recommended && <Pill style={{ fontSize:11 }}>Recommended</Pill>}
        </div>
        {desc && <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:3 }}>{desc}</div>}
      </div>
    </div>
  )
}

function SaveBanner({ message }) {
  if (!message) return null
  return (
    <div style={{ background:'color-mix(in srgb, #16A34A 12%, transparent)', color:'#15803D',
                  padding:'10px 16px', borderRadius:'var(--radius-control)', fontSize:13,
                  fontWeight:600, marginBottom:16 }}>
      ✓ {message}
    </div>
  )
}

// ── 1. Institution Settings ───────────────────────────────────────────────────

function InstitutionSettings({ institution, onUpdate }) {
  const [form, setForm] = useState({
    name:                 institution?.name || '',
    short_name:           institution?.short_name || '',
    country:              institution?.country || '',
    city:                 institution?.city || '',
    type:                 institution?.type || 'university',
    website:              institution?.website || '',
    accreditation_bodies: institution?.accreditation_bodies || [],
    branding: {
      primary:    institution?.branding?.primary || '#0D2B5E',
      accent:     institution?.branding?.accent  || '#1A7B8C',
      gold:       institution?.branding?.gold    || '#C9982A',
    }
  })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setBranding = (k, v) => setForm(f => ({ ...f, branding:{ ...f.branding, [k]:v } }))

  const accredBodies = ['CAA','WFME','QAA','NCAAA','ACGME','LCME','GMC','Other']
  const toggleAccred = (b) => {
    const cur = form.accreditation_bodies
    set('accreditation_bodies', cur.includes(b) ? cur.filter(x=>x!==b) : [...cur,b])
  }

  async function save() {
    setSaving(true)
    const { data, error } = await supabase
      .from('institutions')
      .update({
        name:                 form.name,
        short_name:           form.short_name,
        country:              form.country,
        city:                 form.city,
        type:                 form.type,
        website:              form.website,
        accreditation_bodies: form.accreditation_bodies,
        branding:             form.branding,
      })
      .eq('id', institution.id)
      .select()
      .single()

    setSaving(false)
    if (!error) {
      setSaved('Institution profile saved successfully.')
      if (onUpdate) onUpdate(data)
      setTimeout(() => setSaved(''), 3000)
    } else {
      console.error('Institution save failed:', error)
    }
  }

  return (
    <div>
      <SaveBanner message={saved} />

      <SettingsCard title="Institution Profile"
        subtitle="Basic information about your institution"
        onSave={save} saving={saving}>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <Field label="Institution Full Name">
            <Inp value={form.name} onChange={e=>set('name',e.target.value)}
              placeholder="e.g. Gulf Medical University" />
          </Field>
          <Field label="Short Name / Abbreviation">
            <Inp value={form.short_name} onChange={e=>set('short_name',e.target.value)}
              placeholder="e.g. GMU" />
          </Field>
          <Field label="Country">
            <Inp value={form.country} onChange={e=>set('country',e.target.value)}
              placeholder="e.g. UAE" />
          </Field>
          <Field label="City">
            <Inp value={form.city} onChange={e=>set('city',e.target.value)}
              placeholder="e.g. Ajman" />
          </Field>
          <Field label="Institution Type">
            <Sel value={form.type} onChange={e=>set('type',e.target.value)}>
              <option value="university">University</option>
              <option value="medical_school">Medical School</option>
              <option value="college">College / Institute</option>
              <option value="hospital_based">Hospital-Based</option>
            </Sel>
          </Field>
          <Field label="Website">
            <Inp value={form.website} onChange={e=>set('website',e.target.value)}
              placeholder="https://your-institution.edu" />
          </Field>
        </div>

        <Field label="Accreditation Bodies">
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {accredBodies.map(b => {
              const sel = form.accreditation_bodies.includes(b)
              return (
                <Pill key={b} active={sel} onClick={() => toggleAccred(b)}>{b}</Pill>
              )
            })}
          </div>
        </Field>
      </SettingsCard>

      <SettingsCard title="Brand Colours"
        subtitle="These colours are applied throughout the platform">
        <div style={{ display:'flex', gap:24, flexWrap:'wrap', marginBottom:20 }}>
          {[
            { key:'primary', label:'Primary (Navigation)' },
            { key:'accent',  label:'Accent (Active states)' },
            { key:'gold',    label:'Highlight (Badges, CTAs)' },
          ].map(({ key, label }) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:12 }}>
              <input type="color" value={form.branding[key]}
                onChange={e => setBranding(key, e.target.value)}
                style={{ width:48, height:48, borderRadius:'var(--radius-control)',
                         border:'1px solid var(--border)', cursor:'pointer', padding:3 }} />
              <div>
                <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>
                  {form.branding[key]}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Live preview of the institution's own branding colours — intentionally
            independent of the platform's own --brand-* tokens, since this previews
            what the admin is picking, not the app's current theme. */}
        <div style={{ borderRadius:'var(--radius-control)', overflow:'hidden', border:'1px solid var(--border)' }}>
          <div style={{ background:form.branding.primary, padding:'16px 20px' }}>
            <div style={{ color:form.branding.gold, fontWeight:800, fontSize:16 }}>
              {form.name || 'Your Institution'}
            </div>
            <div style={{ color:'rgba(255,255,255,.6)', fontSize:12, marginTop:3 }}>
              Faculty Excellence Platform
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <span style={{ background:form.branding.accent, color:'white',
                             padding:'5px 14px', borderRadius:16,
                             fontSize:12, fontWeight:700 }}>Dashboard</span>
              <span style={{ background:form.branding.gold, color:form.branding.primary,
                             padding:'5px 14px', borderRadius:16,
                             fontSize:12, fontWeight:700 }}>My IDP</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
          <Button onClick={save} disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </Button>
        </div>
      </SettingsCard>
    </div>
  )
}

// ── 2. Framework Settings ─────────────────────────────────────────────────────

function FrameworkSettings({ institution }) {
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState('')

  useEffect(() => { loadDomains() }, [])

  async function loadDomains() {
    const { data } = await supabase
      .from('domains')
      .select('*')
      .eq('institution_id', institution.id)
      .order('domain_number')
    setDomains(data || [])
    setLoading(false)
  }

  async function saveDomain(domain) {
    setSaving(true)
    const { error } = await supabase.from('domains').update({
      name:       domain.name,
      descriptor: domain.descriptor,
      core_focus: domain.core_focus,
    }).eq('id', domain.id)
    setSaving(false)
    setEditing(null)
    if (!error) {
      setSaved('Domain saved.')
      setTimeout(() => setSaved(''), 3000)
    } else {
      console.error('Domain save failed:', error)
    }
    loadDomains()
  }

  return (
    <div>
      <SaveBanner message={saved} />
      <SettingsCard title="Competency Framework Editor"
        subtitle="Edit domain names, descriptors, and core focus areas">
        {loading ? (
          <div style={{ color:'#64748B' }}>Loading domains...</div>
        ) : domains.map(d => (
          <div key={d.id} style={{ marginBottom:10 }}>
            {editing === d.id ? (
              <div style={{ padding:16, borderRadius:10,
                            border:'2px solid #0D2B5E', background:'#EEF2FF' }}>
                <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:12,
                              alignItems:'start', marginBottom:12 }}>
                  <div style={{ background:'#0D2B5E', color:'white', borderRadius:8,
                                padding:'4px 12px', fontWeight:800, fontSize:13,
                                alignSelf:'center' }}>
                    D{d.domain_number}
                  </div>
                  <Inp value={d.name}
                    onChange={e => setDomains(ds => ds.map(x =>
                      x.id === d.id ? { ...x, name:e.target.value } : x))}
                    placeholder="Domain name" />
                </div>
                <Field label="Descriptor">
                  <Inp value={d.descriptor || ''}
                    onChange={e => setDomains(ds => ds.map(x =>
                      x.id === d.id ? { ...x, descriptor:e.target.value } : x))}
                    placeholder="What this domain covers" />
                </Field>
                <Field label="Core Focus">
                  <Inp value={d.core_focus || ''}
                    onChange={e => setDomains(ds => ds.map(x =>
                      x.id === d.id ? { ...x, core_focus:e.target.value } : x))}
                    placeholder="Key areas e.g. Pedagogy · Active Learning" />
                </Field>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => saveDomain(d)} disabled={saving}
                    style={{ padding:'8px 20px', borderRadius:8, border:'none',
                             background:'#0D2B5E', color:'white',
                             fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    {saving ? 'Saving...' : '💾 Save'}
                  </button>
                  <button onClick={() => { setEditing(null); loadDomains() }}
                    style={{ padding:'8px 20px', borderRadius:8,
                             border:'1.5px solid #DDE3EF', background:'white',
                             color:'#64748B', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:12,
                            padding:'12px 16px', borderRadius:10,
                            border:'1px solid #DDE3EF', background:'white' }}>
                <span style={{ background:'#1A7B8C', color:'white', borderRadius:8,
                               padding:'4px 12px', fontWeight:800, fontSize:13,
                               flexShrink:0 }}>
                  D{d.domain_number}
                </span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#0D2B5E', fontSize:14 }}>
                    {d.name}
                  </div>
                  <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>
                    {d.core_focus}
                  </div>
                </div>
                <button onClick={() => setEditing(d.id)}
                  style={{ padding:'6px 14px', borderRadius:8,
                           border:'1.5px solid #DDE3EF', background:'white',
                           color:'#0D2B5E', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                  ✏️ Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </SettingsCard>
    </div>
  )
}

// ── 3. Instrument Settings ────────────────────────────────────────────────────

function InstrumentSettings({ institution }) {
  const [domains, setDomains] = useState([])
  const [items,   setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState('')
  const [openDomain, setOpenDomain] = useState(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: d } = await supabase.from('domains').select('*')
      .eq('institution_id', institution.id).order('domain_number')
    const { data: i } = await supabase.from('items').select('*')
      .eq('institution_id', institution.id).order('item_number')
    setDomains(d || [])
    setItems(i || [])
    setLoading(false)
  }

  async function saveItem(item) {
    setSaving(true)
    const { error } = await supabase.from('items').update({ item_text: item.item_text }).eq('id', item.id)
    setSaving(false)
    setEditing(null)
    if (!error) {
      setSaved('Item saved.')
      setTimeout(() => setSaved(''), 3000)
    } else {
      console.error('Item save failed:', error)
    }
    loadData()
  }

  return (
    <div>
      <SaveBanner message={saved} />
      <SettingsCard title="Instrument Editor"
        subtitle="Edit assessment item wording. Click a domain to expand its items.">
        {loading ? (
          <div style={{ color:'#64748B' }}>Loading...</div>
        ) : domains.map(d => {
          const domainItems = items.filter(i => i.domain_id === d.id)
          const isOpen = openDomain === d.id
          return (
            <div key={d.id} style={{ marginBottom:8 }}>
              <button onClick={() => setOpenDomain(isOpen ? null : d.id)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:12,
                  padding:'12px 16px', borderRadius:isOpen ? '10px 10px 0 0' : 10,
                  border:'1px solid #DDE3EF',
                  background: isOpen ? '#0D2B5E' : 'white',
                  cursor:'pointer', textAlign:'left'
                }}>
                <span style={{ background: isOpen ? '#1A7B8C' : '#EEF2FF',
                               color: isOpen ? 'white' : '#0D2B5E',
                               borderRadius:8, padding:'3px 10px',
                               fontWeight:800, fontSize:13, flexShrink:0 }}>
                  D{d.domain_number}
                </span>
                <span style={{ flex:1, fontWeight:700, fontSize:14,
                               color: isOpen ? 'white' : '#0D2B5E' }}>
                  {d.name}
                </span>
                <span style={{ color: isOpen ? 'rgba(255,255,255,.6)' : '#64748B',
                               fontSize:12 }}>
                  {domainItems.length} items {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {isOpen && (
                <div style={{ border:'1px solid #DDE3EF', borderTop:'none',
                              borderRadius:'0 0 10px 10px', overflow:'hidden' }}>
                  {domainItems.map((item, idx) => (
                    <div key={item.id} style={{
                      padding:'12px 16px',
                      borderBottom: idx < domainItems.length-1 ? '1px solid #F1F5F9' : 'none',
                      background:'white'
                    }}>
                      {editing === item.id ? (
                        <div>
                          <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                            <span style={{ background:'#EEF2FF', color:'#0D2B5E',
                                           borderRadius:6, padding:'3px 8px',
                                           fontWeight:700, fontSize:12, flexShrink:0,
                                           marginTop:10 }}>
                              {idx+1}
                            </span>
                            <textarea
                              value={item.item_text}
                              onChange={e => setItems(is => is.map(x =>
                                x.id === item.id ? { ...x, item_text:e.target.value } : x))}
                              rows={3}
                              style={{ flex:1, padding:'8px 12px', borderRadius:8,
                                       border:'1px solid #DDE3EF', fontSize:13,
                                       outline:'none', resize:'vertical', boxSizing:'border-box' }}
                            />
                          </div>
                          <div style={{ display:'flex', gap:8, marginTop:8, marginLeft:36 }}>
                            <button onClick={() => saveItem(item)} disabled={saving}
                              style={{ padding:'6px 16px', borderRadius:8, border:'none',
                                       background:'#0D2B5E', color:'white',
                                       fontWeight:700, fontSize:12, cursor:'pointer' }}>
                              {saving ? 'Saving...' : '💾 Save'}
                            </button>
                            <button onClick={() => { setEditing(null); loadData() }}
                              style={{ padding:'6px 16px', borderRadius:8,
                                       border:'1.5px solid #DDE3EF', background:'white',
                                       color:'#64748B', fontWeight:600,
                                       fontSize:12, cursor:'pointer' }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ background:'#F2F5FA', color:'#64748B',
                                         borderRadius:6, padding:'2px 8px',
                                         fontWeight:700, fontSize:12, flexShrink:0 }}>
                            {idx+1}
                          </span>
                          <span style={{ flex:1, fontSize:13, color:'#0D2B5E' }}>
                            {item.item_text}
                          </span>
                          <button onClick={() => setEditing(item.id)}
                            style={{ padding:'5px 12px', borderRadius:8,
                                     border:'1.5px solid #DDE3EF', background:'white',
                                     color:'#0D2B5E', fontWeight:600,
                                     fontSize:12, cursor:'pointer', flexShrink:0 }}>
                            ✏️ Edit
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </SettingsCard>
    </div>
  )
}

// ── 4. Pathways Settings ──────────────────────────────────────────────────────

function PathwaysSettings({ institution }) {
  const [pathways, setPathways] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState('')
  const [newPathway, setNewPathway] = useState(false)
  const [newForm, setNewForm] = useState({
    name:'', description:'', cpd_credits:20, duration_hours:20,
    certificate_title:'', career_tracks:[], domain_codes:[], is_flagship:false,
    requires_approval:false
  })

  useEffect(() => { loadPathways() }, [])

  async function loadPathways() {
    const { data } = await supabase.from('pathways').select('*')
      .eq('institution_id', institution.id).order('code')
    setPathways(data || [])
    setLoading(false)
  }

  async function savePathway(p) {
    setSaving(true)
    const { error } = await supabase.from('pathways').update({
      name:              p.name,
      description:       p.description,
      cpd_credits:       p.cpd_credits,
      duration_hours:    p.duration_hours,
      certificate_title: p.certificate_title,
      is_flagship:       p.is_flagship,
      requires_approval: p.requires_approval,
    }).eq('id', p.id)
    setSaving(false)
    setEditing(null)
    if (!error) {
      setSaved('Pathway saved.')
      setTimeout(() => setSaved(''), 3000)
    } else {
      console.error('Pathway save failed:', error)
    }
    loadPathways()
  }

  async function addPathway() {
    if (!newForm.name) return
    setSaving(true)
    const code = 'P' + (pathways.length + 1)
    const { error } = await supabase.from('pathways').insert({
      institution_id:    institution.id,
      code,
      name:              newForm.name,
      description:       newForm.description,
      cpd_credits:       newForm.cpd_credits,
      duration_hours:    newForm.duration_hours,
      certificate_title: newForm.certificate_title,
      career_tracks:     newForm.career_tracks,
      domain_codes:      newForm.domain_codes,
      is_flagship:       newForm.is_flagship,
      requires_approval: newForm.requires_approval,
      is_active:         true,
    })
    setSaving(false)
    setNewPathway(false)
    if (!error) {
      setSaved('New pathway added.')
      setTimeout(() => setSaved(''), 3000)
    } else {
      console.error('Add pathway failed:', error)
    }
    loadPathways()
  }

  const icons = { P1:'👩‍🏫', P2:'✅', P3:'📖', P4:'📚', P5:'🏛️', P6:'🎯', P7:'🤖' }

  return (
    <div>
      <SaveBanner message={saved} />
      <SettingsCard title="Pathways Manager"
        subtitle="Configure your faculty development learning pathways">

        <button onClick={() => setNewPathway(!newPathway)}
          style={{ marginBottom:16, padding:'9px 20px', borderRadius:8, border:'none',
                   background: newPathway ? '#64748B' : '#0D2B5E',
                   color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          {newPathway ? 'Cancel' : '+ Add New Pathway'}
        </button>

        {newPathway && (
          <div style={{ padding:16, borderRadius:10, border:'2px solid #1A7B8C',
                        background:'#EDF6F8', marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0D2B5E', marginBottom:14 }}>
              New Pathway
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <Field label="Pathway Name">
                  <Inp value={newForm.name}
                    onChange={e => setNewForm(f=>({...f,name:e.target.value}))}
                    placeholder="e.g. Teaching Excellence" />
                </Field>
              </div>
              <Field label="CPD Credits">
                <Inp type="number" value={newForm.cpd_credits}
                  onChange={e => setNewForm(f=>({...f,cpd_credits:parseInt(e.target.value)}))} />
              </Field>
              <Field label="Duration (hours)">
                <Inp type="number" value={newForm.duration_hours}
                  onChange={e => setNewForm(f=>({...f,duration_hours:parseInt(e.target.value)}))} />
              </Field>
              <div style={{ gridColumn:'1/-1' }}>
                <Field label="Certificate Title">
                  <Inp value={newForm.certificate_title}
                    onChange={e => setNewForm(f=>({...f,certificate_title:e.target.value}))}
                    placeholder="e.g. Certificate in Teaching Excellence" />
                </Field>
              </div>
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:6,
                            fontSize:13, color:'#0D2B5E', cursor:'pointer', marginBottom:14 }}>
              <input type="checkbox" checked={newForm.requires_approval}
                onChange={e => setNewForm(f=>({...f,requires_approval:e.target.checked}))} />
              Requires approval to enrol
            </label>
            <button onClick={addPathway} disabled={saving}
              style={{ padding:'9px 22px', borderRadius:8, border:'none',
                       background:'#0D2B5E', color:'white',
                       fontWeight:700, fontSize:13, cursor:'pointer' }}>
              {saving ? 'Adding...' : '+ Add Pathway'}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ color:'#64748B' }}>Loading pathways...</div>
        ) : pathways.map(p => (
          <div key={p.id} style={{ marginBottom:10 }}>
            {editing === p.id ? (
              <div style={{ padding:16, borderRadius:10,
                            border:'2px solid #0D2B5E', background:'#EEF2FF' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div style={{ gridColumn:'1/-1' }}>
                    <Field label="Pathway Name">
                      <Inp value={p.name}
                        onChange={e => setPathways(ps => ps.map(x =>
                          x.id === p.id ? {...x, name:e.target.value} : x))} />
                    </Field>
                  </div>
                  <Field label="CPD Credits">
                    <Inp type="number" value={p.cpd_credits}
                      onChange={e => setPathways(ps => ps.map(x =>
                        x.id === p.id ? {...x, cpd_credits:parseInt(e.target.value)} : x))} />
                  </Field>
                  <Field label="Duration (hours)">
                    <Inp type="number" value={p.duration_hours}
                      onChange={e => setPathways(ps => ps.map(x =>
                        x.id === p.id ? {...x, duration_hours:parseInt(e.target.value)} : x))} />
                  </Field>
                  <div style={{ gridColumn:'1/-1' }}>
                    <Field label="Certificate Title">
                      <Inp value={p.certificate_title || ''}
                        onChange={e => setPathways(ps => ps.map(x =>
                          x.id === p.id ? {...x, certificate_title:e.target.value} : x))} />
                    </Field>
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <Field label="Description">
                      <Inp value={p.description || ''}
                        onChange={e => setPathways(ps => ps.map(x =>
                          x.id === p.id ? {...x, description:e.target.value} : x))} />
                    </Field>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <button onClick={() => savePathway(p)} disabled={saving}
                    style={{ padding:'8px 20px', borderRadius:8, border:'none',
                             background:'#0D2B5E', color:'white',
                             fontWeight:700, fontSize:13, cursor:'pointer' }}>
                    {saving ? 'Saving...' : '💾 Save'}
                  </button>
                  <button onClick={() => { setEditing(null); loadPathways() }}
                    style={{ padding:'8px 20px', borderRadius:8,
                             border:'1.5px solid #DDE3EF', background:'white',
                             color:'#64748B', fontWeight:600, fontSize:13, cursor:'pointer' }}>
                    Cancel
                  </button>
                  <label style={{ display:'flex', alignItems:'center', gap:6,
                                  fontSize:13, color:'#0D2B5E', cursor:'pointer' }}>
                    <input type="checkbox" checked={p.is_flagship}
                      onChange={e => setPathways(ps => ps.map(x =>
                        x.id === p.id ? {...x, is_flagship:e.target.checked} : x))} />
                    Flagship pathway
                  </label>
                  <label style={{ display:'flex', alignItems:'center', gap:6,
                                  fontSize:13, color:'#0D2B5E', cursor:'pointer',
                                  marginLeft:'auto' }}>
                    <input type="checkbox" checked={p.requires_approval}
                      onChange={e => setPathways(ps => ps.map(x =>
                        x.id === p.id ? {...x, requires_approval:e.target.checked} : x))} />
                    Requires approval
                  </label>
                </div>
              </div>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:12,
                            padding:'12px 16px', borderRadius:10,
                            border:'1px solid #DDE3EF', background:'white' }}>
                <span style={{ fontSize:20 }}>{icons[p.code] || '🎓'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#0D2B5E', fontSize:14,
                                display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    {p.name}
                    {p.is_flagship && (
                      <span style={{ background:'#C9982A', color:'#0D2B5E',
                                     fontSize:11, padding:'2px 8px',
                                     borderRadius:8, fontWeight:700 }}>⭐ Flagship</span>
                    )}
                    {p.requires_approval && (
                      <span style={{ background:'#FEF9C3', color:'#92400E',
                                     fontSize:11, padding:'2px 8px',
                                     borderRadius:8, fontWeight:700 }}>🔒 Approval required</span>
                    )}
                  </div>
                  <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>
                    {p.cpd_credits} CPD credits · {p.duration_hours} hours
                    {p.certificate_title ? ` · ${p.certificate_title}` : ''}
                  </div>
                </div>
                <button onClick={() => setEditing(p.id)}
                  style={{ padding:'6px 14px', borderRadius:8,
                           border:'1.5px solid #DDE3EF', background:'white',
                           color:'#0D2B5E', fontWeight:600, fontSize:12, cursor:'pointer' }}>
                  ✏️ Edit
                </button>
              </div>
            )}
          </div>
        ))}
      </SettingsCard>
    </div>
  )
}

// ── 5. Career Tracks ──────────────────────────────────────────────────────────

function TracksSettings({ institution, onUpdate }) {
  const defaultTracks = [
    { id:'A', name:'New Faculty',    years:'Year 1',    color:'#1A7B8C', desc:'Mandatory induction and foundation development' },
    { id:'B', name:'Early Career',   years:'Years 2–5', color:'#0D2B5E', desc:'Advanced practice and research introduction' },
    { id:'C', name:'Mid Career',     years:'Years 6–12',color:'#C9982A', desc:'Leadership and scholarship development' },
    { id:'D', name:'Senior Faculty', years:'Years 12+', color:'#6B1A6B', desc:'Institutional leadership and mentorship' },
  ]
  const [tracks, setTracks] = useState(institution?.career_tracks || defaultTracks)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState('')

  function updateTrack(id, field, value) {
    setTracks(ts => ts.map(t => t.id === id ? { ...t, [field]:value } : t))
  }

  async function save() {
    setSaving(true)
    const { data, error } = await supabase
      .from('institutions')
      .update({ career_tracks: tracks })
      .eq('id', institution.id)
      .select()
      .single()
    setSaving(false)
    if (!error) {
      setSaved('Career tracks saved.')
      if (onUpdate) onUpdate(data)
      setTimeout(() => setSaved(''), 3000)
    } else {
      console.error('Career tracks save failed:', error)
    }
  }

  return (
    <div>
      <SaveBanner message={saved} />
      <SettingsCard title="Career Development Tracks"
        subtitle="Configure the four career-stage development tracks"
        onSave={save} saving={saving}>
        {tracks.map(t => (
          <div key={t.id} style={{ display:'grid', gap:10, padding:'16px 0',
                                    borderBottom:'1px solid #F1F5F9',
                                    gridTemplateColumns:'auto 1fr 1fr' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                          background:t.color, color:'white', borderRadius:8,
                          width:40, height:40, fontWeight:800, fontSize:16,
                          alignSelf:'center' }}>
              {t.id}
            </div>
            <Field label="Track Name">
              <Inp value={t.name}
                onChange={e => updateTrack(t.id, 'name', e.target.value)} />
            </Field>
            <Field label="Year Range">
              <Inp value={t.years}
                onChange={e => updateTrack(t.id, 'years', e.target.value)} />
            </Field>
            <div style={{ gridColumn:'2/-1' }}>
              <Field label="Description">
                <Inp value={t.desc}
                  onChange={e => updateTrack(t.id, 'desc', e.target.value)} />
              </Field>
            </div>
          </div>
        ))}
      </SettingsCard>
    </div>
  )
}

// ── 6. Roles Settings ─────────────────────────────────────────────────────────

function RolesSettings() {
  const roles = [
    { id:'faculty',          label:'Faculty Member',   icon:'👤', permissions:['own_assessment','own_idp','own_portfolio','pathways','mentoring'] },
    { id:'supervisor',       label:'Supervisor',       icon:'👁️', permissions:['own_assessment','own_idp','own_portfolio','pathways','mentoring','supervised_faculty'] },
    { id:'chair',            label:'Department Chair', icon:'🏢', permissions:['own_assessment','own_idp','own_portfolio','pathways','mentoring','supervised_faculty','dept_analytics'] },
    { id:'quality_director', label:'Quality Director', icon:'✅', permissions:['own_assessment','own_idp','own_portfolio','pathways','mentoring','supervised_faculty','dept_analytics','inst_analytics','accreditation_reports'] },
    { id:'program_director', label:'Program Director', icon:'📋', permissions:['own_assessment','own_idp','own_portfolio','pathways','mentoring','supervised_faculty','dept_analytics','pathway_management'] },
    { id:'dean',             label:'Dean',             icon:'🎓', permissions:['own_assessment','own_idp','own_portfolio','pathways','mentoring','supervised_faculty','dept_analytics','inst_analytics','college_analytics'] },
    { id:'admin',            label:'Administrator',    icon:'⚙️', permissions:['everything'] },
  ]

  const allPermissions = [
    { id:'own_assessment',       label:'Complete own assessment'    },
    { id:'own_idp',              label:'View own IDP'               },
    { id:'own_portfolio',        label:'Manage own portfolio'       },
    { id:'pathways',             label:'Browse and enrol pathways'  },
    { id:'mentoring',            label:'Access mentoring'           },
    { id:'supervised_faculty',   label:'View supervised faculty'    },
    { id:'dept_analytics',       label:'Department analytics'       },
    { id:'inst_analytics',       label:'Institutional analytics'    },
    { id:'college_analytics',    label:'College analytics'          },
    { id:'pathway_management',   label:'Manage pathways'            },
    { id:'accreditation_reports','label':'Accreditation reports'    },
    { id:'everything',           label:'Full platform access'       },
  ]

  return (
    <SettingsCard title="Roles & Permissions"
      subtitle="View permissions assigned to each role. Custom role editing coming soon.">
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign:'left', padding:'10px 12px', fontSize:11,
                           fontWeight:700, color:'#64748B', textTransform:'uppercase',
                           borderBottom:'2px solid #DDE3EF', background:'#F2F5FA' }}>
                Permission
              </th>
              {roles.map(r => (
                <th key={r.id} style={{ padding:'10px 8px', fontSize:11,
                                        fontWeight:700, color:'#0D2B5E',
                                        textTransform:'uppercase',
                                        borderBottom:'2px solid #DDE3EF',
                                        background:'#F2F5FA', textAlign:'center',
                                        whiteSpace:'nowrap' }}>
                  {r.icon} {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allPermissions.map((perm, i) => (
              <tr key={perm.id}>
                <td style={{ padding:'10px 12px', fontSize:13, color:'#0D2B5E',
                             fontWeight:500, borderBottom:'1px solid #F1F5F9',
                             background: i%2===0 ? 'white' : '#F8FAFC' }}>
                  {perm.label}
                </td>
                {roles.map(r => {
                  const has = r.permissions.includes('everything') || r.permissions.includes(perm.id)
                  return (
                    <td key={r.id} style={{ padding:'10px 8px', textAlign:'center',
                                            borderBottom:'1px solid #F1F5F9',
                                            background: i%2===0 ? 'white' : '#F8FAFC' }}>
                      {has
                        ? <span style={{ color:'#16A34A', fontSize:16 }}>✓</span>
                        : <span style={{ color:'#DDE3EF', fontSize:16 }}>–</span>
                      }
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SettingsCard>
  )
}

// ── 7. Communication Settings ─────────────────────────────────────────────────

function CommsSettings({ institution, onUpdate }) {
  const defaults = {
    emailjs_service_id:  'service_mws5m4r',
    emailjs_template_id: 'template_csvofcd',
    emailjs_public_key:  'RRDUQ9_AeAaPDWd9K',
    sender_name:         institution?.name || 'Faculty Excellence Platform',
    reply_to:            '',
    auto_welcome:        true,
    auto_assessment_reminder: true,
    auto_idp_approved:   true,
    auto_workshop_reminder: true,
    auto_certificate:    true,
    auto_overdue_alert:  true,
  }
  const [form, setForm] = useState(institution?.comms_settings || defaults)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]:v }))

  async function save() {
    setSaving(true)
    const { data, error } = await supabase
      .from('institutions')
      .update({ comms_settings: form })
      .eq('id', institution.id)
      .select()
      .single()
    setSaving(false)
    if (!error) {
      setSaved('Communication settings saved.')
      if (onUpdate) onUpdate(data)
      setTimeout(() => setSaved(''), 3000)
    } else {
      console.error('Comms settings save failed:', error)
    }
  }

  return (
    <div>
      <SaveBanner message={saved} />
      <SettingsCard title="Email Service Configuration"
        subtitle="EmailJS settings for sending platform emails"
        onSave={save} saving={saving}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <Field label="EmailJS Service ID">
            <Inp value={form.emailjs_service_id}
              onChange={e => set('emailjs_service_id', e.target.value)} />
          </Field>
          <Field label="EmailJS Template ID">
            <Inp value={form.emailjs_template_id}
              onChange={e => set('emailjs_template_id', e.target.value)} />
          </Field>
          <Field label="EmailJS Public Key">
            <Inp value={form.emailjs_public_key}
              onChange={e => set('emailjs_public_key', e.target.value)} />
          </Field>
          <Field label="Sender Name">
            <Inp value={form.sender_name}
              onChange={e => set('sender_name', e.target.value)} />
          </Field>
          <div style={{ gridColumn:'1/-1' }}>
            <Field label="Reply-To Email">
              <Inp type="email" value={form.reply_to}
                onChange={e => set('reply_to', e.target.value)}
                placeholder="e.g. fdp@your-institution.edu" />
            </Field>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Automatic Email Triggers"
        subtitle="Toggle which emails send automatically without admin intervention"
        onSave={save} saving={saving}>
        {[
          { key:'auto_welcome',             label:'Welcome email on registration',         desc:'Sent when a new user completes registration'             },
          { key:'auto_assessment_reminder', label:'Assessment reminder (7 days before due)',desc:'Sent automatically 7 days before assessment deadline'   },
          { key:'auto_idp_approved',        label:'IDP approval notification',             desc:'Sent when supervisor approves faculty IDP'               },
          { key:'auto_workshop_reminder',   label:'Workshop reminder (24 hours before)',   desc:'Sent the day before a registered workshop'               },
          { key:'auto_certificate',         label:'Certificate issued notification',        desc:'Sent automatically when a certificate is generated'      },
          { key:'auto_overdue_alert',       label:'Assessment overdue alert',              desc:'Sent when faculty miss the assessment deadline'           },
        ].map(item => (
          <Toggle key={item.key} label={item.label} desc={item.desc}
            value={form[item.key]} onChange={v => set(item.key, v)} />
        ))}
      </SettingsCard>
    </div>
  )
}

// ── 8. Policy Settings ────────────────────────────────────────────────────────

function PolicySettings({ institution, onUpdate }) {
  const [policy, setPolicy] = useState({
    appraisal_linked:              institution?.policy?.appraisal_linked              ?? false,
    idp_approval_required:         institution?.policy?.idp_approval_required         ?? true,
    reassessment_cycle_years:      institution?.policy?.reassessment_cycle_years      ?? 2,
    portfolio_ownership:           institution?.policy?.portfolio_ownership           ?? 'faculty',
    mandatory_participation:       institution?.policy?.mandatory_participation       ?? true,
    minimum_cpd_credits_per_year:  institution?.policy?.minimum_cpd_credits_per_year ?? 20,
  })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState('')

  const set = (k, v) => setPolicy(p => ({ ...p, [k]:v }))

  async function save() {
    setSaving(true)
    const { data, error } = await supabase
      .from('institutions')
      .update({ policy })
      .eq('id', institution.id)
      .select()
      .single()
    setSaving(false)
    if (!error) {
      setSaved('Policy settings saved.')
      if (onUpdate) onUpdate(data)
      setTimeout(() => setSaved(''), 3000)
    } else {
      console.error('Policy save failed:', error)
    }
  }

  return (
    <div>
      <SaveBanner message={saved} />
      <SettingsCard title="Assessment Policy"
        subtitle="Control how the needs assessment is administered"
        onSave={save} saving={saving}>
        <Toggle
          label="Decouple from Performance Appraisal" recommended
          desc="Faculty are explicitly informed their responses will not be linked to appraisal or promotion. Strongly recommended for response validity."
          value={!policy.appraisal_linked}
          onChange={v => set('appraisal_linked', !v)} />
        <Toggle
          label="Require Supervisor IDP Approval"
          desc="Supervisor must review and approve each faculty IDP before it is finalised."
          value={policy.idp_approval_required}
          onChange={v => set('idp_approval_required', v)} />
        <Toggle
          label="Mandatory Participation"
          desc="All eligible faculty must complete the annual needs assessment."
          value={policy.mandatory_participation}
          onChange={v => set('mandatory_participation', v)} />

        <div style={{ marginTop:16 }}>
          <Field label="Reassessment Cycle"
            hint="How often should faculty complete the needs assessment?">
            <div style={{ display:'flex', gap:10 }}>
              {[1,2,3].map(y => (
                <button key={y} onClick={() => set('reassessment_cycle_years', y)}
                  style={{
                    padding:'9px 20px', borderRadius:8, fontWeight:700,
                    fontSize:13, cursor:'pointer',
                    border:`2px solid ${policy.reassessment_cycle_years===y ? '#0D2B5E' : '#DDE3EF'}`,
                    background: policy.reassessment_cycle_years===y ? '#0D2B5E' : 'white',
                    color: policy.reassessment_cycle_years===y ? 'white' : '#64748B'
                  }}>
                  {y===1 ? 'Annual' : y===2 ? 'Biennial ★' : 'Every 3 Years'}
                </button>
              ))}
            </div>
          </Field>
        </div>
      </SettingsCard>

      <SettingsCard title="Portfolio Policy"
        subtitle="Control portfolio ownership and access"
        onSave={save} saving={saving}>
        <Toggle
          label="Faculty-Owned Portfolio" recommended
          desc="Faculty own their portfolio and can export it at any time. The institution has view and export access while employed."
          value={policy.portfolio_ownership === 'faculty'}
          onChange={v => set('portfolio_ownership', v ? 'faculty' : 'institution')} />

        <div style={{ marginTop:16 }}>
          <Field label="Minimum CPD Credits per Year"
            hint="Minimum annual CPD credits faculty should earn through development activities.">
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <input type="range" min={0} max={60} step={5}
                value={policy.minimum_cpd_credits_per_year}
                onChange={e => set('minimum_cpd_credits_per_year', parseInt(e.target.value))}
                style={{ flex:1 }} />
              <span style={{ background:'#0D2B5E', color:'white', padding:'6px 14px',
                             borderRadius:8, fontWeight:700, fontSize:16,
                             minWidth:50, textAlign:'center' }}>
                {policy.minimum_cpd_credits_per_year}
              </span>
            </div>
          </Field>
        </div>
      </SettingsCard>
    </div>
  )
}

// ── 9. User Management ────────────────────────────────────────────────────────

function UsersSettings({ institution }) {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(null)
  const [saved,   setSaved]   = useState('')

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('institution_id', institution.id)
      .order('full_name')
    setUsers(data || [])
    setLoading(false)
  }

  async function updateRole(userId, role) {
    setSaving(userId)
    const { error } = await supabase.from('users').update({ role }).eq('id', userId)
    setSaving(null)
    if (!error) {
      setSaved('Role updated.')
      setTimeout(() => setSaved(''), 3000)
    } else {
      console.error('Role update failed:', error)
    }
    loadUsers()
  }

  const roleColors = {
    admin:            { bg:'#EEF2FF', color:'#0D2B5E' },
    dean:             { bg:'#FEF9C3', color:'#92400E' },
    quality_director: { bg:'#DCFCE7', color:'#15803D' },
    program_director: { bg:'#CCFBF1', color:'#0F766E' },
    chair:            { bg:'#FFEDD5', color:'#EA580C' },
    supervisor:       { bg:'#F3E8FF', color:'#7C3AED' },
    faculty:          { bg:'#F1F5F9', color:'#475569' },
  }

  return (
    <div>
      <SaveBanner message={saved} />
      <SettingsCard title="User Management"
        subtitle="View all users and manage their roles">
        {loading ? (
          <div style={{ color:'#64748B' }}>Loading users...</div>
        ) : users.length === 0 ? (
          <div style={{ color:'#64748B', textAlign:'center', padding:20 }}>
            No users yet. Invite faculty to get started.
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'#F2F5FA' }}>
                  {['Name','Email','Rank','Department','Role',''].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'10px 12px',
                                         fontSize:11, fontWeight:700, color:'#64748B',
                                         textTransform:'uppercase',
                                         borderBottom:'2px solid #DDE3EF' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const rc = roleColors[u.role] || roleColors.faculty
                  const init = u.full_name?.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() || 'U'
                  return (
                    <tr key={u.id} style={{ background: i%2===0 ? 'white' : '#F8FAFC' }}>
                      <td style={{ padding:'10px 12px', borderBottom:'1px solid #F1F5F9' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:'50%',
                                        background:'#0D2B5E', color:'white',
                                        fontSize:11, fontWeight:700,
                                        display:'flex', alignItems:'center',
                                        justifyContent:'center', flexShrink:0 }}>
                            {init}
                          </div>
                          <span style={{ fontWeight:600, color:'#0D2B5E', fontSize:13 }}>
                            {u.full_name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding:'10px 12px', fontSize:12, color:'#64748B',
                                   borderBottom:'1px solid #F1F5F9' }}>
                        {u.email}
                      </td>
                      <td style={{ padding:'10px 12px', fontSize:12, color:'#64748B',
                                   borderBottom:'1px solid #F1F5F9' }}>
                        {u.rank || '—'}
                      </td>
                      <td style={{ padding:'10px 12px', fontSize:12, color:'#64748B',
                                   borderBottom:'1px solid #F1F5F9' }}>
                        {u.department || '—'}
                      </td>
                      <td style={{ padding:'10px 12px', borderBottom:'1px solid #F1F5F9' }}>
                        <select
                          value={u.role}
                          onChange={e => updateRole(u.id, e.target.value)}
                          disabled={saving === u.id}
                          style={{
                            padding:'5px 10px', borderRadius:8, border:'none',
                            fontSize:12, fontWeight:700, cursor:'pointer',
                            background: rc.bg, color: rc.color,
                            outline:'none'
                          }}>
                          {['faculty','supervisor','chair','quality_director',
                            'program_director','dean','admin'].map(r => (
                            <option key={r} value={r}>
                              {r.replace(/_/g,' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding:'10px 12px', borderBottom:'1px solid #F1F5F9' }}>
                        {saving === u.id && (
                          <span style={{ fontSize:12, color:'#64748B' }}>Saving...</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SettingsCard>
    </div>
  )
}