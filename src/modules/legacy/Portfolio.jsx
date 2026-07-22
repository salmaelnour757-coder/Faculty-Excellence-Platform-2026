import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Card, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'

export default function Portfolio({ institution, currentUser }) {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title:'', evidence_type:'certificate', description:'', date_of_evidence:''
  })

  useEffect(() => {
    if (currentUser?.id) loadItems()
  }, [currentUser])

  async function loadItems() {
    setLoading(true)
    const { data } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending:false })
    setItems(data || [])
    setLoading(false)
  }

  async function addItem() {
    if (!form.title) return
    await supabase.from('portfolio_items').insert({
      user_id:        currentUser.id,
      institution_id: institution.id,
      ...form
    })
    setForm({ title:'', evidence_type:'certificate', description:'', date_of_evidence:'' })
    setShowForm(false)
    loadItems()
  }

  const typeIcons = {
    certificate:'🏆', publication:'📄', presentation:'🎤',
    peer_observation:'👁️', student_feedback:'⭐', workshop_attendance:'📅',
    reflection:'📝', project:'💡', mentoring_log:'🤝', other:'📎'
  }

  const inputStyle = {
    width:'100%', padding:'9px 12px', borderRadius:'var(--radius-control)',
    border:'1px solid var(--border)', fontSize:13, outline:'none',
    boxSizing:'border-box', background:'var(--surface-card)', color:'var(--text-primary)',
  }
  const labelStyle = { display:'block', fontWeight:600, color:'var(--text-primary)', fontSize:13, marginBottom:6 }

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:12 }}>
        <div style={{
          background:'color-mix(in srgb, #16A34A 10%, transparent)',
          border:'1px solid color-mix(in srgb, #16A34A 30%, transparent)',
          borderRadius:'var(--radius-control)', padding:'10px 16px', fontSize:13,
          color:'#15803D', flex:1, marginRight:16
        }}>
          ✓ Your portfolio is <strong>faculty-owned</strong>.
          You can export it at any time.
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          + Add Evidence
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card hoverable={false} style={{ marginBottom:16 }}>
          <CardBody>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>
              Add Evidence Item
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label style={labelStyle}>Title *</label>
                <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
                  placeholder="e.g. Certificate in Teaching Excellence"
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Evidence Type</label>
                <select value={form.evidence_type}
                  onChange={e => setForm(f=>({...f,evidence_type:e.target.value}))}
                  style={inputStyle}>
                  {Object.keys(typeIcons).map(t => (
                    <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date</label>
                <input type="date" value={form.date_of_evidence}
                  onChange={e => setForm(f=>({...f,date_of_evidence:e.target.value}))}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input value={form.description}
                  onChange={e => setForm(f=>({...f,description:e.target.value}))}
                  placeholder="Brief description"
                  style={inputStyle} />
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <Button onClick={addItem} style={{ padding:'9px 22px', fontSize:13 }}>Save Evidence</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} style={{ padding:'9px 22px', fontSize:13 }}>Cancel</Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
                    gap:14, marginBottom:16 }}>
        {[
          { label:'Evidence Items', value: items.length, color:'var(--brand-accent)' },
          { label:'Certificates',
            value: items.filter(i=>i.evidence_type==='certificate').length,
            color:'var(--brand-secondary)' },
          { label:'Publications',
            value: items.filter(i=>i.evidence_type==='publication').length,
            color:'var(--brand-primary)' },
        ].map(s => (
          <div key={s.label} style={{ background:'var(--surface-card)', borderRadius:'var(--radius-control)',
                                      padding:'16px 20px', border:'1px solid var(--border)',
                                      borderLeft:`4px solid ${s.color}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-secondary)',
                          textTransform:'uppercase', letterSpacing:.4 }}>{s.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:'var(--text-primary)',
                          marginTop:4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Items list */}
      <Card hoverable={false}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>
            Evidence Items
          </div>
        </div>
        {loading ? (
          <div style={{ padding:20, color:'var(--text-secondary)', fontSize:13 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'var(--text-secondary)' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📂</div>
            <div style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:6 }}>
              No evidence yet
            </div>
            <div style={{ fontSize:13 }}>
              Add your first evidence item to start building your portfolio.
            </div>
          </div>
        ) : items.map((item, i) => (
          <div key={item.id} style={{
            display:'flex', alignItems:'center', gap:12,
            padding:'12px 20px',
            borderBottom: i < items.length-1 ? '1px solid var(--border)' : 'none'
          }}>
            <div style={{ width:36, height:36, borderRadius:'var(--radius-control)', background:'var(--surface-page)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:16, flexShrink:0 }}>
              {typeIcons[item.evidence_type] || '📎'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:'var(--text-primary)', fontSize:13 }}>
                {item.title}
              </div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>
                {item.evidence_type?.replace(/_/g,' ')}
                {item.description ? ` · ${item.description}` : ''}
              </div>
            </div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
              {item.date_of_evidence
                ? new Date(item.date_of_evidence).toLocaleDateString('en-GB', {
                    year:'numeric', month:'short'
                  })
                : new Date(item.created_at).toLocaleDateString('en-GB', {
                    year:'numeric', month:'short'
                  })
              }
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
