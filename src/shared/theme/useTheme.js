// shared/theme/useTheme.js
// Drives the data-theme attribute that shared/theme/light.css and dark.css
// key off. Persists the user's choice; falls back to OS preference on first
// visit so a dark-mode system doesn't get a jarring light default.

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'fep-theme'

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))

  return [theme, toggleTheme]
}
