import { useState } from 'react'
import emailjs from '@emailjs/browser'

const SERVICE_ID  = 'service_mws5m4r'
const TEMPLATE_ID = 'template_csvofcd'
const PUBLIC_KEY  = 'RRDUQ9_AeAaPDWd9K'

// Email template definitions
const EMAIL_TEMPLATES = [
  {
    id: 'invite',
    category: 'Onboarding',
    name: 'Invitation to Join Platform',
    icon: '✉️',
    trigger: 'manual',
    subject: 'You are invited to join {{institution_name}} Faculty Excellence Platform',
    body: `Dear {{to_name}},

You have been invited to join the Faculty Excellence Platform at {{institution_name}} by {{from_name}}.

Your role: {{role}}
Department: {{department}}
College: {{college}}

Click the link below to accept your invitation and create your password:

{{invite_link}}

This invitation expires in 7 days.`,
  },
  {
    id: 'welcome',
    category: 'Onboarding',
    name: 'Welcome & Registration Confirmation',
    icon: '👋',
    trigger: 'automatic',
    subject: 'Welcome to {{institution_name}} Faculty Excellence Platform',
    body: `Dear {{to_name}},

Welcome to the Faculty Excellence Platform at {{institution_name}}.

Your account has been successfully created.

Role: {{role}}
Department: {{department}}

You can log in at: {{platform_url}}

We look forward to supporting your professional development journey.`,
  },
  {
    id: 'assessment_open',
    category: 'Assessment',
    name: 'Assessment Cycle Opened',
    icon: '📋',
    trigger: 'manual',
    subject: 'Your annual needs assessment is now open — {{institution_name}}',
    body: `Dear {{to_name}},

Your annual faculty competency needs assessment is now open.

Please complete your assessment by {{due_date}}.

The assessment takes approximately 20 minutes and covers 9 competency domains.

Your responses are completely confidential and are not linked to your performance appraisal.

Log in to complete your assessment: {{platform_url}}`,
  },
  {
    id: 'assessment_reminder',
    category: 'Assessment',
    name: 'Assessment Reminder',
    icon: '⏰',
    trigger: 'automatic',
    subject: 'Reminder: Your assessment is due in 7 days — {{institution_name}}',
    body: `Dear {{to_name}},

This is a reminder that your faculty competency needs assessment is due in 7 days.

Due date: {{due_date}}

Please log in to complete your assessment: {{platform_url}}`,
  },
  {
    id: 'assessment_complete',
    category: 'Assessment',
    name: 'Assessment Completed',
    icon: '✅',
    trigger: 'automatic',
    subject: 'Assessment complete — your IDP is ready',
    body: `Dear {{to_name}},

Thank you for completing your faculty competency needs assessment.

Your Individual Development Plan (IDP) has been generated and is ready to view.

Log in to view your IDP and recommended pathways: {{platform_url}}`,
  },
  {
    id: 'idp_approved',
    category: 'Assessment',
    name: 'IDP Approved by Supervisor',
    icon: '🗺️',
    trigger: 'automatic',
    subject: 'Your IDP has been approved — {{institution_name}}',
    body: `Dear {{to_name}},

Your Individual Development Plan has been reviewed and approved by your supervisor.

You can now enrol in your recommended learning pathways.

Log in to view your approved IDP: {{platform_url}}`,
  },
  {
    id: 'workshop_registration',
    category: 'Workshops',
    name: 'Workshop Registration Confirmation',
    icon: '📅',
    trigger: 'automatic',
    subject: 'Workshop registration confirmed — {{workshop_name}}',
    body: `Dear {{to_name}},

Your registration for the following workshop has been confirmed:

Workshop: {{workshop_name}}
Date: {{workshop_date}}
Time: {{workshop_time}}
Location: {{workshop_location}}
Facilitator: {{facilitator_name}}
CPD Credits: {{cpd_credits}}

Please add this to your calendar. If you are unable to attend, please notify us at least 48 hours in advance.`,
  },
  {
    id: 'workshop_reminder',
    category: 'Workshops',
    name: 'Workshop Reminder',
    icon: '🔔',
    trigger: 'automatic',
    subject: 'Reminder: {{workshop_name}} is tomorrow',
    body: `Dear {{to_name}},

This is a reminder that you are registered for the following workshop tomorrow:

Workshop: {{workshop_name}}
Date: {{workshop_date}}
Time: {{workshop_time}}
Location: {{workshop_location}}

We look forward to seeing you there.`,
  },
  {
    id: 'workshop_missed',
    category: 'Workshops',
    name: 'Missed Workshop Alert',
    icon: '⚠️',
    trigger: 'manual',
    subject: 'You missed a workshop session — {{workshop_name}}',
    body: `Dear {{to_name}},

Our records show that you were unable to attend the following workshop session:

Workshop: {{workshop_name}}
Date: {{workshop_date}}

This session is part of your approved Individual Development Plan.

Please contact your supervisor or the Faculty Development team to discuss rescheduling.`,
  },
  {
    id: 'certificate_issued',
    category: 'Certificates',
    name: 'Certificate Issued',
    icon: '🏆',
    trigger: 'automatic',
    subject: 'Congratulations — your certificate has been issued',
    body: `Dear {{to_name}},

Congratulations on completing {{pathway_name}}.

Your certificate has been issued:

Certificate: {{certificate_title}}
CPD Credits: {{cpd_credits}}
Date Issued: {{issue_date}}
Verification Code: {{verification_code}}

You can download your certificate and view your updated CPD record by logging into the platform: {{platform_url}}`,
  },
  {
    id: 'pathway_enrolled',
    category: 'Pathways',
    name: 'Pathway Enrolment Confirmation',
    icon: '🎓',
    trigger: 'automatic',
    subject: 'Enrolment confirmed — {{pathway_name}}',
    body: `Dear {{to_name}},

Your enrolment in the following learning pathway has been confirmed:

Pathway: {{pathway_name}}
CPD Credits: {{cpd_credits}}
Duration: {{duration_hours}} hours

Log in to view your pathway details and get started: {{platform_url}}`,
  },
  {
    id: 'assessment_overdue',
    category: 'Alerts',
    name: 'Assessment Overdue Alert',
    icon: '🚨',
    trigger: 'automatic',
    subject: 'Action required — assessment overdue',
    body: `Dear {{to_name}},

Your faculty competency needs assessment is now overdue.

Due date: {{due_date}}

Please complete your assessment as soon as possible. If you are experiencing difficulties, please contact your department chair.

Log in here: {{platform_url}}`,
  },
  {
    id: 'mentor_reminder',
    category: 'Mentoring',
    name: 'Mentor Meeting Reminder',
    icon: '🤝',
    trigger: 'automatic',
    subject: 'Mentoring session reminder — {{institution_name}}',
    body: `Dear {{to_name}},

This is a reminder that you have a mentoring session scheduled with {{mentor_name}}.

Date: {{meeting_date}}
Time: {{meeting_time}}

Please ensure your mentoring log is up to date before the session.`,
  },
]

const CATEGORIES = ['All', 'Onboarding', 'Assessment', 'Workshops', 'Certificates', 'Pathways', 'Alerts', 'Mentoring']

const TRIGGER_COLORS = {
  automatic: { bg: '#DCFCE7', color: '#15803D', label: 'Automatic' },
  manual:    { bg: '#EEF2FF', color: '#0D2B5E', label: 'Manual'    },
}

export default function CommCentre({ institution, currentUser }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [sendMode, setSendMode] = useState(false)
  const [editedTemplate, setEditedTemplate] = useState(null)
  const [sendForm, setSendForm] = useState({ to_email:'', to_name:'', extra:{} })
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  const filtered = activeCategory === 'All'
    ? EMAIL_TEMPLATES
    : EMAIL_TEMPLATES.filter(t => t.category === activeCategory)

  function selectTemplate(t) {
    setSelectedTemplate(t)
    setEditedTemplate({ ...t })
    setEditMode(false)
    setSendMode(false)
    setSendResult(null)
  }

  function previewBody(body) {
    return body
      .replace(/{{institution_name}}/g, institution?.name || 'Your Institution')
      .replace(/{{platform_url}}/g, window.location.origin)
      .replace(/{{to_name}}/g, sendForm.to_name || 'Faculty Member')
  }

  async function handleSend() {
    if (!sendForm.to_email || !sendForm.to_name) {
      setSendResult({ success: false, message: 'Please enter recipient name and email.' })
      return
    }
    setSending(true)
    setSendResult(null)

    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_email:         sendForm.to_email,
          to_name:          sendForm.to_name,
          from_name:        currentUser?.full_name || 'Faculty Excellence Platform',
          institution_name: institution?.name || 'Your Institution',
          subject:          editedTemplate?.subject || selectedTemplate?.subject,
          message:          previewBody(editedTemplate?.body || selectedTemplate?.body),
          platform_url:     window.location.origin,
          ...sendForm.extra,
        },
        PUBLIC_KEY
      )
      setSendResult({ success: true, message: `Email sent successfully to ${sendForm.to_name}.` })
      setSending(false)
    } catch (err) {
      setSendResult({ success: false, message: `Failed to send: ${err?.text || err?.message || 'Unknown error'}` })
      setSending(false)
    }
  }

  return (
    <div style={{ display:'flex', gap:20, height:'100%' }}>

      {/* ── Left panel — template list ── */}
      <div style={{ width:300, flexShrink:0 }}>

        {/* Category filters */}
        <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                      padding:12, marginBottom:12,
                      boxShadow:'0 2px 12px rgba(13,43,94,.06)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#64748B',
                        textTransform:'uppercase', letterSpacing:.5,
                        marginBottom:8 }}>
            Categories
          </div>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                display:'block', width:'100%', textAlign:'left',
                padding:'7px 10px', borderRadius:8, border:'none',
                cursor:'pointer', fontSize:13, marginBottom:2,
                fontWeight: activeCategory === cat ? 700 : 400,
                background: activeCategory === cat ? '#EEF2FF' : 'transparent',
                color: activeCategory === cat ? '#0D2B5E' : '#64748B',
              }}>
              {cat}
              <span style={{ float:'right', fontSize:11, color:'#94A3B8' }}>
                {cat === 'All'
                  ? EMAIL_TEMPLATES.length
                  : EMAIL_TEMPLATES.filter(t => t.category === cat).length}
              </span>
            </button>
          ))}
        </div>

        {/* Template list */}
        <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                      boxShadow:'0 2px 12px rgba(13,43,94,.06)', overflow:'hidden' }}>
          {filtered.map((t, i) => {
            const tc = TRIGGER_COLORS[t.trigger]
            return (
              <div key={t.id} onClick={() => selectTemplate(t)}
                style={{
                  padding:'12px 14px', cursor:'pointer',
                  borderBottom: i < filtered.length-1 ? '1px solid #F1F5F9' : 'none',
                  background: selectedTemplate?.id === t.id ? '#EEF2FF' : 'white',
                  borderLeft: selectedTemplate?.id === t.id ? '3px solid #0D2B5E' : '3px solid transparent',
                  transition:'all .15s'
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:16 }}>{t.icon}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#0D2B5E',
                                 flex:1, lineHeight:1.3 }}>
                    {t.name}
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:10, color:'#94A3B8' }}>{t.category}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:'1px 7px',
                                 borderRadius:8, background:tc.bg, color:tc.color }}>
                    {tc.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right panel — template detail ── */}
      <div style={{ flex:1 }}>
        {!selectedTemplate ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                        height:'60vh', flexDirection:'column', gap:12,
                        color:'#64748B', textAlign:'center' }}>
            <div style={{ fontSize:48 }}>✉️</div>
            <div style={{ fontSize:16, fontWeight:700, color:'#0D2B5E' }}>
              Select a template
            </div>
            <div style={{ fontSize:13 }}>
              Choose an email template from the list to preview, edit, or send.
            </div>
          </div>
        ) : (
          <div>
            {/* Template header */}
            <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                          padding:'16px 20px', marginBottom:14,
                          boxShadow:'0 2px 12px rgba(13,43,94,.06)' }}>
              <div style={{ display:'flex', alignItems:'center',
                            justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:24 }}>{selectedTemplate.icon}</span>
                  <div>
                    <div style={{ fontSize:16, fontWeight:700, color:'#0D2B5E' }}>
                      {selectedTemplate.name}
                    </div>
                    <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>
                      {selectedTemplate.category} ·{' '}
                      <span style={{
                        fontWeight:700,
                        color: TRIGGER_COLORS[selectedTemplate.trigger].color
                      }}>
                        {TRIGGER_COLORS[selectedTemplate.trigger].label}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => { setEditMode(!editMode); setSendMode(false) }}
                    style={{
                      padding:'8px 16px', borderRadius:8, cursor:'pointer',
                      border:'1.5px solid #DDE3EF',
                      background: editMode ? '#EEF2FF' : 'white',
                      color:'#0D2B5E', fontWeight:600, fontSize:13
                    }}>
                    ✏️ {editMode ? 'Stop Editing' : 'Edit Template'}
                  </button>
                  <button onClick={() => { setSendMode(!sendMode); setEditMode(false) }}
                    style={{
                      padding:'8px 16px', borderRadius:8, border:'none',
                      cursor:'pointer',
                      background: sendMode ? '#1A7B8C' : '#0D2B5E',
                      color:'white', fontWeight:600, fontSize:13
                    }}>
                    📨 {sendMode ? 'Cancel' : 'Send Email'}
                  </button>
                </div>
              </div>

              {/* Subject line */}
              <div style={{ background:'#F2F5FA', borderRadius:8, padding:'10px 14px' }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#64748B',
                               textTransform:'uppercase', marginRight:8 }}>Subject:</span>
                {editMode ? (
                  <input
                    value={editedTemplate.subject}
                    onChange={e => setEditedTemplate(t => ({ ...t, subject:e.target.value }))}
                    style={{ width:'80%', padding:'4px 8px', borderRadius:6,
                             border:'1px solid #DDE3EF', fontSize:13, outline:'none' }}
                  />
                ) : (
                  <span style={{ fontSize:13, color:'#0D2B5E' }}>
                    {editedTemplate?.subject}
                  </span>
                )}
              </div>
            </div>

            {/* Send form */}
            {sendMode && (
              <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                            padding:'16px 20px', marginBottom:14,
                            boxShadow:'0 2px 12px rgba(13,43,94,.06)' }}>
                <div style={{ fontSize:14, fontWeight:700, color:'#0D2B5E', marginBottom:14 }}>
                  Send to
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12,
                              marginBottom:14 }}>
                  <div>
                    <label style={{ display:'block', fontWeight:600, color:'#0D2B5E',
                                    fontSize:13, marginBottom:6 }}>Recipient Name *</label>
                    <input
                      value={sendForm.to_name}
                      onChange={e => setSendForm(f => ({ ...f, to_name:e.target.value }))}
                      placeholder="e.g. Dr. Sara Ali"
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                               border:'1px solid #DDE3EF', fontSize:13,
                               outline:'none', boxSizing:'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display:'block', fontWeight:600, color:'#0D2B5E',
                                    fontSize:13, marginBottom:6 }}>Recipient Email *</label>
                    <input
                      type="email"
                      value={sendForm.to_email}
                      onChange={e => setSendForm(f => ({ ...f, to_email:e.target.value }))}
                      placeholder="e.g. sara.ali@gmu.ac.ae"
                      style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                               border:'1px solid #DDE3EF', fontSize:13,
                               outline:'none', boxSizing:'border-box' }}
                    />
                  </div>
                </div>

                {sendResult && (
                  <div style={{
                    padding:'10px 14px', borderRadius:8, fontSize:13,
                    marginBottom:12,
                    background: sendResult.success ? '#DCFCE7' : '#FEE2E2',
                    color: sendResult.success ? '#15803D' : '#DC2626'
                  }}>
                    {sendResult.success ? '✓ ' : '✕ '}{sendResult.message}
                  </div>
                )}

                <button onClick={handleSend} disabled={sending}
                  style={{
                    padding:'10px 28px', borderRadius:8, border:'none',
                    background: sending ? '#94A3B8' : '#0D2B5E',
                    color:'white', fontWeight:700, fontSize:14,
                    cursor: sending ? 'not-allowed' : 'pointer'
                  }}>
                  {sending ? 'Sending...' : '📨 Send Now'}
                </button>
              </div>
            )}

            {/* Email preview */}
            <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                          boxShadow:'0 2px 12px rgba(13,43,94,.06)', overflow:'hidden' }}>

              {/* Email header preview */}
              <div style={{
                background: institution?.branding?.primary || '#0D2B5E',
                padding:'20px 24px'
              }}>
                <div style={{
                  fontSize:16, fontWeight:700,
                  color: institution?.branding?.gold || '#C9982A'
                }}>
                  {institution?.name || 'Faculty Excellence Platform'}
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginTop:3 }}>
                  Faculty Excellence Platform
                </div>
              </div>

              {/* Email body */}
              <div style={{ padding:24 }}>
                {editMode ? (
                  <textarea
                    value={editedTemplate.body}
                    onChange={e => setEditedTemplate(t => ({ ...t, body:e.target.value }))}
                    rows={16}
                    style={{ width:'100%', padding:12, borderRadius:8,
                             border:'1px solid #DDE3EF', fontSize:13,
                             fontFamily:'monospace', outline:'none',
                             boxSizing:'border-box', resize:'vertical' }}
                  />
                ) : (
                  <pre style={{ fontSize:13, color:'#1A1A2E', lineHeight:1.8,
                                whiteSpace:'pre-wrap', fontFamily:'Arial, sans-serif',
                                margin:0 }}>
                    {previewBody(editedTemplate?.body || selectedTemplate?.body)}
                  </pre>
                )}
              </div>

              {/* Email footer */}
              <div style={{
                background:'#F2F5FA', padding:'14px 24px',
                borderTop:'1px solid #DDE3EF',
                fontSize:11, color:'#94A3B8', textAlign:'center'
              }}>
                © 2026 Faculty Excellence Platform · {institution?.name} ·
                Competency-driven. Evidence-informed. Built for HPE.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}