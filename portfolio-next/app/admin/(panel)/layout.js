import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminShell from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

// Vérification côté serveur : session valide ET email présent dans la table `admins`.
export default async function PanelLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    return (
      <div className="login">
        <div className="box">
          <h1>Accès refusé</h1>
          <p>Le compte {user.email} n&apos;est pas administrateur. Ajoutez son email à la table <code>admins</code>.</p>
          <form action="/admin/signout" method="post"><button className="btn">Se déconnecter</button></form>
        </div>
      </div>
    )
  }

  const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true }).eq('read', false)
  return <AdminShell email={user.email} unreadMessages={count || 0}>{children}</AdminShell>
}
