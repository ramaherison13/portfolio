// Aide partagée entre la cloche, la page Notifications et le tableau de bord.
export const FILTERS = [
  { key: 'all', label: 'Tous', types: null },
  { key: 'interested', label: 'Intéressés', types: ['interested'] },
  { key: 'portfolio', label: 'Portfolio', types: ['project_click'] },
  { key: 'cv', label: 'CV', types: ['cv_download'] },
  { key: 'messages', label: 'Messages', types: ['message'] },
]

export const TYPE_META = {
  visit:         { icon: '👁️', label: 'Visite' },
  project_click: { icon: '🖼️', label: 'Projet' },
  cv_download:   { icon: '📄', label: 'CV' },
  interested:    { icon: '⭐', label: 'Intéressé' },
  message:       { icon: '✉️', label: 'Message' },
  social_click:  { icon: '🔗', label: 'Réseau' },
}

export function matchFilter(filterKey, type) {
  const f = FILTERS.find((x) => x.key === filterKey)
  return !f?.types || f.types.includes(type)
}

export function timeAgo(iso) {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 45) return "à l'instant"
  const m = Math.round(s / 60)
  if (m < 60) return `il y a ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `il y a ${h} h`
  const d = Math.round(h / 24)
  return `il y a ${d} j`
}
