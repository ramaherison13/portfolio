'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FILTERS, TYPE_META, matchFilter, timeAgo } from '@/lib/notif'

export default function NotificationsPage() {
  const sb = useRef(createClient()).current
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await sb.from('notifications').select('*').order('created_at', { ascending: false }).limit(300)
    setItems(data || []); setLoading(false)
  }, [sb])

  useEffect(() => {
    load()
    const ch = sb.channel('notifs-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, load).subscribe()
    return () => { sb.removeChannel(ch) }
  }, [sb, load])

  const shown = items.filter((n) => matchFilter(filter, n.type))
  const toggle = async (n) => { await sb.from('notifications').update({ read: !n.read }).eq('id', n.id); load() }
  const markAll = async () => { await sb.from('notifications').update({ read: true }).eq('read', false); load() }
  const clearRead = async () => {
    if (confirm('Supprimer toutes les notifications déjà lues ?')) { await sb.from('notifications').delete().eq('read', true); load() }
  }

  return (
    <>
      <div className="chips" style={{ border: 0, padding: '0 0 16px' }}>
        {FILTERS.map((f) => <button key={f.key} className={`chip${filter === f.key ? ' on' : ''}`} onClick={() => setFilter(f.key)}>{f.label}</button>)}
        <span style={{ marginLeft: 'auto' }} className="row-actions">
          <button className="btn ghost" onClick={markAll}>Tout marquer comme lu</button>
          <button className="btn danger" onClick={clearRead}>Supprimer les lues</button>
        </span>
      </div>
      {loading ? <p className="note">Chargement…</p> : shown.length === 0 ? <div className="box empty">Aucune notification.</div> : (
        <div className="list">
          {shown.map((n) => (
            <div key={n.id} className={`li${n.read ? '' : ' unread'}`}>
              <span className="nico">{TYPE_META[n.type]?.icon || '🔔'}</span>
              <div className="grow"><div className="ntxt">{n.body}</div><p>{timeAgo(n.created_at)} · {new Date(n.created_at).toLocaleString('fr-FR')}</p></div>
              <span className="tag">{TYPE_META[n.type]?.label}</span>
              <button className="btn ghost" onClick={() => toggle(n)}>{n.read ? 'Non lu' : 'Lu'}</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
