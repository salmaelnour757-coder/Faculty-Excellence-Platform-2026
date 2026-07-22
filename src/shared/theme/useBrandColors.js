// shared/theme/useBrandColors.js
// Writes an institution's saved branding colors onto the root element's
// --brand-* custom properties, so every already-tokenized component (Card,
// Button, Pill, Shell, and every ported module) actually reflects that
// institution's choices instead of the shipped defaults from tokens.css.
//
// institution.branding uses the historical {primary, accent, gold} key
// names (set by Onboarding/Settings' color pickers); the token system's
// three brand vars are --brand-primary/--brand-secondary/--brand-accent,
// where --brand-secondary is the "gold/highlight" slot. Mapped here rather
// than renamed at the data layer, since that's a business-logic change
// outside a styling fix.

import { useEffect } from 'react'

export function useBrandColors(branding) {
  useEffect(() => {
    const root = document.documentElement
    if (!branding) {
      root.style.removeProperty('--brand-primary')
      root.style.removeProperty('--brand-secondary')
      root.style.removeProperty('--brand-accent')
      return
    }
    if (branding.primary) root.style.setProperty('--brand-primary', branding.primary)
    if (branding.gold)    root.style.setProperty('--brand-secondary', branding.gold)
    if (branding.accent)  root.style.setProperty('--brand-accent', branding.accent)
  }, [branding])
}
