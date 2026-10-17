import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import mintLogo from '../../assets/mint-logo.png'

// Edit the text here. Privacy and Terms must be supplied by the Ministry's legal team.
const PAGES = {
  '/about': {
    title: 'About Us',
    body: [
      'The Ministry of Innovation and Technology (MInT) AI Innovation Platform empowers Ethiopian innovators with AI-powered incubation and support for sustainable growth, from first idea to investor-ready company.',
    ],
  },
  '/privacy': {
    title: 'Privacy Policy',
    body: ['This policy is being finalized by the Ministry of Innovation and Technology and will be published here.'],
  },
  '/terms': {
    title: 'Terms of Service',
    body: ['These terms are being finalized by the Ministry of Innovation and Technology and will be published here.'],
  },
}

export default function InfoPage() {
  const { pathname } = useLocation()
  const page = PAGES[pathname] || PAGES['/about']
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/"><img src={mintLogo} alt="MInT" className="h-10 w-auto" /></Link>
          <Link to="/" className="text-sm text-primary font-medium">← Back to home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl font-semibold text-primary-800 mb-6">{page.title}</h1>
        {page.body.map((t, i) => (
          <p key={i} className="text-slate-600 leading-relaxed mb-4">{t}</p>
        ))}
      </main>
    </div>
  )
}
