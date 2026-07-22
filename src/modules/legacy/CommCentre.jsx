import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { TEMPLATE_CATEGORIES, withOverrides } from '../../shared/emailTemplates'

// Fallback EmailJS credentials, used only if the institution hasn't set its
// own in Settings > Communication yet.
const DEFAULT_SERVICE_ID  = 'service_mws5m4r'
const DEFAULT_TEMPLATE_ID = 'template_csvofcd'
const DEFAULT_PUBLIC_KEY  = 'RRDUQ9_AeAaPDWd9K'

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

  const templates = withOverrides(institution?.comms_settings?.templates)
  const filtered = activeCategory === 'All'
    ? templates
    : templates.filter(t => t.category === activeCategory)

  const serviceId  = institution?.comms_settings?.emailjs_service_id  || DEFAULT_SERVICE_ID
  const templateId = institution?.comms_settings?.emailjs_template_id || DEFAULT_TEMPLATE_ID
  const publicKey   = institution?.comms_settings?.emailjs_public_key  || DEFAULT_PUBLIC_KEY

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
        serviceId,
        templateId,
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
        publicKey
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
          {TEMPLATE_CATEGORIES.map(cat => (
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
                  ? templates.length
                  : templates.filter(t => t.category === cat).length}
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