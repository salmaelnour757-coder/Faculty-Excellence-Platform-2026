import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'

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

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'center', marginBottom:16 }}>
        <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0',
                      borderRadius:10, padding:'10px 16px', fontSize:13,
                      color:'#15803D', flex:1, marginRight:16 }}>
          ✓ Your portfolio is <strong>faculty-owned</strong>.
          You can export it at any time.
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding:'10px 20px', borderRadius:8, border:'none',
          background:'#0D2B5E', color:'white',
          fontWeight:700, fontSize:13, cursor:'pointer'
        }}>
          + Add Evidence
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                      padding:20, marginBottom:16,
                      boxShadow:'0 2px 12px rgba(13,43,94,.06)' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#0D2B5E', marginBottom:16 }}>
            Add Evidence Item
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
            <div>
              <label style={{ display:'block', fontWeight:600, color:'#0D2B5E',
                              fontSize:13, marginBottom:6 }}>Title *</label>
              <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
                placeholder="e.g. Certificate in Teaching Excellence"
                style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                         border:'1px solid #DDE3EF', fontSize:13,
                         outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontWeight:600, color:'#0D2B5E',
                              fontSize:13, marginBottom:6 }}>Evidence Type</label>
              <select value={form.evidence_type}
                onChange={e => setForm(f=>({...f,evidence_type:e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                         border:'1px solid #DDE3EF', fontSize:13, background:'white',
                         outline:'none', boxSizing:'border-box' }}>
                {Object.keys(typeIcons).map(t => (
                  <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontWeight:600, color:'#0D2B5E',
                              fontSize:13, marginBottom:6 }}>Date</label>
              <input type="date" value={form.date_of_evidence}
                onChange={e => setForm(f=>({...f,date_of_evidence:e.target.value}))}
                style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                         border:'1px solid #DDE3EF', fontSize:13,
                         outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <label style={{ display:'block', fontWeight:600, color:'#0D2B5E',
                              fontSize:13, marginBottom:6 }}>Description</label>
              <input value={form.description}
                onChange={e => setForm(f=>({...f,description:e.target.value}))}
                placeholder="Brief description"
                style={{ width:'100%', padding:'9px 12px', borderRadius:8,
                         border:'1px solid #DDE3EF', fontSize:13,
                         outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={addItem} style={{
              padding:'9px 22px', borderRadius:8, border:'none',
              background:'#0D2B5E', color:'white',
              fontWeight:700, fontSize:13, cursor:'pointer'
            }}>Save Evidence</button>
            <button onClick={() => setShowForm(false)} style={{
              padding:'9px 22px', borderRadius:8,
              border:'1.5px solid #DDE3EF', background:'white',
              color:'#64748B', fontWeight:600, fontSize:13, cursor:'pointer'
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
                    gap:14, marginBottom:16 }}>
        {[
          { label:'Evidence Items', value: items.length, color:'#1A7B8C' },
          { label:'Certificates',
            value: items.filter(i=>i.evidence_type==='certificate').length,
            color:'#C9982A' },
          { label:'Publications',
            value: items.filter(i=>i.evidence_type==='publication').length,
            color:'#0D2B5E' },
        ].map(s => (
          <div key={s.label} style={{ background:'white', borderRadius:10,
                                      padding:'16px 20px', border:'1px solid #DDE3EF',
                                      borderLeft:`4px solid ${s.color}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:'#64748B',
                          textTransform:'uppercase', letterSpacing:.4 }}>{s.label}</div>
            <div style={{ fontSize:26, fontWeight:800, color:'#0D2B5E',
                          marginTop:4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Items list */}
      <div style={{ background:'white', borderRadius:10, border:'1px solid #DDE3EF',
                    boxShadow:'0 2px 12px rgba(13,43,94,.06)' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #DDE3EF' }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#0D2B5E' }}>
            Evidence Items
          </div>
        </div>
        {loading ? (
          <div style={{ padding:20, color:'#64748B', fontSize:13 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ padding:40, textAlign:'center', color:'#64748B' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📂</div>
            <div style={{ fontWeight:700, color:'#0D2B5E', marginBottom:6 }}>
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
            borderBottom: i < items.length-1 ? '1px solid #F1F5F9' : 'none'
          }}>
            <div style={{ width:36, height:36, borderRadius:8, background:'#F2F5FA',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:16, flexShrink:0 }}>
              {typeIcons[item.evidence_type] || '📎'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, color:'#0D2B5E', fontSize:13 }}>
                {item.title}
              </div>
              <div style={{ fontSize:12, color:'#64748B', marginTop:2 }}>
                {item.evidence_type?.replace(/_/g,' ')}
                {item.description ? ` · ${item.description}` : ''}
              </div>
            </div>
            <div style={{ fontSize:12, color:'#64748B', whiteSpace:'nowrap' }}>
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
      </div>
    </div>
  )
}