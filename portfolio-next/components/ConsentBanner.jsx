'use client'
import { useEffect, useState } from 'react'
import { getConsent, setConsent, startTracking } from '@/lib/tracker'

// Bannière RGPD : le suivi ne démarre qu'après « Accepter ».
export default function ConsentBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const c = getConsent()
    if (c === 'granted') startTracking()
    if (!c) setShow(true)
    const reopen = () => setShow(true)
    window.addEventListener('open-consent', reopen)
    return () => window.removeEventListener('open-consent', reopen)
  }, [])

  if (!show) return null
  const choose = (v) => { setConsent(v); setShow(false) }

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-label="Consentement aux statistiques">
      <p>
        Ce site mesure de façon <strong>anonyme</strong> les pages et projets consultés pour améliorer l’expérience
        (aucune adresse IP n’est conservée). Ces mesures ne démarrent qu’avec votre accord.
      </p>
      <div className="row2">
        <button className="yes" onClick={() => choose('granted')}>Accepter</button>
        <button className="no" onClick={() => choose('denied')}>Refuser</button>
      </div>
    </div>
  )
}
