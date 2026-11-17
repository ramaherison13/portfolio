import { createClient } from '@supabase/supabase-js'

// Client anonyme sans cookies : permet le cache (ISR) de la page publique.
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
