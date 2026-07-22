// infrastructure/integration/jotform.js
// Thin client wrapper around the check-evaluation edge function. The actual
// Jotform API key lives server-side only (see
// supabase/functions/check-evaluation) — this file never touches it.

import { supabase } from '../../shared/lib/supabase'

export async function checkEvaluationSubmitted({ formId, email }) {
  if (!formId) return { submitted: false, error: 'Workshop has no jotform_form_id set' }

  const { data, error } = await supabase.functions.invoke('check-evaluation', {
    body: { formId, email },
  })

  if (error) return { submitted: false, error: error.message }
  return { submitted: !!data?.submitted, error: data?.error || null }
}
