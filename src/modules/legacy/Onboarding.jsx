import { useState } from 'react'
import { supabase } from '../../shared/lib/supabase'

const STEPS = [
  { id: 1, label: 'Institution', icon: '🏛️' },
  { id: 2, label: 'Framework',   icon: '🗂️' },
  { id: 3, label: 'Structure',   icon: '🏢' },
  { id: 4, label: 'Policy',      icon: '⚙️' },
  { id: 5, label: 'Launch',      icon: '🚀' },
]

export default function Onboarding({ session, onComplete }) {
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [data, setData]       = useState({
    name: '', short_name: '', country: 'UAE', city: '', type: 'university',
    website: '', accreditation_bodies: [],
    branding: { primary: '#0D2B5E', accent: '#1A7B8C', gold: '#C9982A' },
    full_name: '', rank: 'Associate Professor', department: '', college: '',
    career_track: 'C', years_experience: 5,
    policy: {
      appraisal_linked: false, idp_approval_required: true,
      reassessment_cycle_years: 2, portfolio_ownership: 'faculty',
      mandatory_participation: true, minimum_cpd_credits_per_year: 20
    }
  })

  const set = (key, val) => setData(prev => ({ ...prev, [key]: val }))
  const setPolicy = (key, val) => setData(prev => ({
    ...prev, policy: { ...prev.policy, [key]: val }
  }))
  const setBranding = (key, val) => setData(prev => ({
    ...prev, branding: { ...prev.branding, [key]: val }
  }))

  const accredBodies = ['CAA', 'WFME', 'QAA', 'NCAAA', 'ACGME', 'LCME', 'GMC', 'Other']
  const toggleAccred = (body) => {
    const current = data.accreditation_bodies || []
    set('accreditation_bodies', current.includes(body)
      ? current.filter(b => b !== body)
      : [...current, body])
  }

  async function handleLaunch() {
    if (!data.name || !data.full_name) {
      setError('Please fill in institution name and your full name.')
      return
    }
    setLoading(true)
    setError('')

    try {
      // Create institution
      const { data: inst, error: instErr } = await supabase
        .from('institutions')
        .insert({
          name: data.name, short_name: data.short_name,
          country: data.country, city: data.city,
          type: data.type, website: data.website,
          branding: data.branding,
          accreditation_bodies: data.accreditation_bodies,
          policy: data.policy
        })
        .select()
        .single()

      if (instErr) throw instErr

      // Create user profile
      const { data: user, error: userErr } = await supabase
        .from('users')
        .insert({
          auth_id: session.user.id,
          institution_id: inst.id,
          email: session.user.email,
          full_name: data.full_name,
          role: 'admin',
          rank: data.rank,
          department: data.department,
          college: data.college,
          career_track: data.career_track,
          years_experience: data.years_experience
        })
        .select()
        .single()

      if (userErr) throw userErr

      // Seed default domains
      const domains = [
        { n:1, code:'D1', name:'Teaching and Learning', focus:'Pedagogy · Active Learning · Clinical Teaching' },
        { n:2, code:'D2', name:'Assessment and Feedback', focus:'Blueprinting · Instrument Design · Psychometrics' },
        { n:3, code:'D3', name:'Digital and AI Competence', focus:'AI Literacy · EdTech · Learning Analytics' },
        { n:4, code:'D4', name:'Curriculum Development', focus:'OBE/CBE · Curriculum Mapping · Program Evaluation' },
        { n:5, code:'D5', name:'Research and Scholarship', focus:'HPE Research · Publications · Grants' },
        { n:6, code:'D6', name:'Clinical and Professional Practice', focus:'Clinical Competence · Professional Conduct' },
        { n:7, code:'D7', name:'Quality, Accreditation & IE', focus:'Standards · Program Review · KPIs' },
        { n:8, code:'D8', name:'Leadership and Academic Service', focus:'Governance · Strategic Planning' },
        { n:9, code:'D9', name:'Professional Values & Scholarly Citizenship', focus:'Ethics · Collegiality · Mentorship' },
      ]

      const { data: insertedDomains } = await supabase
        .from('domains')
        .insert(domains.map(d => ({
          institution_id: inst.id,
          domain_number: d.n, code: d.code,
          name: d.name, descriptor: d.focus, core_focus: d.focus
        })))
        .select()

      // Seed items for each domain
      const itemsData = [
        ['I design learner-centered educational experiences.','I apply evidence-based teaching strategies.','I support learner development through mentoring.','I utilize educational technologies effectively.'],
        ['I design assessments aligned with learning outcomes.','I select appropriate assessment methods.','I provide timely, constructive feedback.','I use assessment data to improve quality.'],
        ['I use digital technologies to support scholarship.','I critically evaluate and integrate AI tools.','I use learning analytics for decision-making.','I apply ethical principles when using AI.'],
        ['I contribute to outcome-based curriculum design.','I align outcomes, teaching, and assessment.','I participate in curriculum evaluation.','I contribute to educational innovation.'],
        ['I apply appropriate research methodologies.','I contribute to scholarly dissemination.','I critically appraise and apply evidence.','I engage in collaborative research activities.'],
        ['I maintain competence in my discipline.','I demonstrate professional conduct and ethics.','I apply patient safety principles.','I contribute to learner development clinically.'],
        ['I apply relevant accreditation standards.','I contribute to quality assurance activities.','I use institutional data and KPIs.','I contribute to program review and reporting.'],
        ['I contribute to academic leadership and service.','I demonstrate collaboration and communication.','I contribute to strategic planning.','I support colleagues through mentorship.'],
        ['I demonstrate professional values and integrity.','I foster collegiality and inclusivity.','I provide mentorship and developmental support.','I demonstrate commitment to the institution.'],
      ]

      for (let i = 0; i < insertedDomains.length; i++) {
        await supabase.from('items').insert(
          itemsData[i].map((text, j) => ({
            domain_id: insertedDomains[i].id,
            institution_id: inst.id,
            item_number: j + 1,
            item_text: text
          }))
        )
      }

      // Seed default pathways
      await supabase.from('pathways').insert([
        { institution_id: inst.id, code:'P1', name:'Teaching Excellence', domain_codes:['D1'], cpd_credits:30, duration_hours:30, career_tracks:['A','B'], certificate_title:'Certificate in Teaching Excellence', is_flagship:false },
        { institution_id: inst.id, code:'P2', name:'Assessment Excellence', domain_codes:['D2'], cpd_credits:30, duration_hours:30, career_tracks:['A','B'], certificate_title:'Certificate in Assessment Excellence', is_flagship:false },
        { institution_id: inst.id, code:'P3', name:'Curriculum Leadership', domain_codes:['D4','D7'], cpd_credits:25, duration_hours:25, career_tracks:['C'], certificate_title:'Curriculum Leadership Certificate', is_flagship:false },
        { institution_id: inst.id, code:'P4', name:'Educational Research & Scholarship', domain_codes:['D5'], cpd_credits:30, duration_hours:30, career_tracks:['B','C'], certificate_title:'Educational Scholarship Certificate', is_flagship:false },
        { institution_id: inst.id, code:'P5', name:'Quality & Accreditation Excellence', domain_codes:['D7'], cpd_credits:40, duration_hours:40, career_tracks:['B','C','D'], certificate_title:'Quality & Accreditation Professional Certificate', is_flagship:true },
        { institution_id: inst.id, code:'P6', name:'Academic Leadership Academy', domain_codes:['D8'], cpd_credits:35, duration_hours:35, career_tracks:['C','D'], certificate_title:'Educational Leadership Certificate', is_flagship:false },
        { institution_id: inst.id, code:'P7', name:'Digital & AI Academy', domain_codes:['D3'], cpd_credits:25, duration_hours:25, career_tracks:['A','B','C','D'], certificate_title:'AI-Enabled Educator Certificate', is_flagship:false },
      ])

      onComplete(inst, { ...user, institutions: inst })

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  const s = { // shared input style
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: '1px solid var(--border)', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', background: 'white'
  }

  const label = (text, required) => (
    <label style={{ display:'block', fontWeight:600, color:'var(--navy)',
                    fontSize:13, marginBottom:6 }}>
      {text} {required && <span style={{ color:'var(--red)' }}>*</span>}
    </label>
  )

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)',
                  fontFamily:'Arial,sans-serif', padding:24 }}>
      <div style={{ maxWidth:720, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:22, fontWeight:800, color:'var(--navy)' }}>
            Faculty Excellence Platform
          </div>
          <div style={{ color:'var(--muted)', marginTop:4 }}>
            Let us set up your institution — takes about 3 minutes
          </div>
        </div>

        {/* Step tabs */}
        <div style={{ display:'flex', gap:8, marginBottom:24,
                      justifyContent:'center', flexWrap:'wrap' }}>
          {STEPS.map(s => (
            <div key={s.id} style={{
              display:'flex', alignItems:'center', gap:6,
              padding:'7px 16px', borderRadius:20, fontSize:13, fontWeight:600,
              background: step === s.id ? 'var(--navy)' : s.id < step ? 'var(--teal)' : 'var(--border)',
              color: step === s.id || s.id < step ? 'white' : 'var(--muted)',
            }}>
              {s.icon} {s.label} {s.id < step && '✓'}
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background:'var(--white)', borderRadius:'var(--radius)',
                      border:'1px solid var(--border)', padding:32,
                      boxShadow:'var(--shadow)' }}>

          {/* ── Step 1: Institution ── */}
          {step === 1 && (
            <div>
              <h3 style={{ color:'var(--navy)', marginBottom:20 }}>🏛️ Institution Details</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  {label('Institution Name', true)}
                  <input style={s} value={data.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Gulf Medical University" />
                </div>
                <div>
                  {label('Short Name')}
                  <input style={s} value={data.short_name}
                    onChange={e => set('short_name', e.target.value)}
                    placeholder="e.g. GMU" />
                </div>
                <div>
                  {label('Country')}
                  <select style={s} value={data.country}
                    onChange={e => set('country', e.target.value)}>
                    {['UAE','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman','Egypt','Jordan','Pakistan','Malaysia','Other']
                      .map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  {label('City')}
                  <input style={s} value={data.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder="e.g. Ajman" />
                </div>
                <div>
                  {label('Institution Type')}
                  <select style={s} value={data.type}
                    onChange={e => set('type', e.target.value)}>
                    <option value="university">University</option>
                    <option value="medical_school">Medical School</option>
                    <option value="college">College / Institute</option>
                    <option value="hospital_based">Hospital-Based</option>
                  </select>
                </div>
                <div>
                  {label('Website')}
                  <input style={s} value={data.website}
                    onChange={e => set('website', e.target.value)}
                    placeholder="https://your-institution.edu" />
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                {label('Accreditation Bodies')}
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {accredBodies.map(b => {
                    const sel = data.accreditation_bodies.includes(b)
                    return (
                      <button key={b} onClick={() => toggleAccred(b)} style={{
                        padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer',
                        background: sel ? 'var(--teal)' : 'var(--border)',
                        color: sel ? 'white' : 'var(--muted)',
                        fontWeight: sel ? 700 : 400, fontSize:13
                      }}>{b}</button>
                    )
                  })}
                </div>
              </div>
              <div>
                {label('Brand Colours')}
                <div style={{ display:'flex', gap:16 }}>
                  {['primary','accent','gold'].map(key => (
                    <div key={key} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <input type="color" value={data.branding[key]}
                        onChange={e => setBranding(key, e.target.value)}
                        style={{ width:40, height:40, borderRadius:8, border:'1px solid var(--border)',
                                 cursor:'pointer', padding:2 }} />
                      <div>
                        <div style={{ fontSize:11, color:'var(--muted)', textTransform:'capitalize' }}>{key}</div>
                        <div style={{ fontSize:12, fontWeight:700, color:'var(--navy)' }}>{data.branding[key]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Framework ── */}
          {step === 2 && (
            <div>
              <h3 style={{ color:'var(--navy)', marginBottom:8 }}>🗂️ Competency Framework</h3>
              <p style={{ color:'var(--muted)', marginBottom:20, fontSize:13 }}>
                Your platform comes pre-loaded with the validated 9-domain HPE faculty competency framework and 36-item assessment instrument. You can customise these in Settings after launch.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {['Teaching & Learning','Assessment & Feedback','Digital & AI Competence',
                  'Curriculum Development','Research & Scholarship','Clinical & Professional Practice',
                  'Quality & Accreditation','Leadership & Service','Professional Values & Scholarly Citizenship'
                ].map((d,i) => (
                  <div key={i} style={{
                    padding:'10px 14px', borderRadius:8,
                    border:'1px solid var(--border)', background:'var(--bg)',
                    display:'flex', gap:8, alignItems:'center'
                  }}>
                    <span style={{
                      background:'var(--teal)', color:'white', borderRadius:'50%',
                      width:24, height:24, display:'flex', alignItems:'center',
                      justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0
                    }}>{i+1}</span>
                    <span style={{ fontSize:12, color:'var(--navy)', fontWeight:500 }}>{d}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:16, padding:14, background:'#EEF2FF',
                            borderRadius:8, fontSize:13, color:'var(--navy)' }}>
                ✅ <strong>36 items</strong> across 9 domains · <strong>3 scales</strong> (Importance, Competence, Priority) · Pilot reliability α = 0.958
              </div>
            </div>
          )}

          {/* ── Step 3: Your Profile ── */}
          {step === 3 && (
            <div>
              <h3 style={{ color:'var(--navy)', marginBottom:8 }}>🏢 Your Profile</h3>
              <p style={{ color:'var(--muted)', marginBottom:20, fontSize:13 }}>
                You will be the platform administrator. Add your faculty details.
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div style={{ gridColumn:'1/-1' }}>
                  {label('Full Name', true)}
                  <input style={s} value={data.full_name}
                    onChange={e => set('full_name', e.target.value)}
                    placeholder="e.g. Dr. Salma Elnour" />
                </div>
                <div>
                  {label('Academic Rank')}
                  <select style={s} value={data.rank}
                    onChange={e => set('rank', e.target.value)}>
                    {['Professor','Associate Professor','Assistant Professor','Lecturer','Clinical Faculty']
                      .map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  {label('Career Track')}
                  <select style={s} value={data.career_track}
                    onChange={e => set('career_track', e.target.value)}>
                    <option value="A">Track A — New Faculty (Year 1)</option>
                    <option value="B">Track B — Early Career (Years 2–5)</option>
                    <option value="C">Track C — Mid Career (Years 6–12)</option>
                    <option value="D">Track D — Senior Faculty (Years 12+)</option>
                  </select>
                </div>
                <div>
                  {label('Department')}
                  <input style={s} value={data.department}
                    onChange={e => set('department', e.target.value)}
                    placeholder="e.g. Medical Laboratory Sciences" />
                </div>
                <div>
                  {label('College')}
                  <input style={s} value={data.college}
                    onChange={e => set('college', e.target.value)}
                    placeholder="e.g. College of Health Sciences" />
                </div>
                <div>
                  {label('Years of Experience')}
                  <input type="number" style={s} value={data.years_experience}
                    onChange={e => set('years_experience', parseInt(e.target.value))}
                    min={0} max={50} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Policy ── */}
          {step === 4 && (
            <div>
              <h3 style={{ color:'var(--navy)', marginBottom:8 }}>⚙️ Platform Policies</h3>
              <p style={{ color:'var(--muted)', marginBottom:20, fontSize:13 }}>
                Configure how the platform operates. All can be changed in Settings after launch.
              </p>
              {[
                { key:'appraisal_linked', label:'Link to Performance Appraisal',
                  desc:'Faculty assessment responses will be linked to annual appraisal. NOT recommended — reduces response validity.' },
                { key:'idp_approval_required', label:'Require Supervisor IDP Approval',
                  desc:'Supervisor must review and approve each faculty IDP before it is finalised.' },
                { key:'mandatory_participation', label:'Mandatory Participation',
                  desc:'All eligible faculty must complete the annual needs assessment.' },
              ].map(item => (
                <div key={item.key} style={{
                  display:'flex', gap:14, alignItems:'flex-start',
                  padding:'14px 0', borderBottom:'1px solid var(--border)'
                }}>
                  <button onClick={() => setPolicy(item.key, !data.policy[item.key])}
                    style={{
                      width:46, height:26, borderRadius:13, border:'none', flexShrink:0,
                      background: data.policy[item.key] ? 'var(--teal)' : 'var(--border)',
                      cursor:'pointer', position:'relative', transition:'background .2s'
                    }}>
                    <span style={{
                      position:'absolute', top:3,
                      left: data.policy[item.key] ? 23 : 3,
                      width:20, height:20, background:'white',
                      borderRadius:'50%', transition:'left .2s'
                    }} />
                  </button>
                  <div>
                    <div style={{ fontWeight:700, color:'var(--navy)', fontSize:14 }}>{item.label}</div>
                    <div style={{ fontSize:12, color:'var(--muted)', marginTop:3 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:16 }}>
                <div style={{ fontWeight:700, color:'var(--navy)', fontSize:14, marginBottom:8 }}>
                  Portfolio Ownership
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  {['faculty','institution'].map(opt => (
                    <button key={opt} onClick={() => setPolicy('portfolio_ownership', opt)}
                      style={{
                        padding:'8px 20px', borderRadius:8, border:'none', cursor:'pointer',
                        background: data.policy.portfolio_ownership === opt ? 'var(--navy)' : 'var(--border)',
                        color: data.policy.portfolio_ownership === opt ? 'white' : 'var(--muted)',
                        fontWeight:700, fontSize:13, textTransform:'capitalize'
                      }}>
                      {opt === 'faculty' ? '👤 Faculty-owned (Recommended)' : '🏛️ Institution-owned'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 5: Launch ── */}
          {step === 5 && (
            <div>
              <h3 style={{ color:'var(--navy)', marginBottom:16 }}>🚀 Ready to Launch</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                {[
                  ['Institution', data.name || '—'],
                  ['Country', data.country],
                  ['Accreditation', data.accreditation_bodies.join(', ') || 'None'],
                  ['Framework', '9-domain HPE Faculty Competency Framework'],
                  ['Instrument', '36-item FCDNAQ (α = 0.958)'],
                  ['Portfolio Ownership', data.policy.portfolio_ownership === 'faculty' ? 'Faculty-owned' : 'Institution-owned'],
                  ['Appraisal Linked', data.policy.appraisal_linked ? 'Yes' : 'No (Recommended)'],
                  ['Your Name', data.full_name || '—'],
                  ['Your Role', 'Platform Administrator'],
                ].map(([k,v]) => (
                  <div key={k} style={{
                    display:'flex', justifyContent:'space-between',
                    padding:'10px 0', borderBottom:'1px solid var(--border)'
                  }}>
                    <span style={{ color:'var(--muted)', fontSize:13 }}>{k}</span>
                    <span style={{ fontWeight:700, color:'var(--navy)', fontSize:13 }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Preview */}
              <div style={{
                borderRadius:10, overflow:'hidden', marginBottom:20,
                border:'1px solid var(--border)'
              }}>
                <div style={{ background:data.branding.primary, padding:'16px 20px' }}>
                  <div style={{ color:data.branding.gold, fontWeight:800, fontSize:17 }}>
                    {data.name || 'Your Institution'}
                  </div>
                  <div style={{ color:'rgba(255,255,255,.6)', fontSize:12, marginTop:3 }}>
                    Faculty Excellence Platform
                  </div>
                  <div style={{ display:'flex', gap:8, marginTop:12 }}>
                    <span style={{ background:data.branding.accent, color:'white',
                                   padding:'4px 14px', borderRadius:16, fontSize:12, fontWeight:700 }}>
                      Dashboard
                    </span>
                    <span style={{ background:data.branding.gold, color:data.branding.primary,
                                   padding:'4px 14px', borderRadius:16, fontSize:12, fontWeight:700 }}>
                      My IDP
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background:'#FEE2E2', color:'#DC2626', padding:'10px 14px',
                              borderRadius:8, fontSize:13, marginBottom:16 }}>
                  {error}
                </div>
              )}

              <button onClick={handleLaunch} disabled={loading}
                style={{
                  width:'100%', padding:14, background:loading ? 'var(--muted)' : 'var(--navy)',
                  color:'white', border:'none', borderRadius:10, fontSize:16,
                  fontWeight:700, cursor:loading ? 'not-allowed' : 'pointer'
                }}>
                {loading ? '⏳ Setting up your platform...' : '🚀 Launch Faculty Excellence Platform'}
              </button>
            </div>
          )}

          {/* Navigation */}
          {step < 5 && (
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:24,
                          paddingTop:20, borderTop:'1px solid var(--border)' }}>
              <button onClick={() => setStep(s => Math.max(1,s-1))}
                disabled={step === 1}
                style={{
                  padding:'10px 24px', borderRadius:8,
                  border:'1.5px solid var(--border)', background:'white',
                  color:'var(--navy)', fontWeight:700, fontSize:14,
                  cursor: step === 1 ? 'not-allowed' : 'pointer',
                  opacity: step === 1 ? 0.4 : 1
                }}>
                ← Back
              </button>
              <button onClick={() => setStep(s => Math.min(5,s+1))}
                style={{
                  padding:'10px 24px', borderRadius:8, border:'none',
                  background:'var(--navy)', color:'white',
                  fontWeight:700, fontSize:14, cursor:'pointer'
                }}>
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}