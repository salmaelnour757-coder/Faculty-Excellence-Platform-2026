// infrastructure/configuration/OrgHierarchyAdmin.jsx
// New — manages the Institution -> College -> Department -> Faculty
// hierarchy that Insight's heat map depends on. Minimal by design: create
// colleges/departments, assign faculty to a department. No edit/delete UI
// yet — add if this becomes a frequent operation rather than a one-time setup.

import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Button } from '../../shared/components/Button'

export default function OrgHierarchyAdmin({ institution }) {
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [faculty, setFaculty] = useState([])
  const [newCollege, setNewCollege] = useState('')
  const [newDeptCollegeId, setNewDeptCollegeId] = useState('')
  const [newDeptName, setNewDeptName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    const { data: c } = await supabase.from('colleges').select('*').eq('institution_id', institution.id).order('name')
    const { data: d } = await supabase.from('departments').select('*, colleges(name)').order('name')
    const { data: f } = await supabase.from('users').select('id, full_name, email, college_id, department_id').eq('institution_id', institution.id).order('full_name')
    setColleges(c || [])
    setDepartments(d || [])
    setFaculty(f || [])
    setLoading(false)
  }

  async function addCollege() {
    if (!newCollege.trim()) return
    await supabase.from('colleges').insert({ institution_id: institution.id, name: newCollege.trim() })
    setNewCollege('')
    loadAll()
  }

  async function addDepartment() {
    if (!newDeptName.trim() || !newDeptCollegeId) return
    await supabase.from('departments').insert({ college_id: newDeptCollegeId, name: newDeptName.trim() })
    setNewDeptName('')
    loadAll()
  }

  async function assignFaculty(userId, departmentId) {
    const dept = departments.find(d => d.id === departmentId)
    await supabase.from('users').update({
      department_id: departmentId || null,
      college_id: dept?.college_id || null,
    }).eq('id', userId)
    loadAll()
  }

  const inputStyle = { padding: '9px 12px', borderRadius: 'var(--radius-control)', border: '1px solid var(--border)', background: 'var(--surface-card)', color: 'var(--text-primary)' }

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading organization structure...</div>

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>Organization structure</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
        Colleges and departments here are what Insight's heat map groups by. Set this up once.
      </div>

      <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Add a college</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newCollege} onChange={e => setNewCollege(e.target.value)} placeholder="e.g. College of Health Sciences" style={{ ...inputStyle, flex: 1 }} />
            <Button onClick={addCollege}>Add</Button>
          </div>
          <div style={{ marginTop: 12 }}>
            {colleges.map(c => (
              <div key={c.id} style={{ fontSize: 13, color: 'var(--text-primary)', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>{c.name}</div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Add a department</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select value={newDeptCollegeId} onChange={e => setNewDeptCollegeId(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
              <option value="">Select college...</option>
              {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="Department name" style={{ ...inputStyle, flex: 1 }} />
            <Button onClick={addDepartment}>Add</Button>
          </div>
          <div style={{ marginTop: 12 }}>
            {departments.map(d => (
              <div key={d.id} style={{ fontSize: 13, color: 'var(--text-primary)', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                {d.name} <span style={{ color: 'var(--text-muted)' }}>({d.colleges?.name})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Assign faculty to departments</div>
      {faculty.map(f => (
        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{f.full_name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.email}</div>
          </div>
          <select value={f.department_id || ''} onChange={e => assignFaculty(f.id, e.target.value)} style={{ ...inputStyle, fontSize: 12 }}>
            <option value="">Unassigned</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      ))}
    </div>
  )
}
