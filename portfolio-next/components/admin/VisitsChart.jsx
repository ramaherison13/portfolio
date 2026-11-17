'use client'
import { useState } from 'react'

// Graphique en barres SVG, sans dépendance. `series` = 30 derniers jours.
export default function VisitsChart({ series }) {
  const [range, setRange] = useState(7)
  const data = series.slice(-range)
  const max = Math.max(1, ...data.map((d) => d.count))
  const W = 640, H = 200, pad = 24, bw = (W - pad * 2) / data.length
  const total = data.reduce((a, d) => a + d.count, 0)

  return (
    <div className="box">
      <h2>
        <span>Visites — {total} sur {range} jours</span>
        <span className="seg">
          {[7, 30].map((r) => <button key={r} className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r} j</button>)}
        </span>
      </h2>
      <svg viewBox={`0 0 ${W} ${H + 24}`} width="100%" role="img" aria-label={`Visites par jour sur ${range} jours`}>
        {[0, 0.5, 1].map((t) => (
          <line key={t} x1={pad} x2={W - pad} y1={H - t * (H - 20)} y2={H - t * (H - 20)} stroke="var(--line)" strokeDasharray="3 4" />
        ))}
        {data.map((d, i) => {
          const h = (d.count / max) * (H - 20)
          const x = pad + i * bw
          return (
            <g key={d.date}>
              <rect x={x + bw * 0.18} y={H - h} width={bw * 0.64} height={Math.max(h, 1)} rx="3" fill="var(--accent)" opacity={d.count ? 1 : 0.15}>
                <title>{`${d.date} : ${d.count} visite(s)`}</title>
              </rect>
              {(range === 7 || i % 5 === 0) && (
                <text x={x + bw / 2} y={H + 16} textAnchor="middle" fontSize="10" fill="var(--soft)">{d.date.slice(5)}</text>
              )}
            </g>
          )
        })}
        <text x={pad} y={12} fontSize="10" fill="var(--soft)">max {max}</text>
      </svg>
    </div>
  )
}
