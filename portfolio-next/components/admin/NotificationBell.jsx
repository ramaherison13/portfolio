'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { FILTERS, TYPE_META, matchFilter, timeAgo } from '@/lib/notif'

// Petit « ding » généré (pas de fichier audio à héberger).
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const o = ctx.createOscillator(), g = ctx.createGain()
    o.type = 'sine'; o.frequency.setValueAtTime(880, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12)
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35)
    o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.36)
    setTimeout(() => ctx.close(), 600)
  } catch {}
}

export default function NotificationBell() {
  const supabase = useRef(createClient()).current
  const wrap = useRef(null)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [toast, setToast] = useState(null)
  const [ring, setRing] = useState(false)
  const [muted, setMuted] = useState(false)
  const [, tick] = useState(0)
  const mutedRef = useRef(false)
  const [perm, setPerm] = useState('default')

  const load = useCallback(async () => {
    const [list, count] = await Promise.all([
      supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('read', false),
    ])
    setItems(list.data || [])
    setUnread(count.count || 0)
  }, [supabase])

  useEffect(() => {
    try { setMuted(localStorage.getItem('adm_muted') === '1') } catch {}
    if (typeof Notification !== 'undefined') setPerm(Notification.permission)
    load()

    // Temps réel : chaque nouvelle ligne de `notifications` arrive ici sans rechargement.
    const channel = supabase.channel('notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, ({ new: n }) => {
        setItems((l) => [n, ...l].slice(0, 50))
        setUnread((u) => u + 1)
        setRing(true); setTimeout(() => setRing(false), 900)
        setToast(n); setTimeout(() => setToast((t) => (t?.id === n.id ? null : t)), 5000)
        if (!mutedRef.current) beep()
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
          try { new Notification('Portfolio', { body: n.body }) } catch {}
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifications' }, ({ new: n }) => {
        setItems((l) => l.map((x) => (x.id === n.id ? n : x)))
      })
      .subscribe()

    const t = setInterval(() => tick((x) => x + 1), 30000) // rafraîchit « il y a 2 min »
    return () => { supabase.removeChannel(channel); clearInterval(t) }
  }, [supabase, load])

  useEffect(() => { mutedRef.current = muted; try { localStorage.setItem('adm_muted', muted ? '1' : '0') } catch {} }, [muted])

  useEffect(() => {
    const out = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false) }
    const esc = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', out); document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', esc) }
  }, [])

  async function markRead(n) {
    if (n.read) return
    setItems((l) => l.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    setUnread((u) => Math.max(0, u - 1))
    await supabase.from('notifications').update({ read: true }).eq('id', n.id)
  }
  async function markAll() {
    setItems((l) => l.map((x) => ({ ...x, read: true })))
    setUnread(0)
    await supabase.from('notifications').update({ read: true }).eq('read', false)
  }
  async function askPush() {
    if (typeof Notification === 'undefined') return
    setPerm(await Notification.requestPermission())
  }

  const shown = items.filter((n) => matchFilter(filter, n.type))

  return (
    <div className="bell-wrap" ref={wrap}>
      <button className={`icon-btn${ring ? ' bell-ring' : ''}`} aria-label={`Notifications (${unread} non lues)`} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <i className="fa-solid fa-bell" />
        {unread > 0 && <span className="badge">{unread > 99 ? '99+' : unread}</span>}
      </button>

      {open && (
        <div className="dropdown" role="dialog" aria-label="Notifications">
          <div className="dd-head">
            <strong>Notifications</strong>
            <span style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <button className="linkbtn" onClick={() => setMuted((m) => !m)} title="Son">
                <i className={`fa-solid ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`} />
              </button>
              <button className="linkbtn" onClick={markAll} disabled={!unread}>Tout marquer comme lu</button>
            </span>
          </div>
          <div className="chips">
            {FILTERS.map((f) => <button key={f.key} className={`chip${filter === f.key ? ' on' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>)}
          </div>
          <div className="nlist">
            {shown.length === 0 && <div className="empty">Aucune notification pour le moment.</div>}
            {shown.map((n) => (
              <button key={n.id} className={`nitem${n.read ? '' : ' unread'}`} onClick={() => markRead(n)}>
                <span className="nico">{TYPE_META[n.type]?.icon || '🔔'}</span>
                <span><span className="ntxt">{n.body}</span><div className="ntime">{timeAgo(n.created_at)}</div></span>
              </button>
            ))}
          </div>
          <div className="dd-foot">
            {perm === 'default' && typeof Notification !== 'undefined'
              ? <button className="linkbtn" onClick={askPush}>Activer les notifications navigateur</button>
              : <span className="note">{perm === 'granted' ? 'Push navigateur activé' : ''}</span>}
            <Link href="/admin/notifications" className="linkbtn" onClick={() => setOpen(false)}>Voir tout</Link>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast" role="status">
          <strong style={{ fontWeight: 500 }}>{TYPE_META[toast.type]?.icon} Nouvelle notification</strong>
          <div>{toast.body}</div>
        </div>
      )}
    </div>
  )
}
