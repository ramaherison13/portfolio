'use client'
import { useEffect, useRef, useState } from 'react'
import { track } from '@/lib/tracker'

const COLORS = ['#222222', '#2563EB', '#0F9D8A', '#D9480F', '#7C3AED', '#C2255C']
const LABEL = { web: 'Web', design: 'Design', mobile: 'Mobile' }

// TODO : remplacez ces textes d'exemple par de vrais témoignages
const TESTIMONIALS = [
  { q: "Un développeur rigoureux, à l'écoute, qui livre une application propre et facile à utiliser.", n: 'Nom du client', r: 'Poste, organisation' },
  { q: 'Une vraie compréhension des besoins du terrain et un code soigné du début à la fin.', n: 'Nom du collaborateur', r: 'Poste, organisation' },
  { q: 'Réactif, autonome et force de proposition sur toute la chaîne, du design au déploiement.', n: "Nom de l'encadrant", r: 'Poste, organisation' },
]

const EXPERIENCE = [
  { when: '2025 — Présent', t: 'Développeur Multiplateforme', o: 'Projets indépendants & institutionnels', d: "Conception et développement d'Itantsoroka et d'autres solutions à impact territorial, de la spécification au déploiement." },
  { when: '2024', t: 'Projet académique full-stack', o: 'ENI Fianarantsoa', d: "Application web complète : frontend, backend et base de données." },
  { when: '2023', t: 'Formation approfondie mobile', o: 'Auto-formation & projets personnels', d: 'Montée en compétence sur Flutter, Dart et Firebase.' },
]
const EDUCATION = [
  { when: 'En cours', t: 'Master en Informatique Générale', o: 'ENI — Université de Fianarantsoa', d: 'Ingénierie logicielle, systèmes, réseaux et développement multiplateforme.' },
  { when: '2021 — 2023', t: 'Licence professionnelle en Informatique', o: 'ENI — Université de Fianarantsoa', d: 'Programmation, bases de données et administration réseau.' },
  { when: '2019 — 2020', t: 'Baccalauréat général', o: 'Lycée Privé LA VICTOIRE', d: '' },
]

function useInView(ref) {
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.2 })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return seen
}

export default function Portfolio({ data }) {
  const { content: c, projects, skills } = data
  const roles = (c.roles || '').split(',').map((s) => s.trim()).filter(Boolean)
  const photo = c.photo_url || '/profile.png'

  const [scrolled, setScrolled] = useState(false)
  const [drawer, setDrawer] = useState(false)
  const [active, setActive] = useState('accueil')
  const [filter, setFilter] = useState('all')
  const [typed, setTyped] = useState('')
  const [slide, setSlide] = useState(0)
  const [panel, setPanel] = useState(false)
  const [accent, setAccent] = useState(COLORS[0])
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' })
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const skillsRef = useRef(null)
  const skillsSeen = useInView(skillsRef)

  // Ombre du header au scroll
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 10)
    on(); window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  // Apparition au scroll (les éléments .reveal ont une className statique)
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
    }), { threshold: 0.12 })
    document.querySelectorAll('.site .reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // Lien de menu actif
  useEffect(() => {
    const spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setActive(e.target.id) }),
      { rootMargin: '-45% 0px -50% 0px' })
    document.querySelectorAll('.site section[id]').forEach((s) => spy.observe(s))
    return () => spy.disconnect()
  }, [])

  // Effet machine à écrire
  useEffect(() => {
    if (!roles.length) return
    let ri = 0, ci = 0, del = false, t
    const tick = () => {
      const w = roles[ri]
      setTyped(w.slice(0, ci))
      if (!del && ci === w.length) { del = true; t = setTimeout(tick, 1600); return }
      if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length }
      ci += del ? -1 : 1
      t = setTimeout(tick, del ? 45 : 90)
    }
    tick()
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.roles])

  // Carrousel auto
  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % TESTIMONIALS.length), 6000)
    return () => clearInterval(t)
  }, [slide])

  // Couleur d'accent mémorisée
  useEffect(() => {
    try { const s = localStorage.getItem('accent'); if (COLORS.includes(s)) setAccent(s) } catch {}
  }, [])
  useEffect(() => {
    document.querySelector('.site')?.style.setProperty('--accent', accent)
    try { localStorage.setItem('accent', accent) } catch {}
  }, [accent])

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') { setDrawer(false); setPanel(false) } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  async function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      setNote('Merci de remplir correctement tous les champs.'); return
    }
    setSending(true); setNote('')
    try {
      const r = await fetch('/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (r.ok) { setNote('Message envoyé, merci ! Je vous réponds rapidement.'); setForm({ name: '', email: '', message: '', website: '' }) }
      else if (r.status === 503) setNote(`Envoi indisponible pour le moment. Écrivez-moi à ${c.email}.`)
      else setNote("L'envoi a échoué. Réessayez ou écrivez-moi directement par email.")
    } catch { setNote("L'envoi a échoué. Réessayez ou écrivez-moi directement par email.") }
    setSending(false)
  }

  const close = () => setDrawer(false)
  const social = (name) => () => track('social_click', name)
  const contactNow = () => { track('interested', 'Bouton « Travaillons ensemble »'); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }
  const shown = projects.filter((p) => filter === 'all' || p.category === filter)

  const Socials = () => (
    <>
      <a href={c.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" onClick={social('LinkedIn')}><i className="fa-brands fa-linkedin-in" /></a>
      <a href={c.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" onClick={social('GitHub')}><i className="fa-brands fa-github" /></a>
      <a href={`mailto:${c.email}`} aria-label="Email" onClick={social('Email')}><i className="fa-regular fa-envelope" /></a>
    </>
  )

  return (
    <>
      {/* ============ HEADER ============ */}
      <header className={scrolled ? 'scrolled' : ''}>
        <div className="container nav">
          <a href="#accueil" className="logo">Ramaherison</a>
          <ul className="menu">
            <li>
              <a href="#accueil" className={active === 'accueil' ? 'active' : ''}>Accueil <i className="fa-solid fa-chevron-down" /></a>
              <div className="sub"><a href="#accueil">Introduction</a><a href="#services">Services</a></div>
            </li>
            <li><a href="#apropos" className={active === 'apropos' ? 'active' : ''}>À propos</a></li>
            <li>
              <a href="#portfolio" className={active === 'portfolio' ? 'active' : ''}>Portfolio <i className="fa-solid fa-chevron-down" /></a>
              <div className="sub"><a href="#portfolio">Projets</a><a href="#parcours">Expérience &amp; formation</a></div>
            </li>
            <li>
              <a href="#temoignages" className={active === 'temoignages' ? 'active' : ''}>Pages <i className="fa-solid fa-chevron-down" /></a>
              <div className="sub"><a href="#temoignages">Témoignages</a><a href="#parcours">Parcours</a></div>
            </li>
            <li><a href="#contact" className={active === 'contact' ? 'active' : ''}>Contact</a></li>
          </ul>
          <div className="socials"><Socials /></div>
          <button className="burger" aria-label="Ouvrir le menu" onClick={() => setDrawer((d) => !d)}><span /><span /><span /></button>
        </div>
      </header>

      <div className={`overlay${drawer ? ' open' : ''}`} onClick={close} />
      <nav className={`drawer${drawer ? ' open' : ''}`} aria-label="Menu mobile" onClick={(e) => e.target.tagName === 'A' && close()}>
        <a href="#accueil">Accueil</a>
        <div className="d-sub"><a href="#services">Services</a></div>
        <a href="#apropos">À propos</a>
        <a href="#portfolio">Portfolio</a>
        <div className="d-sub"><a href="#parcours">Expérience &amp; formation</a></div>
        <a href="#temoignages">Témoignages</a>
        <a href="#contact">Contact</a>
        <div className="socials"><Socials /></div>
      </nav>

      {/* Réglages couleur */}
      <button className="gear" aria-label="Réglages de couleur" onClick={() => setPanel((p) => !p)}><i className="fa-solid fa-gear" /></button>
      <div className={`panel${panel ? ' open' : ''}`}>
        <h4>Couleur d&apos;accent</h4>
        <div className="swatches">
          {COLORS.map((col) => (
            <button key={col} style={{ background: col }} aria-label={`Couleur ${col}`} aria-pressed={accent === col} onClick={() => setAccent(col)} />
          ))}
        </div>
      </div>

      <main>
        {/* ============ HERO ============ */}
        <section id="accueil">
          <div className="bar b1" /><div className="bar b2" /><div className="bar b3" /><div className="bar b4" /><div className="dot" />
          <div className="container hero">
            <div className="hero-text">
              <p className="hi">Bonjour, je suis</p>
              <h1 className="name">{c.hero_name}</h1>
              <p className="role"><span>{typed}</span><span className="cursor" /></p>
              <a href={c.cv_url || '/cv.pdf'} download className="cv" onClick={() => track('cv_download', 'CV')}>
                Télécharger mon CV <i className="fa-solid fa-arrow-down" />
              </a>
              <button className="cta-ghost" onClick={contactNow}>Travaillons ensemble</button>
            </div>
            <div className="hero-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="portrait" src={photo} alt="Portrait de Randrianirina Ramaherison Lucien" />
            </div>
          </div>
        </section>

        {/* ============ À PROPOS ============ */}
        <section id="apropos">
          <div className="container">
            <div className="sec-head reveal"><small>Qui suis-je</small><h2>À propos</h2></div>
            <div className="about">
              <div className="about-photo reveal">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={photo} alt="Lucien" /></div>
              <div className="reveal">
                <p>{c.about_1}</p>
                <p>{c.about_2}</p>
                <div className="facts">
                  <div><b>Nom :</b> Randrianirina Ramaherison Lucien</div>
                  <div><b>Lieu :</b> {c.location}</div>
                  <div><b>Email :</b> {c.email}</div>
                  <div><b>Statut :</b> Disponible</div>
                </div>
                <div ref={skillsRef}>
                  {skills.map((s) => (
                    <div className="skill" key={s.id}>
                      <div className="skill-top"><span>{s.name}</span><span>{s.level}%</span></div>
                      <div className="track"><div className="fill" style={{ width: skillsSeen ? `${s.level}%` : 0 }} /></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ SERVICES ============ */}
        <section id="services" className="alt">
          <div className="container">
            <div className="sec-head reveal"><small>Ce que je fais</small><h2>Services</h2></div>
            <div className="cards">
              <div className="card reveal"><i className="fa-solid fa-mobile-screen" /><h3>Applications mobiles</h3><p>Apps iOS &amp; Android avec Flutter / Dart, à partir d&apos;un seul code source.</p></div>
              <div className="card reveal"><i className="fa-solid fa-code" /><h3>Développement web</h3><p>Sites et plateformes full-stack avec React, Node.js et PostgreSQL.</p></div>
              <div className="card reveal"><i className="fa-solid fa-pen-ruler" /><h3>Design UI</h3><p>Interfaces claires et épurées, pensées pour l&apos;usage réel.</p></div>
              <div className="card reveal"><i className="fa-solid fa-network-wired" /><h3>Réseaux &amp; systèmes</h3><p>Administration Linux, supervision et mise en place d&apos;infrastructures locales.</p></div>
            </div>
          </div>
        </section>

        {/* ============ PORTFOLIO ============ */}
        <section id="portfolio">
          <div className="container">
            <div className="sec-head reveal"><small>Mes réalisations</small><h2>Portfolio</h2></div>
            <div className="filters reveal">
              {[['all', 'Tous'], ['web', 'Web'], ['design', 'Design'], ['mobile', 'Mobile']].map(([k, l]) => (
                <button key={k} className={filter === k ? 'active' : ''} onClick={() => setFilter(k)}>{l}</button>
              ))}
            </div>
            <div className="grid">
              {shown.map((p) => (
                <article className="work" key={p.id} tabIndex={0}
                  onClick={() => track('project_click', p.title)}>
                  <span className="badge">{LABEL[p.category]}</span>
                  <i className={`fa-solid ${p.icon || 'fa-globe'} ico`} />
                  <div className="info">
                    <h3>{p.title}</h3><p>{p.description}</p><div className="tags">{p.tech}</div>
                    {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>Voir le projet</a>}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ============ PARCOURS ============ */}
        <section id="parcours" className="alt">
          <div className="container">
            <div className="sec-head reveal"><small>Mon parcours</small><h2>Expérience &amp; formation</h2></div>
            <div className="cols">
              {[['Expérience', 'fa-briefcase', EXPERIENCE], ['Formation', 'fa-graduation-cap', EDUCATION]].map(([title, ico, items]) => (
                <div className="reveal" key={title}>
                  <h3><i className={`fa-solid ${ico}`} /> {title}</h3>
                  <div className="timeline">
                    {items.map((it) => (
                      <div className="t-item" key={it.t}>
                        <span className="when">{it.when}</span><h4>{it.t}</h4><div className="org">{it.o}</div>{it.d && <p>{it.d}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ TÉMOIGNAGES ============ */}
        <section id="temoignages">
          <div className="container">
            <div className="sec-head reveal"><small>Ils en parlent</small><h2>Témoignages</h2></div>
            <div className="carousel reveal">
              <div className="slides">
                <div className="track-s" style={{ transform: `translateX(-${slide * 100}%)` }}>
                  {TESTIMONIALS.map((t) => (
                    <div className="slide" key={t.q}><i className="fa-solid fa-quote-left" /><blockquote>{t.q}</blockquote><cite>{t.n}</cite><span>{t.r}</span></div>
                  ))}
                </div>
              </div>
              <div className="c-ctrl">
                <button className="arrow" aria-label="Précédent" onClick={() => setSlide((s) => (s - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}><i className="fa-solid fa-chevron-left" /></button>
                <div className="dots">{TESTIMONIALS.map((t, i) => <button key={t.q} aria-label={`Témoignage ${i + 1}`} className={i === slide ? 'on' : ''} onClick={() => setSlide(i)} />)}</div>
                <button className="arrow" aria-label="Suivant" onClick={() => setSlide((s) => (s + 1) % TESTIMONIALS.length)}><i className="fa-solid fa-chevron-right" /></button>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section id="contact" className="alt">
          <div className="container">
            <div className="sec-head reveal"><small>Parlons-en</small><h2>Contact</h2></div>
            <div className="contact">
              <ul className="c-info reveal">
                <li><i className="fa-regular fa-envelope" /><div><small>Email</small><a href={`mailto:${c.email}`}>{c.email}</a></div></li>
                <li><i className="fa-solid fa-phone" /><div><small>Téléphone / WhatsApp</small><a href={`tel:${(c.phone || '').replace(/\s/g, '')}`}>{c.phone}</a></div></li>
                <li><i className="fa-solid fa-location-dot" /><div><small>Localisation</small>{c.location}</div></li>
                <li><i className="fa-brands fa-github" /><div><small>GitHub</small><a href={c.github} target="_blank" rel="noopener noreferrer" onClick={social('GitHub')}>{(c.github || '').replace('https://', '')}</a></div></li>
              </ul>
              <form className="reveal" onSubmit={submit} noValidate>
                <div className="row">
                  <input type="text" placeholder="Votre nom" aria-label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={120} />
                  <input type="email" placeholder="Votre email" aria-label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={200} />
                </div>
                <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" placeholder="Ne pas remplir" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                <textarea placeholder="Votre message" aria-label="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={5000} />
                <button type="submit" className="btn" disabled={sending}>{sending ? 'Envoi…' : 'Envoyer'}</button>
                <p className="form-note" role="status">{note}</p>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container foot">
          <div>© 2026 Randrianirina Ramaherison Lucien. Tous droits réservés. · <button className="linkbtn" onClick={() => window.dispatchEvent(new Event('open-consent'))}>Gérer les cookies</button></div>
          <div className="socials"><Socials /></div>
        </div>
      </footer>
    </>
  )
}
