// shared/components/Pill.jsx
// One pill/badge implementation — status tags, tier labels, recommendation
// badges all reuse this rather than each module inventing its own.

export function Pill({ children, active = false, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 13px',
        borderRadius: 'var(--radius-pill)',
        border: 'none',
        fontSize: 12,
        fontWeight: 700,
        cursor: onClick ? 'pointer' : 'default',
        background: active ? 'var(--brand-primary)' : 'var(--pill-bg)',
        color: active ? '#fff' : 'var(--pill-text)',
        transition: 'background var(--dur-panel) var(--ease), color var(--dur-panel) var(--ease)',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
