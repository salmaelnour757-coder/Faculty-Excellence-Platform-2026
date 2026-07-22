// shared/components/Button.jsx
// One button implementation, both variants. Primary carries the second
// (and last) permitted gloss/gradient moment in the system.

export function Button({ children, variant = 'primary', disabled = false, onClick, style = {} }) {
  const base = {
    padding: '11px 24px',
    borderRadius: 'var(--radius-control)',
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'transform var(--dur-micro) var(--ease), box-shadow var(--dur-micro) var(--ease), background var(--dur-panel) var(--ease)',
    border: 'none',
  }

  const variants = {
    primary: {
      color: '#fff',
      background: 'linear-gradient(135deg, var(--accent-fill), var(--brand-accent))',
      boxShadow: '0 4px 14px var(--accent-shadow)',
    },
    secondary: {
      color: 'var(--brand-primary)',
      background: 'var(--surface-card)',
      border: '1.5px solid var(--border)',
    },
    ghost: {
      color: 'var(--text-secondary)',
      background: 'transparent',
      border: '1.5px solid var(--border)',
    },
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => {
        if (disabled) return
        e.currentTarget.style.transform = 'translateY(-1px)'
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 6px 18px var(--accent-shadow)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 4px 14px var(--accent-shadow)'
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(.98)' }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(-1px) scale(1)' }}
    >
      {children}
    </button>
  )
}
