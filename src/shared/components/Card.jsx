// shared/components/Card.jsx
// One card implementation, used everywhere. The gloss header is opt-in via
// the `header` prop — plain cards (e.g. item rows inside Assess) render flat,
// per the design system's rule that gradient appears in exactly two places
// system-wide (card headers and primary buttons).

export function Card({ children, hoverable = true, style = {} }) {
  return (
    <div
      style={{
        background: 'var(--surface-card)',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(var(--shadow-color),0.04), 0 6px 16px rgba(var(--shadow-color),0.06)',
        transition: `transform ${hoverable ? 'var(--dur-panel)' : '0s'} var(--ease), box-shadow var(--dur-panel) var(--ease), background var(--dur-page) var(--ease), border-color var(--dur-page) var(--ease)`,
        ...style,
      }}
      onMouseEnter={hoverable ? (e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(var(--shadow-color),0.06), 0 16px 32px rgba(var(--shadow-color),0.12)'
      } : undefined}
      onMouseLeave={hoverable ? (e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(var(--shadow-color),0.04), 0 6px 16px rgba(var(--shadow-color),0.06)'
      } : undefined}
    >
      {children}
    </div>
  )
}

export function CardHeader({ eyebrow, title, sub, right }) {
  return (
    <div style={{
      padding: '20px 22px 18px',
      position: 'relative',
      color: '#fff',
      background: 'linear-gradient(135deg, var(--gloss-start) 0%, var(--gloss-mid) 55%, var(--gloss-end) 100%)',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(120deg, rgba(255,255,255,.16) 0%, rgba(255,255,255,0) 40%)',
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
        <div>
          {eyebrow && <p style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', opacity: .75, margin: '0 0 6px' }}>{eyebrow}</p>}
          <p style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{title}</p>
          {sub && <p style={{ fontSize: 13, opacity: .8, margin: '4px 0 0' }}>{sub}</p>}
        </div>
        {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
      </div>
    </div>
  )
}

export function CardBody({ children, style = {} }) {
  return <div style={{ padding: '18px 22px 22px', ...style }}>{children}</div>
}
