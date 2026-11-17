'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true); setErr('')
    const { error } = await createClient().auth.signInWithPassword({ email, password })
    if (error) { setErr('Identifiants incorrects.'); setBusy(false); return }
    router.replace('/admin')
    router.refresh()
  }

  return (
    <div className="login">
      <form className="box" onSubmit={submit}>
        <h1>Admin</h1>
        <p>Connexion à l&apos;espace privé.</p>
        <div className="field"><label htmlFor="e">Email</label>
          <input id="e" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="p">Mot de passe</label>
          <input id="p" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <button className="btn" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>{busy ? 'Connexion…' : 'Se connecter'}</button>
        {err && <p className="status err" style={{ margin: '14px 0 0' }}>{err}</p>}
      </form>
    </div>
  )
}
