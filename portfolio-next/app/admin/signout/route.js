import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request) {
  await createClient().auth.signOut()
  return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 })
}
