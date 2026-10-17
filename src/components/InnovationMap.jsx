import React, { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { MAP_W, MAP_H, PX_PER_KM, REGION_SHAPES } from '../data/ethiopiaRegions.js'

// How the map's boundary areas relate to the platform's region names.
// The map data is the 2021 administrative boundary set, so Central Ethiopia and
// South Ethiopia (created in 2023) are drawn together as the former SNNP area.
const AREAS = {
  'Addis Ababa': { label: 'Addis Ababa', keys: ['Addis Ababa'] },
  Afar: { label: 'Afar', keys: ['Afar'], short: 'Afar' },
  Amhara: { label: 'Amhara', keys: ['Amhara'], short: 'Amhara' },
  'Benishangul Gumz': { label: 'Benishangul-Gumuz', keys: ['Benishangul-Gumuz'], short: 'Benishangul' },
  'Dire Dawa': { label: 'Dire Dawa', keys: ['Dire Dawa'] },
  Gambela: { label: 'Gambela', keys: ['Gambela'], short: 'Gambela' },
  Harari: { label: 'Harari', keys: ['Harari'] },
  Oromia: { label: 'Oromia', keys: ['Oromia'], short: 'Oromia' },
  Sidama: { label: 'Sidama', keys: ['Sidama'] },
  SNNP: { label: 'Central & South Ethiopia', keys: ['Central Ethiopia', 'South Ethiopia'], short: 'Central & South' },
  Somali: { label: 'Somali', keys: ['Somali'], short: 'Somali' },
  SWEPR: { label: 'South West Ethiopia', keys: ['South West Ethiopia'], short: 'South West' },
  Tigray: { label: 'Tigray', keys: ['Tigray'], short: 'Tigray' },
}

// Map key: fixed classes, like a printed choropleth map.
const CLASSES = [
  { min: 0, max: 0, label: 'No startups yet', color: '#E8EFEE' },
  { min: 1, max: 2, label: '1 – 2 startups', color: '#C7DAD8' },
  { min: 3, max: 5, label: '3 – 5 startups', color: '#75A3A0' },
  { min: 6, max: 10, label: '6 – 10 startups', color: '#316966' },
  { min: 11, max: Infinity, label: '11 or more', color: '#0F2422' },
]
const classOf = (n) => CLASSES.find((c) => n >= c.min && n <= c.max) || CLASSES[0]

export default function InnovationMap() {
  const [data, setData] = useState(null)
  const [sel, setSel] = useState(null)

  useEffect(() => {
    api.get('/api/public/regions').then((r) => setData(r.data)).catch(() => setData({ regions: {} }))
  }, [])

  const areas = useMemo(() => {
    const regions = data?.regions || {}
    return REGION_SHAPES.map((s) => {
      const cfg = AREAS[s.id] || { label: s.id, keys: [s.id] }
      let count = 0
      const sectors = {}
      cfg.keys.forEach((k) => {
        const r = regions[k]
        if (!r) return
        count += r.count || 0
        Object.entries(r.sectors || {}).forEach(([sec, n]) => { sectors[sec] = (sectors[sec] || 0) + n })
      })
      return { ...s, ...cfg, count, sectors }
    })
  }, [data])

  const total = areas.reduce((s, a) => s + a.count, 0)
  if (!data || total === 0) return null

  const ranked = areas.filter((a) => a.count > 0).sort((a, b) => b.count - a.count)
  const leader = ranked[0]
  const allSectors = {}
  areas.forEach((a) => Object.entries(a.sectors).forEach(([s, n]) => { allSectors[s] = (allSectors[s] || 0) + n }))
  const topSector = Object.entries(allSectors).sort((a, b) => b[1] - a[1])[0]
  const selArea = areas.find((a) => a.id === sel)
  const ordered = [...areas.filter((a) => a.id !== sel), ...areas.filter((a) => a.id === sel)]
  const unassigned = data.unassigned || 0
  const barPx = 100 * PX_PER_KM

  const stats = [
    { label: 'Startups mapped', value: total },
    { label: 'Areas with startups', value: `${ranked.length} of ${areas.length}` },
    { label: 'Leading area', value: leader.label },
    { label: 'Top sector', value: topSector ? topSector[0] : '-' },
  ]

  return (
    <section id="map" className="py-10 max-w-7xl mx-auto px-6">
      <div className="text-center max-w-2xl mx-auto mb-5">
        <h2 className="font-heading text-2xl font-semibold text-primary-800">Startup Capacity Across Ethiopia</h2>
        <p className="text-slate-500 text-sm mt-1">Startups registered on the platform, shown by region.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-3">
            <p className="font-heading text-lg font-semibold text-primary truncate" title={String(s.value)}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        <div className="card p-3 lg:col-span-2">
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="group" aria-label="Map of Ethiopia showing the number of startups in each region" className="w-full h-auto max-h-[45vh] mx-auto">
            {ordered.map((a) => (
              <path
                key={a.id}
                d={a.d}
                fill={classOf(a.count).color}
                fillRule="evenodd"
                stroke={sel === a.id ? '#EF9C82' : '#ffffff'}
                strokeWidth={sel === a.id ? 2.5 : 1}
                strokeLinejoin="round"
                tabIndex={0}
                role="button"
                aria-label={`${a.label}: ${a.count} ${a.count === 1 ? 'startup' : 'startups'}`}
                onClick={() => setSel(sel === a.id ? null : a.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSel(sel === a.id ? null : a.id) } }}
                className="cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
              />
            ))}

            {areas.filter((a) => a.short).map((a) => (
              <text
                key={'l' + a.id}
                x={a.cx}
                y={a.count > 0 ? a.cy - 15 : a.cy + 4}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="#16332F"
                stroke="#ffffff"
                strokeWidth="2.5"
                paintOrder="stroke"
                pointerEvents="none"
              >
                {a.short}
              </text>
            ))}

            {areas.filter((a) => a.count > 0).map((a) => (
              <g key={'m' + a.id} pointerEvents="none">
                <circle cx={a.cx} cy={a.cy} r="10" fill="#EF9C82" stroke="#ffffff" strokeWidth="1.5" />
                <text x={a.cx} y={a.cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0F2422">{a.count}</text>
              </g>
            ))}

            {/* North arrow */}
            <g transform="translate(556 62)" pointerEvents="none">
              <text y="-34" textAnchor="middle" fontSize="13" fontWeight="700" fill="#16332F">N</text>
              <path d="M0 -26 L9 8 L0 2 L-9 8 Z" fill="#16332F" />
            </g>

            {/* Scale bar */}
            <g transform={`translate(24 ${MAP_H - 30})`} pointerEvents="none" fontSize="10" fill="#16332F">
              <rect x="0" y="0" width={barPx} height="6" fill="#16332F" />
              <rect x={barPx} y="0" width={barPx} height="6" fill="#ffffff" stroke="#16332F" strokeWidth="1" />
              <text x="0" y="19" textAnchor="middle">0</text>
              <text x={barPx} y="19" textAnchor="middle">100</text>
              <text x={barPx * 2} y="19" textAnchor="middle">200 km</text>
            </g>
          </svg>
        </div>

        <div className="space-y-3">
          <div className="card p-3">
            <h3 className="font-heading text-sm font-semibold text-ink dark:text-white mb-1">Map key</h3>
            <p className="text-xs text-slate-500 mb-3">Number of startups per region</p>
            <ul className="space-y-1.5">
              {CLASSES.map((c) => (
                <li key={c.label} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                  <span className="h-4 w-7 rounded-sm border border-slate-300" style={{ backgroundColor: c.color }} />
                  {c.label}
                </li>
              ))}
              <li className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 pt-1">
                <span className="h-5 w-5 rounded-full bg-accent-400 border border-white flex items-center justify-center text-[10px] font-bold text-primary-800">n</span>
                Startups in that region
              </li>
            </ul>
          </div>

          <div className="card p-3">
            {selArea ? (
              <>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-lg font-semibold text-primary-800 dark:text-white">{selArea.label}</h3>
                  <button onClick={() => setSel(null)} className="text-xs text-slate-400 hover:text-primary">Clear</button>
                </div>
                <p className="text-3xl font-bold text-primary mt-1">{selArea.count}</p>
                <p className="text-sm text-slate-500 mb-3">
                  {selArea.count === 1 ? 'startup' : 'startups'}
                  {total > 0 ? ` (${Math.round((selArea.count / total) * 100)}% of all mapped)` : ''}
                </p>
                {Object.keys(selArea.sectors).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(selArea.sectors).sort((a, b) => b[1] - a[1]).map(([s, n]) => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">{s} · {n}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No startups registered here yet.</p>
                )}
              </>
            ) : (
              <>
                <h3 className="font-heading text-sm font-semibold text-ink dark:text-white mb-3">Startups by region</h3>
                <ul className="space-y-2">
                  {ranked.slice(0, 5).map((a) => (
                    <li key={a.id}>
                      <button onClick={() => setSel(a.id)} className="w-full text-left">
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                          <span>{a.label}</span><span className="font-medium">{a.count}</span>
                        </div>
                        <div className="h-1.5 mt-1 rounded-full bg-slate-100 dark:bg-primary-700 overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${(a.count / leader.count) * 100}%` }} />
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-slate-400 mt-3">Select a region on the map to see its sectors.</p>
              </>
            )}
            {unassigned > 0 && (
              <p className="text-xs text-slate-400 mt-3">{unassigned} {unassigned === 1 ? 'startup has' : 'startups have'} no recognised region and {unassigned === 1 ? 'is' : 'are'} not shown.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
