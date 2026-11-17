'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/notif'

export default function MessagesPage() {
  const sb = useRef(createClient()).current
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await sb.from('messages').select('*').order('created_at', { ascending: false }).limit(200)
    setItems(data || []); setLoading(false)
  }, [sb])

  useEffect(() => {
    load()
    const ch = sb.channel('msgs').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, load).subscribe()
    return () => { sb.removeChannel(ch) }
  }, [sb, load])

  async function toggleOpen(m) {
    const next = open === m.id ? null : m.id
    setOpen(next)
    if (next && !m.read) { await sb.from('messages').update({ read: true }).eq('id', m.id); load() }
  }
  const setRead = async (m, read) => { await sb.from('messages').update({ read }).eq('id', m.id); load() }
  const remove = async (m) => { if (confirm(`Supprimer le message de ${m.name} ?`)) { await sb.from('messages').delete().eq('id', m.id); load() } }

  if (loading) return <p className="note">Chargement…</p>
  if (!items.length) return <div className="box empty">Aucun message pour le moment.</div>

  return items.map((m) => (
    <div key={m.id} className={`msg${m.read ? '' : ' unread'}`}>
      <button className="msg-h" onClick={() => toggleOpen(m)} aria-expanded={open === m.id}>
        {!m.read && <span className="dot" aria-label="Non lu" />}
        <span className="grow" style={{ flex: 1 }}><strong style={{ fontWeight: 500 }}>{m.name}</strong> <span className="note">&lt;{m.email}&gt;</span></span>
        <span className="note">{timeAgo(m.created_at)}</span>
      </button>
      {open === m.id && (
        <div className="msg-b">
          <p style={{ margin: '0 0 16px' }}>{m.body}</p>
          <div className="row-actions">
            <a className="btn" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: votre message')}&body=${encodeURIComponent(`\n\n— En réponse à votre message du ${new Date(m.created_at).toLocaleDateString('fr-FR')} :\n> ${m.body.replace(/\n/g, '\n> ')}`)}`}>
              <i className="fa-solid fa-reply" /> Répondre
            </a>
            <button className="btn ghost" onClick={() => setRead(m, !m.read)}>{m.read ? 'Marquer non lu' : 'Marquer lu'}</button>
            <button className="btn danger" onClick={() => remove(m)}>Supprimer</button>
          </div>
        </div>
      )}
    </div>
  ))
}
