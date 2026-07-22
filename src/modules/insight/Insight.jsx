// modules/insight/Insight.jsx
// New module — no old-repo equivalent. Implements the three-tier heat map
// design from docs/02-module-specs/insight.md:
//   Institution scope: colleges x domains, aggregate only
//   College scope:      departments x domains, aggregate only, small
//                        departments suppressed (n < MIN_N) to avoid
//                        revealing an individual by inference
//   Department scope:   individual faculty x items — named, since this is
//                        exactly what a department head is meant to see
//
// Cell color encodes gap SEVERITY (how far below target), not performance.
// Metrics cards are strictly one per core-loop module (Assess/Develop/
// Evidence) — no institutional-BI creep, per the module spec.
//
// Role gating: not yet implemented at the data layer — currently reachable
// only via the admin view (Shell's admin-analytics slot). Tightening this
// to true Provost/Dean/Chair-scoped access is tracked as follow-up work
// once the app's role model is built out further.

import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { Card, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'

const MIN_N = 2 // departments/colleges below this faculty count get suppressed in aggregate views

function severityColor(tni) {
  if (tni == null) return 'var(--border)'
  if (tni >= 13) return '#DC2626'
  if (tni >= 9)  return '#EA580C'
  if (tni >= 5)  return '#CA8A04'
  if (tni > 0)   return '#16A34A'
  return 'var(--border)'
}

export default function Insight({ institution }) {
  const [domains, setDomains] = useState([])
  const [items, setItems] = useState([])
  const [colleges, setColleges] = useState([])
  const [departments, setDepartments] = useState([])
  const [faculty, setFaculty] = useState([])
  const [responses, setResponses] = useState([])
  const [enrolments, setEnrolments] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  const [scope, setScope] = useState('institution') // institution | college | department
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [selectedDepartment, setSelectedDepartment] = useState(null)

  useEffect(() => { if (institution?.id) loadData() }, [institution?.id])

  async function loadData() {
    setLoading(true)
    const [d, it, c, dep, fac, resp, enr, cert] = await Promise.all([
      supabase.from('domains').select('*').eq('institution_id', institution.id).order('domain_number'),
      supabase.from('items').select('*').eq('institution_id', institution.id),
      supabase.from('colleges').select('*').eq('institution_id', institution.id).order('name'),
      supabase.from('departments').select('*').order('name'),
      supabase.from('users').select('id, full_name, college_id, department_id').eq('institution_id', institution.id),
      supabase.from('responses').select('user_id, item_id, tni').eq('institution_id', institution.id),
      supabase.from('enrolments').select('user_id, status, progress_percent').eq('institution_id', institution.id),
      supabase.from('certificates').select('user_id').eq('institution_id', institution.id),
    ])
    setDomains(d.data || [])
    setItems(it.data || [])
    setColleges(c.data || [])
    setDepartments(dep.data || [])
    setFaculty(fac.data || [])
    setResponses(resp.data || [])
    setEnrolments(enr.data || [])
    setCertificates(cert.data || [])
    setLoading(false)
  }

  const itemToDomain = {}
  items.forEach(i => { itemToDomain[i.id] = i.domain_id })

  const userById = {}
  faculty.forEach(f => { userById[f.id] = f })

  // avgTni(facultyIds, domainId) — the one calculation every scope reuses
  function avgTni(facultyIds, domainId) {
    const relevant = responses.filter(r =>
      facultyIds.includes(r.user_id) && itemToDomain[r.item_id] === domainId
    )
    if (relevant.length === 0) return null
    return Math.round(relevant.reduce((s, r) => s + (r.tni || 0), 0) / relevant.length * 10) / 10
  }

  function facultyInCollege(collegeId) {
    return faculty.filter(f => f.college_id === collegeId).map(f => f.id)
  }
  function facultyInDepartment(deptId) {
    return faculty.filter(f => f.department_id === deptId).map(f => f.id)
  }

  // ── Metrics cards — one per core-loop module ──────────────────────────
  const assessedCount = new Set(responses.map(r => r.user_id)).size
  const assessPct = faculty.length > 0 ? Math.round((assessedCount / faculty.length) * 100) : 0

  const completedEnrolments = enrolments.filter(e => e.status === 'completed' || e.progress_percent >= 100).length
  const completionPct = enrolments.length > 0 ? Math.round((completedEnrolments / enrolments.length) * 100) : 0

  const facultyWithCert = new Set(certificates.map(c => c.user_id)).size
  const evidencePct = faculty.length > 0 ? Math.round((facultyWithCert / faculty.length) * 100) : 0

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading institutional overview...</div>

  const cellStyle = (color) => ({
    width: 44, height: 32, borderRadius: 6, background: `color-mix(in srgb, ${color} 22%, transparent)`,
    border: `1px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color,
  })

  function HeatMap({ rows, getLabel, getCount, onRowClick }) {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 10px', fontSize: 11, color: 'var(--text-muted)' }}></th>
              {domains.map(d => (
                <th key={d.id} style={{ padding: '6px 8px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
                  D{d.domain_number}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const count = getCount ? getCount(row) : null
              const suppressed = count !== null && count < MIN_N
              return (
                <tr key={row.id}>
                  <td
                    onClick={() => onRowClick && !suppressed && onRowClick(row)}
                    style={{
                      padding: '6px 10px', fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                      cursor: onRowClick && !suppressed ? 'pointer' : 'default',
                      textDecoration: onRowClick && !suppressed ? 'underline' : 'none',
                    }}>
                    {getLabel(row)} {count !== null && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({count})</span>}
                  </td>
                  {domains.map(d => {
                    if (suppressed) {
                      return <td key={d.id} style={{ padding: 4, textAlign: 'center' }}>
                        <div style={{ ...cellStyle('var(--text-muted)'), background: 'var(--border)' }}>—</div>
                      </td>
                    }
                    const tni = avgTni(row.facultyIds, d.id)
                    return (
                      <td key={d.id} style={{ padding: 4, textAlign: 'center' }}>
                        <div style={cellStyle(severityColor(tni))}>{tni ?? '–'}</div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  // Row builders per scope
  const collegeRows = colleges.map(c => ({ id: c.id, name: c.name, facultyIds: facultyInCollege(c.id) }))
  const departmentRows = departments
    .filter(d => d.college_id === selectedCollege?.id)
    .map(d => ({ id: d.id, name: d.name, facultyIds: facultyInDepartment(d.id) }))
  const facultyRows = faculty
    .filter(f => f.department_id === selectedDepartment?.id)
    .map(f => ({ id: f.id, name: f.full_name, facultyIds: [f.id] }))

  return (
    <div>
      {/* Metrics — one per core-loop module */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
        <Card hoverable={false}>
          <CardBody>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.03em' }}>Assess</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{assessPct}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>faculty assessed this cycle</div>
          </CardBody>
        </Card>
        <Card hoverable={false}>
          <CardBody>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.03em' }}>Develop</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{completionPct}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>pathway completion rate</div>
          </CardBody>
        </Card>
        <Card hoverable={false}>
          <CardBody>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.03em' }}>Evidence</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>{evidencePct}%</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>faculty with a compiled record</div>
          </CardBody>
        </Card>
      </div>

      {/* Heat map */}
      <Card hoverable={false}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Training need severity
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              {scope === 'institution' && 'Colleges × competency domains'}
              {scope === 'college' && `${selectedCollege?.name} — departments × competency domains`}
              {scope === 'department' && `${selectedDepartment?.name} — individual faculty × competency domains`}
            </div>
          </div>
          {scope !== 'institution' && (
            <Button variant="ghost" style={{ border: 'none' }} onClick={() => {
              if (scope === 'department') { setScope('college'); setSelectedDepartment(null) }
              else { setScope('institution'); setSelectedCollege(null) }
            }}>
              ← Back
            </Button>
          )}
        </div>
        <CardBody>
          {scope === 'institution' && (
            <HeatMap rows={collegeRows} getLabel={r => r.name} getCount={r => r.facultyIds.length}
              onRowClick={row => { setSelectedCollege(colleges.find(c => c.id === row.id)); setScope('college') }} />
          )}
          {scope === 'college' && (
            <HeatMap rows={departmentRows} getLabel={r => r.name} getCount={r => r.facultyIds.length}
              onRowClick={row => { setSelectedDepartment(departments.find(d => d.id === row.id)); setScope('department') }} />
          )}
          {scope === 'department' && (
            <HeatMap rows={facultyRows} getLabel={r => r.name} />
          )}
          {((scope === 'institution' && collegeRows.length === 0) ||
            (scope === 'college' && departmentRows.length === 0) ||
            (scope === 'department' && facultyRows.length === 0)) && (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              No data at this level yet — set up colleges/departments and assign faculty in Configuration.
            </div>
          )}
        </CardBody>
      </Card>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
        Color encodes training-need severity (how far below target), not performance. Rows with fewer than {MIN_N} faculty are suppressed to avoid identifying an individual by inference.
      </div>
    </div>
  )
}
