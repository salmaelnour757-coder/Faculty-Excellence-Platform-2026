// shared/components/Shell.jsx
// Ported from the old repo's Shell.jsx. Two real changes beyond restyling:
//
// 1. Routing: 'assessment' -> 'assess', and 'idp' + 'pathways' collapse into
//    one 'develop' entry, since Develop now absorbs both IDP generation and
//    pathway enrolment (previously separate, inconsistently wired — the old
//    Shell.jsx pointed 'pathways' at the older, more basic Pathways.jsx and
//    never wired in the fuller FacultyPathways.jsx at all).
//
// 2. Colors: sidebar/topbar now read from --brand-primary/--brand-accent/
//    --brand-secondary tokens instead of the old `branding` prop object, so
//    the whole chrome recolors when an institution changes its theme.
//
// NOT YET updated: 'portfolio' still points at the old Portfolio.jsx (manual
// upload) — Evidence (certificate-based) isn't built yet, so this is a
// deliberate placeholder, not an oversight. Admin-side items (Faculty
// Management, Analytics, admin Pathways) are also untouched pending their
// own ports (Insight, Connect, Configuration's admin views).

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import AdminDashboard from '../../modules/legacy/AdminDashboard'
import FacultyDashboard from '../../modules/legacy/FacultyDashboard'
import Assess from '../../modules/assess/Assess'
import Develop from '../../modules/develop/Develop'
import Portfolio from '../../modules/legacy/Portfolio'
import InviteFaculty from '../../modules/legacy/InviteFaculty'
import Settings from '../../modules/legacy/Settings'

export default function Shell({ currentUser, institution, onInstitutionUpdate }) {
  const [screen, setScreen] = useState('admin-dashboard')
  const [isAdmin, setIsAdmin] = useState(true)

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  const adminNav = [
    { id: 'admin-dashboard', label: 'Dashboard' },
    { id: 'admin-faculty',   label: 'Faculty' },
    { id: 'admin-invite',    label: 'Invite faculty' },
    { id: 'admin-analytics', label: 'Insight' },
    { id: 'admin-pathways',  label: 'Pathways admin' },
    { id: 'admin-settings',  label: 'Settings' },
  ]

  const facultyNav = [
    { id: 'faculty-dashboard', label: 'My dashboard' },
    { id: 'assess',            label: 'Assess' },
    { id: 'develop',           label: 'Develop' },
    { id: 'portfolio',         label: 'Evidence (legacy)' },
  ]

  const nav = isAdmin ? adminNav : facultyNav

  const screenMap = {
    'admin-dashboard':   <AdminDashboard institution={institution} currentUser={currentUser} />,
    'admin-faculty':      <Placeholder title="Faculty management" desc="Manage all faculty accounts, roles, and profiles." />,
    'admin-invite':       <InviteFaculty institution={institution} currentUser={currentUser}
                             onClose={() => setScreen('admin-dashboard')}
                             onInvited={() => setScreen('admin-dashboard')} />,
    'admin-analytics':    <Placeholder title="Insight" desc="Institution/college/department heat map — not yet ported." />,
    'admin-pathways':     <Placeholder title="Pathway management" desc="Configure faculty development programmes and sessions." />,
    'admin-settings':     <Settings institution={institution} currentUser={currentUser} onUpdate={onInstitutionUpdate} />,
    'faculty-dashboard':  <FacultyDashboard institution={institution} currentUser={currentUser} setScreen={setScreen} />,
    'assess':             <Assess institution={institution} currentUser={currentUser} setScreen={setScreen} />,
    'develop':            <Develop institution={institution} currentUser={currentUser} setScreen={setScreen} />,
    'portfolio':          <Portfolio institution={institution} currentUser={currentUser} />,
  }

  const currentNavItem = [...adminNav, ...facultyNav].find(n => n.id === screen)

  const initials = currentUser?.full_name
    ? currentUser.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'ME'

  const roleLabel = {
    admin: 'Administrator', dean: 'Dean', quality_director: 'Quality Director',
    program_director: 'Program Director', chair: 'Department Chair',
    supervisor: 'Supervisor', faculty: currentUser?.rank || 'Faculty',
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* Sidebar */}
      <div style={{ width: 240, flexShrink: 0, background: 'var(--brand-primary)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
            {institution?.name || 'Faculty Excellence Platform'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>
            Faculty Excellence Platform
          </div>
        </div>

        <div style={{ padding: '14px 18px 4px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.3)',
                        letterSpacing: 1, textTransform: 'uppercase' }}>
            {isAdmin ? 'Administration' : 'My development'}
          </div>
        </div>

        <div style={{ padding: '4px 10px', flex: 1, overflowY: 'auto' }}>
          {nav.map(item => (
            <button key={item.id}
              onClick={() => setScreen(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 10px', borderRadius: 'var(--radius-control)',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: 13.5, fontWeight: 500, marginBottom: 2,
                background: screen === item.id ? 'var(--brand-accent)' : 'transparent',
                color: screen === item.id ? 'white' : 'rgba(255,255,255,.65)',
                transition: 'background var(--dur-panel) var(--ease), color var(--dur-panel) var(--ease)',
              }}>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <button
            onClick={() => { setIsAdmin(!isAdmin); setScreen(isAdmin ? 'faculty-dashboard' : 'admin-dashboard') }}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-control)', marginBottom: 10,
              border: '1px solid rgba(255,255,255,.15)', background: 'transparent',
              color: 'rgba(255,255,255,.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
            {isAdmin ? 'Switch to faculty view' : 'Switch to admin view'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--brand-secondary)', color: 'var(--brand-primary)',
                          fontWeight: 700, fontSize: 13, display: 'flex',
                          alignItems: 'center', justifyContent: 'center' }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.full_name || 'User'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>
                {roleLabel[currentUser?.role] || 'Faculty'}
              </div>
            </div>
            <button onClick={handleSignOut} title="Sign out"
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 16, padding: 4 }}>
              ↩
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: 60, background: 'var(--surface-card)', borderBottom: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', padding: '0 24px', gap: 14, flexShrink: 0 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentNavItem?.label || 'Faculty Excellence Platform'}
            </div>
          </div>

          {isAdmin && screen !== 'admin-invite' && (
            <button onClick={() => setScreen('admin-invite')}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-control)', border: 'none',
                       background: 'var(--brand-primary)', color: 'white', fontWeight: 600,
                       fontSize: 13, cursor: 'pointer' }}>
              Invite faculty
            </button>
          )}

          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--surface-page)' }}>
          {screenMap[screen] || <Placeholder title={screen} desc="Coming soon." />}
        </div>
      </div>
    </div>
  )
}

function Placeholder({ title, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '60vh', flexDirection: 'column', gap: 12, textAlign: 'center' }}>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</div>
      <div style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>{desc}</div>
    </div>
  )
}
