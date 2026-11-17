'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const EMPTY = { title: '', category: 'web', description: '', tech: '', link: '', icon: 'fa-globe', sort: 0, published: true }

export default function ProjectsPage() {
  const sb = useRef(createClient()).current
  const [items, setItems] = useState([])
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState({ t: '', err: false })

  const load = useCallback(async () => {
    const { data } = await sb.from('projects').select('*').order('sort').order('created_at')
    setItems(data || [])
  }, [sb])
  useEffect(() => { load() }, [load])

  async function save(e) {
    e.preventDefault()
    const { id, created_at, ...row } = form
    row.sort = Number(row.sort) || 0
    const { error } = id ? await sb.from('projects').update(row).eq('id', id) : await sb.from('projects').insert(row)
    if (error) return setMsg({ t: error.message, err: true })
    setMsg({ t: 'Enregistré. Le site public se met à jour sous ~1 min.', err: false })
    setForm(null); load()
  }
  async function remove(p) {
    if (!confirm(`Supprimer « ${p.title} » ?`)) return
    await sb.from('projects').delete().eq('id', p.id); load()
  }
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  return (
    <>
      {!form && <button className="btn" onClick={() => { setForm({ ...EMPTY, sort: items.length + 1 }); setMsg({ t: '' }) }} style={{ marginBottom: 18 }}>+ Ajouter un projet</button>}
      {msg.t && <span className={`status${msg.err ? ' err' : ''}`}>{msg.t}</span>}

      {form && (
        <form className="box" onSubmit={save} style={{ marginBottom: 22 }}>
          <h2>{form.id ? 'Modifier le projet' : 'Nouveau projet'}</h2>
          <div className="grid2">
            <div className="field"><label>Titre</label><input type="text" required value={form.title} onChange={set('title')} /></div>
            <div className="field"><label>Catégorie</label>
              <select value={form.category} onChange={set('category')}><option value="web">Web</option><option value="design">Design</option><option value="mobile">Mobile</option></select></div>
          </div>
          <div className="field"><label>Description</label><textarea value={form.description} onChange={set('description')} /></div>
          <div className="grid2">
            <div className="field"><label>Technologies</label><input type="text" value={form.tech} onChange={set('tech')} placeholder="Flutter · Dart · Node.js" /></div>
            <div className="field"><label>Lien (optionnel)</label><input type="url" value={form.link} onChange={set('link')} placeholder="https://…" /></div>
            <div className="field"><label>Icône Font Awesome</label><input type="text" value={form.icon} onChange={set('icon')} placeholder="fa-globe" /></div>
            <div className="field"><label>Ordre</label><input type="number" value={form.sort} onChange={set('sort')} /></div>
          </div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
            <input type="checkbox" checked={form.published} onChange={set('published')} /> Publié sur le site
          </label>
          <div className="row-actions"><button className="btn">Enregistrer</button><button type="button" className="btn ghost" onClick={() => setForm(null)}>Annuler</button></div>
        </form>
      )}

      <div className="list">
        {items.map((p) => (
          <div className="li" key={p.id}>
            <span className="nico"><i className={`fa-solid ${p.icon}`} /></span>
            <div className="grow"><strong style={{ fontWeight: 500 }}>{p.title}</strong> <span className="tag">{p.category}</span> {!p.published && <span className="tag">brouillon</span>}<p>{p.description}</p></div>
            <div className="row-actions">
              <button className="btn ghost" onClick={() => { setForm(p); setMsg({ t: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Modifier</button>
              <button className="btn danger" onClick={() => remove(p)}>Supprimer</button>
            </div>
          </div>
        ))}
        {!items.length && <div className="box empty">Aucun projet. Ajoutez-en un.</div>}
      </div>
    </>
  )
}
