import VisitsChart from './VisitsChart'

function Rank({ title, rows, empty }) {
  const max = Math.max(1, ...rows.map((r) => r.n))
  return (
    <div className="box">
      <h2>{title}</h2>
      {rows.length === 0 ? <p className="note">{empty}</p> : (
        <ul className="rank">
          {rows.map((r) => (
            <li key={r.name}><span style={{ minWidth: 110, overflowWrap: 'anywhere' }}>{r.name}</span>
              <span className="bar"><i style={{ width: `${(r.n / max) * 100}%` }} /></span><b>{r.n}</b></li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function StatCards({ cards }) {
  const items = [
    ['Visites du jour', cards.visitsToday, `${cards.visits7} sur 7 j`],
    ['Clics portfolio', cards.clicksToday, `${cards.clicks7} sur 7 j`],
    ['CV téléchargés', cards.cvToday, `${cards.cv7} sur 7 j`],
    ['Visiteurs intéressés', cards.interestedToday, `${cards.interested7} sur 7 j`],
    ['Messages reçus', cards.messagesUnread, `non lus · ${cards.messagesTotal} au total`],
  ]
  return (
    <div className="cards">
      {items.map(([l, v, s]) => <div className="stat" key={l}><small>{l}</small><b>{v}</b><span>{s}</span></div>)}
    </div>
  )
}

export default function StatsView({ stats, extended }) {
  return (
    <>
      <StatCards cards={stats.cards} />
      <div className="two">
        <VisitsChart series={stats.series} />
        <Rank title="Projets les plus consultés (30 j)" rows={stats.topProjects} empty="Aucun clic sur un projet pour l'instant." />
      </div>
      {extended && (
        <div className="two" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Rank title="Pays des visiteurs (30 j)" rows={stats.countries} empty="Pas encore de données (le pays est fourni par Vercel en production)." />
          <Rank title="Appareils (30 j)" rows={stats.devices} empty="Pas encore de données." />
        </div>
      )}
      <p className="note">Jours calculés en UTC. {stats.capped && 'Affichage limité aux 20 000 derniers événements.'}</p>
    </>
  )
}
