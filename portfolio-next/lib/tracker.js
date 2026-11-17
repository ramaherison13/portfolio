'use client'
// Suivi des visiteurs — ne fait RIEN tant que le consentement n'est pas « granted ».
const CONSENT_KEY = 'consent_v1'
const VID_KEY = 'visitor_id'
const state = { started: false, timer: null }

const safe = (fn, d = null) => { try { return fn() } catch { return d } }

export const getConsent = () => safe(() => localStorage.getItem(CONSENT_KEY))
export const hasConsent = () => getConsent() === 'granted'

export function setConsent(value) {
  safe(() => localStorage.setItem(CONSENT_KEY, value))
  if (value === 'granted') startTracking()
  else stopTracking(true)
}

function visitorId() {
  let id = safe(() => localStorage.getItem(VID_KEY))
  if (!id) {
    id = (crypto.randomUUID?.() || String(Math.random()).slice(2) + Date.now()).replace(/-/g, '')
    safe(() => localStorage.setItem(VID_KEY, id))
  }
  return id
}

function send(type, target) {
  if (!hasConsent()) return
  const payload = JSON.stringify({ type, target: target || null, page: location.pathname + location.hash, visitor_id: visitorId() })
  safe(() => {
    if (navigator.sendBeacon) navigator.sendBeacon('/api/track', new Blob([payload], { type: 'application/json' }))
    else fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true })
  })
}

// « Intéressé » : envoyé au plus une fois par visiteur et par session.
function markInterested(reason) {
  if (safe(() => sessionStorage.getItem('interested_sent'))) return
  safe(() => sessionStorage.setItem('interested_sent', '1'))
  send('interested', reason)
}

export function startTracking() {
  if (state.started || !hasConsent()) return
  state.started = true
  if (!safe(() => sessionStorage.getItem('visit_sent'))) {
    safe(() => sessionStorage.setItem('visit_sent', '1'))
    send('visit')
  }
  // Critère 1 : plus de 60 secondes sur le site
  state.timer = setTimeout(() => markInterested('Plus de 60 s sur le site'), 60000)
}

export function stopTracking(clear = false) {
  clearTimeout(state.timer)
  state.started = false
  if (clear) safe(() => { localStorage.removeItem(VID_KEY); sessionStorage.clear() })
}

export function track(type, target) {
  if (!hasConsent()) return
  if (type === 'project_click') {
    send(type, target)
    // Critère 2 : 3 projets distincts consultés
    const seen = safe(() => JSON.parse(sessionStorage.getItem('projects_seen') || '[]'), [])
    if (!seen.includes(target)) {
      seen.push(target)
      safe(() => sessionStorage.setItem('projects_seen', JSON.stringify(seen)))
      if (seen.length >= 3) markInterested('3 projets consultés')
    }
    return
  }
  if (type === 'interested') return markInterested(target || 'Bouton « Travaillons ensemble »')
  send(type, target)
}
