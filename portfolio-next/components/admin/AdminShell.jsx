'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import NotificationBell from './NotificationBell'
import { useAdminTheme } from './AdminRoot'

const NAV = [
  { href: '/admin', label: 'Tableau de bord', icon: 'fa-gauge' },
  { href: '/admin/notifications', label: 'Notifications', icon: 'fa-bell' },
  { href: '/admin/messages', label: 'Messages', icon: 'fa-envelope', pill: true },
  { href: '/admin/projects', label: 'Projets', icon: 'fa-layer-group' },
  { href: '/admin/stats', label: 'Statistiques', icon: 'fa-chart-line' },
  { href: '/admin/settings', label: 'Paramètres', icon: 'fa-gear' },
]

export default function AdminShell({ email, unreadMessages, children }) {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useAdminTheme()
  const current = NAV.find((n) => (n.href === '/admin' ? path === '/admin' : path.startsWith(n.href)))

  return (
    <div className="shell">
      <aside className={`side${open ? ' open' : ''}`}>
        <div className="brand">Ramaherison<small>Espace administration</small></div>
        <nav className="nav" onClick={() => setOpen(false)}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={current?.href === n.href ? 'on' : ''}>
              <i className={`fa-solid ${n.icon}`} /> {n.label}
              {n.pill && unreadMessages > 0 && <span className="pill">{unreadMessages}</span>}
            </Link>
          ))}
          <a href="/" target="_blank" rel="noopener noreferrer"><i className="fa-solid fa-arrow-up-right-from-square" /> Voir le site</a>
        </nav>
        <div className="side-foot">
          {email}
          <form action="/admin/signout" method="post" style={{ marginTop: 8 }}>
            <button className="linkbtn">Se déconnecter</button>
          </form>
        </div>
      </aside>

      <div className="main">
        <div className="top">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="icon-btn menu-btn" aria-label="Menu" onClick={() => setOpen((o) => !o)}><i className="fa-solid fa-bars" /></button>
            <h1>{current?.label || 'Administration'}</h1>
          </div>
          <div className="top-r">
            <button className="icon-btn" onClick={toggle} aria-label="Mode sombre" title="Mode sombre">
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
            </button>
            <NotificationBell />
          </div>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
