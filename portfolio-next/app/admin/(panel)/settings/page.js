'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAdminTheme } from '@/components/admin/AdminRoot'

// Taille maximale de la photo de profil (en Mo)
const MAX_PHOTO_MB = 10

const FIELDS = [
  ['hero_name', 'Prénom affiché (grand titre)', 'text'],
  ['roles', 'Métiers (séparés par des virgules — effet machine à écrire)', 'text'],
  ['about_1', 'À propos — paragraphe 1', 'area'],
  ['about_2', 'À propos — paragraphe 2', 'area'],
  ['email', 'Email', 'text'], ['phone', 'Téléphone', 'text'], ['location', 'Localisation', 'text'],
  ['github', 'Lien GitHub', 'text'], ['linkedin', 'Lien LinkedIn', 'text'],
  ['cv_url', 'Lien du CV (ex : /cv.pdf)', 'text'],
]

export default function SettingsPage() {
  const sb = useRef(createClient()).current
  const { theme, toggle } = useAdminTheme()
  const [c, setC] = useState({})
  const [skills, setSkills] = useState([])
  const [msg, setMsg] = useState({ t: '', err: false })
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([sb.from('site_content').select('key,value'), sb.from('skills').select('*').order('sort')])
    setC(Object.fromEntries((a.data || []).map((r) => [r.key, r.value])))
    setSkills(b.data || [])
  }, [sb])
  useEffect(() => { load() }, [load])

  const say = (t, err = false) => setMsg({ t, err })

  async function saveContent(e) {
    e.preventDefault(); setBusy(true)
    const rows = FIELDS.map(([key]) => ({ key, value: c[key] || '' }))
    const { error } = await sb.from('site_content').upsert(rows)
    setBusy(false)
    error ? say(error.message, true) : say('Textes enregistrés. Le site public se met à jour sous ~1 min.')
  }

  async function uploadPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > MAX_PHOTO_MB * 1024 * 1024) return say(`Choisissez une image de moins de ${MAX_PHOTO_MB} Mo.`, true)
    setBusy(true)
    const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '')
    const path = `profile-${Date.now()}.${ext}`
    const up = await sb.storage.from('media').upload(path, file, { upsert: false, contentType: file.type })
    if (up.error) { setBusy(false); return say(up.error.message, true) }
    const url = sb.storage.from('media').getPublicUrl(path).data.publicUrl
    const { error } = await sb.from('site_content').upsert({ key: 'photo_url', value: url })
    setBusy(false)
    if (error) return say(error.message, true)
    setC((x) => ({ ...x, photo_url: url })); say('Photo mise à jour.')
  }

  const patchSkill = (id, k, v) => setSkills((l) => l.map((s) => (s.id === id ? { ...s, [k]: v } : s)))
  async function saveSkill(s) {
    const { error } = await sb.from('skills').update({ name: s.name, level: Math.min(100, Math.max(0, Number(s.level) || 0)), sort: Number(s.sort) || 0 }).eq('id', s.id)
    error ? say(error.message, true) : say('Compétence enregistrée.')
  }
  async function addSkill() {
    const { error } = await sb.from('skills').insert({ name: 'Nouvelle compétence', level: 70, sort: skills.length + 1 })
    error ? say(error.message, true) : load()
  }
  async function delSkill(s) { if (confirm(`Supprimer « ${s.name} » ?`)) { await sb.from('skills').delete().eq('id', s.id); load() } }

  return (
    <>
      {msg.t && <p className={`status${msg.err ? ' err' : ''}`} style={{ margin: '0 0 16px' }} role="status">{msg.t}</p>}

      <div className="box" style={{ marginBottom: 20 }}>
        <h2>Photo de profil</h2>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.photo_url || '/profile.png'} alt="" width={84} height={84} style={{ borderRadius: '50%', objectFit: 'cover' }} />
          <input type="file" accept="image/*" onChange={uploadPhoto} disabled={busy} />
        </div>
      </div>

      <form className="box" onSubmit={saveContent} style={{ marginBottom: 20 }}>
        <h2>Textes de la page d&apos;accueil</h2>
        {FIELDS.map(([k, label, kind]) => (
          <div className="field" key={k}><label>{label}</label>
            {kind === 'area' ? <textarea value={c[k] || ''} onChange={(e) => setC({ ...c, [k]: e.target.value })} />
              : <input type="text" value={c[k] || ''} onChange={(e) => setC({ ...c, [k]: e.target.value })} />}
          </div>
        ))}
        <button className="btn" disabled={busy}>Enregistrer les textes</button>
      </form>

      <div className="box" style={{ marginBottom: 20 }}>
        <h2>Compétences <button className="btn ghost" onClick={addSkill}>+ Ajouter</button></h2>
        <div className="list">
          {skills.map((s) => (
            <div className="li" key={s.id} style={{ flexWrap: 'wrap' }}>
              <input type="text" aria-label="Nom" style={{ flex: '1 1 180px' }} value={s.name} onChange={(e) => patchSkill(s.id, 'name', e.target.value)} />
              <input type="number" aria-label="Niveau %" style={{ width: 90 }} min={0} max={100} value={s.level} onChange={(e) => patchSkill(s.id, 'level', e.target.value)} />
              <input type="number" aria-label="Ordre" style={{ width: 80 }} value={s.sort} onChange={(e) => patchSkill(s.id, 'sort', e.target.value)} />
              <button className="btn ghost" onClick={() => saveSkill(s)}>Enregistrer</button>
              <button className="btn danger" onClick={() => delSkill(s)}>Supprimer</button>
            </div>
          ))}
        </div>
      </div>

      <div className="box">
        <h2>Affichage</h2>
        <button className="btn ghost" onClick={toggle}>Mode {theme === 'dark' ? 'clair' : 'sombre'}</button>
      </div>
    </>
  )
}
