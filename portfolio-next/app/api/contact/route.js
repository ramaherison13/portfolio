import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { sendAlertEmail } from '@/lib/mail'

export const runtime = 'nodejs'

export async function POST(req) {
  let b
  try { b = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  // Champ piège (honeypot) : un robot le remplit, un humain non.
  if (b?.website) return NextResponse.json({ ok: true })

  const name = String(b?.name || '').trim().slice(0, 120)
  const email = String(b?.email || '').trim().slice(0, 200)
  const body = String(b?.message || '').trim().slice(0, 5000)
  if (!name || !body || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 })
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ ok: false, error: 'not_configured' }, { status: 503 })
  }

  const sb = createServiceClient()
  const { error } = await sb.from('messages').insert({ name, email, body })
  if (error) return NextResponse.json({ ok: false }, { status: 500 })

  // L'événement « message » déclenche la notification (trigger SQL). Aucun identifiant visiteur stocké.
  await sb.from('events').insert({ type: 'message', target: name, page: '/#contact' })
  await sendAlertEmail(`✉️ Nouveau message de ${name}`, `${name} <${email}>\n\n${body}`)
  return NextResponse.json({ ok: true })
}
