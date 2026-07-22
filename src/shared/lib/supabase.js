// shared/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Set these in your .env file — ' +
    'the old repo had these hardcoded as fallback defaults in source, which got committed ' +
    'to a public GitHub repo. Removed here; add a .env.local (gitignored) with real values.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
