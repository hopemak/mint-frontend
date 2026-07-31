import React from 'react'
import { Link } from 'react-router-dom'
import {
  ChartBarSquareIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  LightBulbIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import mintLogo from '../../assets/mint-logo.png'
import heroAi from '../../assets/hero-ai.png'
import partnerVisa from '../../assets/partner-visa.png'
import partnerEthioTelecom from '../../assets/partner-ethiotelecom.jpg'
import partnerGebeya from '../../assets/partner-gebeya.png'
import partnerClaude from '../../assets/partner-claude.png'
import partnerCursor from '../../assets/partner-cursor.png'

const partnerLogos = [
  { name: 'Visa', src: partnerVisa },
  { name: 'ethio telecom', src: partnerEthioTelecom },
  { name: 'Gebeya', src: partnerGebeya },
  { name: 'Claude', src: partnerClaude },
  { name: 'Cursor AI', src: partnerCursor },
]

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/#features' },
  { label: 'Programs', to: '/#programs' },
  { label: 'Startups', to: '/#startups' },
  { label: 'Mentors', to: '/#mentors' },
  { label: 'Funding', to: '/#funding' },
  { label: 'Contact', to: '/#contact' },
]

const stats = [
  { value: '150+', label: 'Startups Incubated' },
  { value: '$25M+', label: 'Total Funding Raised' },
  { value: '300+', label: 'Active Mentors' },
]

const whyChoose = [
  {
    icon: ChartBarSquareIcon,
    title: 'AI-Powered Insights',
    body: 'Leverage advanced analytics for informed decision-making and rapid growth.',
    tone: 'bg-primary-600 text-white',
  },
  {
    icon: DocumentTextIcon,
    title: 'Structured Incubator Programs',
    body: 'Access tailor-made programs and comprehensive resources from ideation to launch.',
    tone: 'bg-primary-400 text-white',
  },
  {
    icon: UserGroupIcon,
    title: 'Vast Mentor Network',
    body: 'Connect with experienced industry experts and leaders for personalized guidance.',
    tone: 'bg-accent-500 text-white',
  },
]

const aiFeatures = [
  {
    icon: ChartBarIcon,
    title: 'Predictive Matchmaking',
    body: 'AI matches startups with ideal mentors and potential investors.',
    tone: 'bg-primary-700',
  },
  {
    icon: DocumentTextIcon,
    title: 'Automated Reporting',
    body: 'Streamlined reporting and progress tracking for data-driven decisions.',
    tone: 'bg-primary-500',
  },
  {
    icon: LightBulbIcon,
    title: 'Innovation Intelligence',
    body: 'Discover market trends and competitive insights using AI algorithms.',
    tone: 'bg-accent-500',
  },
]

const testimonials = [
  {
    name: 'Amanuel Girma',
    company: 'InnovateTech',
    quote: 'MInT matched us with the right mentor within a week and got us funding-ready in two months.',
  },
  {
    name: 'Selamawit Bekele',
    company: 'BioGenesis Labs',
    quote: 'The AI evaluation gave us clarity on our weaknesses before investors ever saw the pitch.',
  },
  {
    name: 'Dawit Alemu',
    company: 'FutureMakers',
    quote: 'We went from an idea submission to a working prototype faster than we thought possible.',
  },
]

const featured = [
  { name: 'InnovateTech', sector: 'Enterprise AI', progress: 82, rating: 4.9, color: 'bg-primary-600' },
  { name: 'BioGenesis Labs', sector: 'HealthTech', progress: 64, rating: 4.8, color: 'bg-primary-400' },
  { name: 'FutureMakers', sector: 'EdTech', progress: 91, rating: 4.9, color: 'bg-accent-500' },
]

export default function Landing() {
  return (
    <div className="bg-white text-ink font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <img src={mintLogo} alt="MInT — Ministry of Innovation and Technology" className="h-10 w-auto" />
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-600">
            {navLinks.map((l) => (
              <a key={l.label} href={l.to} className="hover:text-primary transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-outline">Sign In</Link>
            <Link to="/register" className="btn-primary">Register</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold leading-tight text-primary-800">
            AI Innovation Platform
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-lg">
            Empowering Ethiopian innovators with AI-powered incubation and support for
            sustainable growth — from first idea to investor-ready company.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">
              Get Started
            </Link>
            <a href="#programs" className="btn-outline px-6 py-3 text-base">
              Explore Programs
            </a>
          </div>
        </div>
        <div className="relative rounded-2xl bg-gradient-to-br from-primary-700 to-primary-900 aspect-square lg:aspect-[4/3] flex items-center justify-center overflow-hidden p-6">
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(239,156,130,0.5), transparent 40%), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15), transparent 45%)'
          }} />
          <img src={heroAi} alt="AI-powered innovation platform" className="relative z-10 w-full h-full object-contain drop-shadow-2xl" />
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid sm:grid-cols-3 gap-5">
          {stats.map((s) => (
            <div key={s.label} className="card p-8 text-center">
              <p className="font-heading text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent-500 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-sm text-slate-500 mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partner organizations */}
      <section className="border-y border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-400 mb-6">
            Partner Organization Logos
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition shrink-0">
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
              {partnerLogos.map((p) => (
                <img
                  key={p.name}
                  src={p.src}
                  alt={p.name}
                  className="h-9 sm:h-10 w-auto object-contain grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition"
                />
              ))}
            </div>
            <button className="p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-primary hover:border-primary transition shrink-0">
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section id="features" className="bg-surface py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-semibold text-primary-800">Why Choose Us</h2>
            <p className="text-slate-500 mt-2">Leverage sustained innovations of this program.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {whyChoose.map((f) => (
              <div key={f.title} className="card p-6">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${f.tone}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-heading font-semibold text-ink mb-1.5">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success stories */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl font-semibold text-primary-800">Success Stories</h2>
          <p className="text-slate-500 mt-2">Testimonials from successful startups.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <p className="text-sm text-slate-600 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                  {t.name.split(' ').map((p) => p[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.company}</p>
                </div>
              </div>
              <button className="text-xs text-primary font-medium">Testimonial →</button>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-8">
          <span className="h-2 w-6 rounded-full bg-primary" />
          <span className="h-2 w-2 rounded-full bg-slate-200" />
          <span className="h-2 w-2 rounded-full bg-slate-200" />
        </div>
      </section>

      {/* Featured startups */}
      <section id="startups" className="bg-primary-800 py-20 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl font-semibold">Featured Startups</h2>
            <p className="text-slate-300 mt-2">Showcasing prominent startups in the program.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featured.map((s) => (
              <div key={s.name} className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className={`h-1.5 ${s.color}`} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`h-11 w-11 rounded-lg ${s.color} flex items-center justify-center font-heading font-bold`}>
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-accent-400">★ {s.rating}</span>
                  </div>
                  <h3 className="font-heading font-semibold mb-1">{s.name}</h3>
                  <p className="text-sm text-slate-300 mb-4">{s.sector}</p>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${s.progress}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{s.progress}% Progress</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-8">
            <span className="h-2 w-6 rounded-full bg-white" />
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="h-2 w-2 rounded-full bg-white/30" />
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl font-semibold text-primary-800">AI Features</h2>
          <p className="text-slate-500 mt-2">Unique standout capabilities of the platform.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5">
          {aiFeatures.map((f) => (
            <div key={f.title} className={`rounded-2xl p-6 text-white ${f.tone}`}>
              <div className="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-white/80 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-start justify-between gap-8 text-sm mb-10">
          <div className="grid sm:grid-cols-4 gap-8 flex-1">
            <div>
              <img src={mintLogo} alt="MInT" className="h-9 w-auto mb-3" />
              <p className="text-slate-500">Innovation Incubator Platform</p>
            </div>
            <div>
              <p className="font-medium text-ink mb-3">Company</p>
              <ul className="space-y-2 text-slate-500">
                <li>About Us</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-ink mb-3">Resources</p>
              <ul className="space-y-2 text-slate-500">
                <li>Blog</li>
                <li>Help Center</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-ink mb-3">Legal</p>
              <ul className="space-y-2 text-slate-500">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2.5 shrink-0">
            {['F', 'X', 'Y', 'I'].map((l) => (
              <span key={l} className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-semibold">
                {l}
              </span>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-6 border-t border-slate-100">
          <p>© 2026 Ministry of Innovation and Technology. All rights reserved.</p>
          <p>AI Innovation Platform — Design and Development by MInT Digital Team</p>
        </div>
      </footer>
    </div>
  )
}
