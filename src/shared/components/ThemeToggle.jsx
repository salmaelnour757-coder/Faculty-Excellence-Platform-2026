// shared/components/ThemeToggle.jsx
// Minimal light/dark switch — icon-only, chrome supplied by the caller via
// `style` since it needs to sit comfortably on very different backgrounds
// (Auth's plain surface-page vs. Shell's brand-colored sidebar).

export function ThemeToggle({ theme, onToggle, style = {} }) {
  const isDark = theme === 'dark'
  return (
    <button
      onClick={onToggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        border: '1px solid var(--border)', background: 'var(--surface-card)',
        color: 'var(--text-primary)', fontSize: 16, cursor: 'pointer',
        transition: 'background var(--dur-panel) var(--ease), border-color var(--dur-panel) var(--ease), transform var(--dur-micro) var(--ease)',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px) rotate(-10deg)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) rotate(0deg)' }}
    >
      {isDark ? '🌙' : '☀️'}
    </button>
  )
}
