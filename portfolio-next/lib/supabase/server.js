import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Client serveur lié à la session de l'utilisateur connecté (cookies).
export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(list) {
          try { list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        },
      },
    }
  )
}
