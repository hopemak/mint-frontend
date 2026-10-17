import React, { useEffect, useState } from 'react'
import api from '../services/api'

// Schematic tile map: each tile is one region, roughly placed by geography.
const TILES = [
  { n: 'Tigray', c: '3', r: '1' },
  { n: 'Afar', c: '4', r: '1 / 3' },
  { n: 'Benishangul-Gumuz', c: '2', r: '2' },
  { n: 'Amhara', c: '3', r: '2' },
  { n: 'Dire Dawa', c: '5', r: '2' },
  { n: 'Gambela', c: '1', r: '3' },
  { n: 'Oromia', c: '2', r: '3' },
  { n: 'Addis Ababa', c: '3', r: '3' },
  { n: 'Harari', c: '4', r: '3' },
  { n: 'Somali', c: '5', r: '3 / 5' },
  { n: 'South West Ethiopia', c: '1', r: '4' },
  { n: 'Central Ethiopia', c: '2', r: '4' },
  { n: 'Sidama', c: '3', r: '4' },
  { n: 'South Ethiopia', c: '2 / 4', r: '5' },
]

export default function InnovationMap() {
  const [data, setData] = useState(null)
  const [sel, setSel] = useState(null)

  useEffect(() => {
    api.get('/api/public/regions').then((r) => setData(r.data)).catch(() => setData({ regions: {} }))
  }, [])

  if (!data) return null
  const regions = data.regions || {}
  const total = Object.values(regions).reduce((s, x) => s + x.count, 0)
  if (total === 0) return null
  const max = Math.max(1, ...Object.values(regions).map((x) => x.count))
  const info = sel && regions[sel]

  return (
    <section id="map" className="py-20 max-w-7xl mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="font-heading text-3xl font-semibold text-primary-800">Innovation Across Ethiopia</h2>
        <p className="text-slate-500 mt-2">Startups registered on the platform, by region.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gridAutoRows: '64px' }}>
            {TILES.map((t) => {
              const count = regions[t.n]?.count || 0
              const alpha = count ? 0.25 + 0.75 * (count / max) : 0
              return (
                <button
                  key={t.n}
                  onClick={() => setSel(t.n)}
                  aria-label={`${t.n}: ${count} startups`}
                  style={{
                    gridColumn: t.c, gridRow: t.r,
                    backgroundColor: count ? `rgba(29, 66, 65, ${alpha})` : undefined,
                  }}
                  className={`rounded-lg p-1 text-[10px] sm:text-xs font-medium leading-tight flex flex-col items-center justify-center text-center border transition-transform hover:scale-[1.03] ${
                    count ? 'text-white border-transparent' : 'bg-slate-100 text-slate-500 border-slate-200'
                  } ${sel === t.n ? 'ring-2 ring-accent-400' : ''}`}
                >
                  <span>{t.n}</span>
                  {count > 0 && <span className="text-sm font-bold">{count}</span>}
                </button>
              )
            })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Schematic map: tile positions approximate each region's location.</p>
        </div>
        <div className="card p-6">
          {info ? (
            <>
              <h3 className="font-heading text-xl font-semibold text-primary-800">{sel}</h3>
              <p className="text-3xl font-bold text-primary mt-2">{info.count}</p>
              <p className="text-sm text-slate-500 mb-3">{info.count === 1 ? 'startup' : 'startups'}</p>
              {Object.keys(info.sectors).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(info.sectors).map(([s, n]) => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{s} - {n}</span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-primary">{total}</p>
              <p className="text-sm text-slate-500">startups mapped across {Object.values(regions).filter((x) => x.count).length} regions.</p>
              <p className="text-sm text-slate-400 mt-3">Select a region to see its sectors.</p>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
