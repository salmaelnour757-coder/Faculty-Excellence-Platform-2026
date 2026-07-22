// supabase/functions/check-evaluation/index.ts
//
// Runs server-side (Supabase Edge Function / Deno), NOT in the Vite app.
// This is where the Jotform API key actually lives — as a Supabase project
// secret (JOTFORM_API_KEY), never as a VITE_-prefixed variable. If it were
// in the frontend env, it would ship inside the JS bundle to every visitor's
// browser, the same mistake we just fixed with the Supabase anon key.
//
// Deploy with:
//   supabase functions deploy check-evaluation
//   supabase secrets set JOTFORM_API_KEY=your_key_here
//
// Call from the frontend with:
//   const { data } = await supabase.functions.invoke('check-evaluation', {
//     body: { formId: workshop.jotform_form_id, email: currentUser.email }
//   })
//   // data.submitted -> boolean

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const JOTFORM_API_KEY = Deno.env.get('JOTFORM_API_KEY')
const JOTFORM_BASE = 'https://api.jotform.com'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST only' }), { status: 405 })
  }

  if (!JOTFORM_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'JOTFORM_API_KEY not configured on this function' }),
      { status: 500 }
    )
  }

  try {
    const { formId, email } = await req.json()
    if (!formId || !email) {
      return new Response(JSON.stringify({ error: 'formId and email are required' }), { status: 400 })
    }

    // 1. Find the email-type question on this form, so we know which
    //    answer field to check per submission. Cache this per-request only —
    //    for high-volume use, consider caching form->fieldId in a table
    //    instead of calling /questions on every check.
    const questionsRes = await fetch(
      `${JOTFORM_BASE}/form/${formId}/questions?apiKey=${JOTFORM_API_KEY}`
    )
    const questionsData = await questionsRes.json()

    const emailFieldEntry = Object.entries(questionsData.content || {}).find(
      ([, q]: [string, any]) => q.type === 'control_email'
    )

    if (!emailFieldEntry) {
      return new Response(
        JSON.stringify({ error: 'No email-type field found on this Jotform. Check the form structure.' }),
        { status: 422 }
      )
    }
    const emailFieldId = emailFieldEntry[0]

    // 2. Pull submissions and check if any match this faculty member's email.
    //    Jotform paginates at 1000/request by default — fine for a single
    //    workshop's evaluation form, revisit if volume grows.
    const submissionsRes = await fetch(
      `${JOTFORM_BASE}/form/${formId}/submissions?apiKey=${JOTFORM_API_KEY}&limit=1000`
    )
    const submissionsData = await submissionsRes.json()

    const submitted = (submissionsData.content || []).some((sub: any) => {
      const answer = sub.answers?.[emailFieldId]?.answer
      return typeof answer === 'string' && answer.toLowerCase() === email.toLowerCase()
    })

    return new Response(JSON.stringify({ submitted }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
