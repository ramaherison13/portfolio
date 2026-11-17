import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/admin'
import { sendAlertEmail } from '@/lib/mail'

export const runtime = 'nodejs'

const TYPES = ['visit', 'project_click', 'cv_download', 'interested', 'social_click']
const clip = (v, n) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null)

function deviceFrom(ua = '') {
  if (/ipad|tablet/i.test(ua)) return 'tablet'
  if (/mobi|android|iphone/i.test(ua)) return 'mobile'
  return 'desktop'
}

// Pays approximatif depuis l'en-tête fourni par Vercel — l'adresse IP n'est JAMAIS lue ni stockée.
function countryFrom(req) {
  const code = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry')
  if (!code || code === 'XX') return null
  try { return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code.toUpperCase()) || code } catch { return code }
}

export async function POST(req) {
  let b
  try { b = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  if (!TYPES.includes(b?.type)) return NextResponse.json({ ok: false }, { status: 400 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: false }, { status: 503 })

  const row = {
    type: b.type,
    page: clip(b.page, 200),
    target: clip(b.target, 200),
    visitor_id: clip(b.visitor_id, 64),
    country: countryFrom(req),
    device: deviceFrom(req.headers.get('user-agent') || ''),
  }
  const { error } = await createServiceClient().from('events').insert(row)
  if (error) return NextResponse.json({ ok: false }, { status: 500 })

  if (row.type === 'interested') {
    await sendAlertEmail('⭐ Visiteur intéressé sur votre portfolio',
      `${row.country ? 'Un visiteur de ' + row.country : 'Un visiteur'} semble intéressé (${row.target || 'comportement'}).`)
  }
  return NextResponse.json({ ok: true })
}
