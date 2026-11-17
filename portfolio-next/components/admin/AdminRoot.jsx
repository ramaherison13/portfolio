'use client'
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeCtx = createContext({ theme: 'light', toggle() {} })
export const useAdminTheme = () => useContext(ThemeCtx)

// Enveloppe .adm avec mode sombre optionnel (mémorisé dans le navigateur).
export default function AdminRoot({ children }) {
  const [theme, setTheme] = useState('light')
  useEffect(() => { try { setTheme(localStorage.getItem('adm_theme') === 'dark' ? 'dark' : 'light') } catch {} }, [])
  const toggle = () => setTheme((t) => {
    const n = t === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('adm_theme', n) } catch {}
    return n
  })
  return (
    <ThemeCtx.Provider value={{ theme, toggle }}>
      <div className="adm" data-theme={theme}>{children}</div>
    </ThemeCtx.Provider>
  )
}
