// Agrégations pour le tableau de bord et les statistiques (jours en UTC).
const DAY = 86400000
const dayKey = (d) => new Date(d).toISOString().slice(0, 10)

export async function getStats(supabase) {
  const since = new Date(Date.now() - 30 * DAY).toISOString()
  const [ev, unread, total] = await Promise.all([
    supabase.from('events').select('type,target,country,device,created_at')
      .gte('created_at', since).order('created_at', { ascending: false }).limit(20000),
    supabase.from('messages').select('id', { count: 'exact', head: true }).eq('read', false),
    supabase.from('messages').select('id', { count: 'exact', head: true }),
  ])
  const events = ev.data || []
  const today = dayKey(Date.now())
  const sevenAgo = Date.now() - 7 * DAY

  const count = (type, pred = () => true) => events.filter((e) => e.type === type && pred(e)).length
  const in7 = (e) => new Date(e.created_at).getTime() >= sevenAgo
  const isToday = (e) => dayKey(e.created_at) === today

  // Série quotidienne des visites sur 30 jours (du plus ancien au plus récent)
  const series = []
  for (let i = 29; i >= 0; i--) {
    const k = dayKey(Date.now() - i * DAY)
    series.push({ date: k, count: 0 })
  }
  const idx = Object.fromEntries(series.map((s, i) => [s.date, i]))
  events.forEach((e) => { if (e.type === 'visit') { const i = idx[dayKey(e.created_at)]; if (i !== undefined) series[i].count++ } })

  const tally = (type, field) => {
    const m = {}
    events.filter((e) => e.type === type && e[field]).forEach((e) => { m[e[field]] = (m[e[field]] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }))
  }
  const allTally = (field) => {
    const m = {}
    events.filter((e) => e.type === 'visit' && e[field]).forEach((e) => { m[e[field]] = (m[e[field]] || 0) + 1 })
    return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([name, n]) => ({ name, n }))
  }

  return {
    cards: {
      visitsToday: count('visit', isToday),
      visits7: count('visit', in7),
      clicks7: count('project_click', in7),
      clicksToday: count('project_click', isToday),
      cv7: count('cv_download', in7),
      cvToday: count('cv_download', isToday),
      interested7: count('interested', in7),
      interestedToday: count('interested', isToday),
      messagesUnread: unread.count || 0,
      messagesTotal: total.count || 0,
    },
    series,
    topProjects: tally('project_click', 'target').slice(0, 8),
    countries: allTally('country').slice(0, 8),
    devices: allTally('device'),
    capped: events.length >= 20000,
  }
}
