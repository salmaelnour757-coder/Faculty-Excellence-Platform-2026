// modules/evidence/Evidence.jsx
// New module — no old-repo equivalent (the old Portfolio.jsx was a manual
// upload page; this replaces that concept entirely per the design decision
// that Evidence's artifact is an auto-generated certificate, not something
// faculty upload themselves).
//
// Certificate issuance rule (per docs/02-module-specs/evidence.md):
// attendance_confirmed (set by an admin in Develop's PathwaysAdmin) AND
// evaluation_confirmed (checked against the Quality Department's Jotform
// via infrastructure/integration/jotform.js) must both be true.
//
// This module does NOT set attendance — that's Develop's job. This module
// only checks evaluation status, and issues + compiles the certificate.

import { useState, useEffect } from 'react'
import { supabase } from '../../shared/lib/supabase'
import { checkEvaluationSubmitted } from '../../infrastructure/integration/jotform'
import { Card, CardHeader, CardBody } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'

export default function Evidence({ institution, currentUser }) {
  const [attendance, setAttendance] = useState([])
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (institution?.id && currentUser?.id) loadData()
  }, [institution?.id, currentUser?.id])

  async function loadData() {
    setLoading(true)

    const { data: attendanceData } = await supabase
      .from('workshop_attendance')
      .select('*, workshops(title, start_time, pathway_id)')
      .eq('user_id', currentUser.id)

    const { data: certData } = await supabase
      .from('certificates')
      .select('*, workshops(title, start_time), pathways(name)')
      .eq('user_id', currentUser.id)
      .order('issued_at', { ascending: false })

    setAttendance(attendanceData || [])
    setCertificates(certData || [])
    setLoading(false)
  }

  // Attendance-confirmed rows not yet certified — these are worth checking against Jotform.
  const pendingCheck = attendance.filter(a =>
    a.attendance_confirmed &&
    !certificates.some(c => c.workshop_id === a.workshop_id)
  )

  async function checkAndIssue(attendanceRecord) {
    setChecking(attendanceRecord.id)
    setMessage('')

    const { data: workshop } = await supabase
      .from('workshops')
      .select('*')
      .eq('id', attendanceRecord.workshop_id)
      .single()

    if (!workshop?.jotform_form_id) {
      setMessage('This workshop has no evaluation form linked yet — ask an admin to add its Jotform ID.')
      setChecking(null)
      return
    }

    const { submitted, error } = await checkEvaluationSubmitted({
      formId: workshop.jotform_form_id,
      email: currentUser.email,
    })

    if (error) {
      setMessage(`Could not check evaluation status: ${error}`)
      setChecking(null)
      return
    }

    if (!submitted) {
      setMessage('No evaluation submission found yet for this workshop. Submit the evaluation, then check again.')
      setChecking(null)
      return
    }

    // Both conditions met — mark evaluation_confirmed and issue the certificate.
    await supabase.from('workshop_attendance')
      .update({ evaluation_confirmed: true, evaluation_checked_at: new Date().toISOString() })
      .eq('id', attendanceRecord.id)

    const { error: certErr } = await supabase.from('certificates').insert({
      user_id: currentUser.id,
      workshop_id: attendanceRecord.workshop_id,
      pathway_id: workshop.pathway_id,
      institution_id: institution.id,
    })

    setChecking(null)
    if (!certErr) {
      setMessage('Certificate issued.')
      loadData()
    } else {
      setMessage('Evaluation confirmed, but certificate creation failed — try refreshing.')
      console.error(certErr)
    }
  }

  function printCertificate(cert) {
    const w = window.open('', '_blank')
    w.document.write(`
      <html><head><title>Certificate of Attendance</title></head>
      <body style="font-family: Arial, sans-serif; padding: 60px; text-align: center;">
        <h1 style="color:#1B2A4A;">Certificate of Attendance</h1>
        <p style="font-size:16px; margin-top:24px;">This certifies that</p>
        <h2>${currentUser.full_name || ''}</h2>
        <p style="font-size:16px;">completed</p>
        <h3>${cert.workshops?.title || 'Workshop'}</h3>
        <p style="color:#666; margin-top:24px;">
          ${institution?.name || ''} · Issued ${new Date(cert.issued_at).toLocaleDateString()}
        </p>
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  if (loading) return <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Loading your evidence record...</div>

  return (
    <div>
      {message && (
        <div style={{ background: 'var(--pill-bg)', color: 'var(--text-primary)', padding: '10px 16px',
                      borderRadius: 'var(--radius-control)', fontSize: 13, marginBottom: 16 }}>
          {message}
        </div>
      )}

      {pendingCheck.length > 0 && (
        <Card hoverable={false} style={{ marginBottom: 20 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Awaiting certificate
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
              Attendance confirmed — checking for your evaluation submission issues the certificate.
            </div>
          </div>
          <CardBody>
            {pendingCheck.map(e => (
              <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                  {e.workshops?.title || 'Workshop'}
                </div>
                <Button variant="secondary" disabled={checking === e.id} onClick={() => checkAndIssue(e)} style={{ fontSize: 12, padding: '7px 14px' }}>
                  {checking === e.id ? 'Checking...' : 'Check evaluation & issue'}
                </Button>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>Your evidence record</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
          Certificates issued automatically once attendance and evaluation are both confirmed.
        </div>
      </div>

      {certificates.length === 0 ? (
        <Card hoverable={false}>
          <CardBody style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13, padding: '32px 20px' }}>
            No certificates yet. Complete a workshop and its evaluation to earn your first one.
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {certificates.map(c => (
            <Card key={c.id}>
              <CardHeader
                eyebrow="Certificate of attendance"
                title={c.workshops?.title || 'Workshop'}
                sub={new Date(c.issued_at).toLocaleDateString()}
              />
              <CardBody>
                <Button variant="secondary" onClick={() => printCertificate(c)} style={{ width: '100%' }}>
                  Download / print
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
