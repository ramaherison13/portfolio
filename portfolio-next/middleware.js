import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Protège /admin côté serveur : sans session valide → redirection vers /admin/login.
// (Le layout du panneau revérifie ensuite que l'email figure dans la table `admins`.)
export async function middleware(request) {
  let response = NextResponse.next({ request })

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(list) {
          list.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const isLogin = pathname.startsWith('/admin/login')

  if (!user && !isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }
  if (user && isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }
  return response
}

export const config = { matcher: ['/admin/:path*'] }
