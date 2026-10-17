import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import mintLogo from '../../assets/mint-logo.png'

// Each section: { h: heading, p: [paragraphs], list: [numbered items], after: closing paragraph }
const PAGES = {
  '/about': {
    title: 'About Us',
    sections: [
      {
        p: [
          'The Ministry of Innovation and Technology (MInT) AI Innovation Platform empowers Ethiopian innovators with AI-powered incubation and support for sustainable growth, from first idea to investor-ready company.',
        ],
      },
    ],
  },

  '/contact': {
    title: 'Contact Us',
    sections: [
      {
        p: [
          'For support, profile corrections, record erasure requests, or any question about the Innovation Incubator Platform, email us at abdinegash41@gmail.com.',
        ],
      },
    ],
  },

  '/privacy': {
    title: 'Privacy Policy',
    sections: [
      {
        h: '1. Proclamation Compliance & Consent',
        p: [
          "This Privacy Policy is established in strict accordance with the Federal Democratic Republic of Ethiopia's Personal Data Protection Proclamation (No. 1321-2024). By registering, logging in, or submitting an application through this Innovation Incubator Platform, you provide your explicit, unambiguous, and voluntary consent to the Ministry of Innovation and Technology (MInT) to collect, process, transfer, and store your personal and professional data as outlined herein.",
        ],
      },
      {
        h: '2. Types of Personal Data Collected',
        p: ['The System collects and stores the following specific categories of data:'],
        list: [
          'Personal Identifiers: Full name and email address.',
          'Account Credentials: Your password and email verification status, used to create and secure your account.',
          'Professional Information: Your role, areas of expertise, and years of experience.',
        ],
      },
      {
        h: '3. Roles, Access Control, and Data Minimization',
        p: [
          'Access to data is governed by role-based access controls under a principle of necessity. The platform has three user roles:',
        ],
        list: [
          'Innovators: Authorized to view and modify their own profile data.',
          'Mentors: Authorized to view and modify their own profile data.',
          'Investors: Authorized to view and modify their own profile data.',
        ],
        after: "Information about other users is shown only to the extent required by the platform's features. Access by platform administrators is limited to what is necessary to operate and support the platform. No third-party entities are granted access to this database without formal ministerial approval.",
      },
      {
        h: '4. Data Retention, Erasure, and Subject Rights',
        p: [
          'In compliance with Proclamation No. 1321-2024, data subjects retain complete rights over their records. Sensitive information collected during the recruitment phase will be securely preserved for the duration of the incubation cycle. Upon formal completion or rejection of the application, all associated application files will be systematically purged or moved to an offline archive within 90 days. Users may formally submit requests for profile corrections or early record erasure via the Contact page (abdinegash41@gmail.com).',
        ],
      },
    ],
  },

  '/terms': {
    title: 'Terms of Service',
    sections: [
      {
        h: '1. Legal Boundaries & Computer Crime Compliance',
        p: [
          'These Terms of Service legally bind all users accessing the MInT Innovation Incubator Platform. This platform is governed entirely by the laws of the Federal Democratic Republic of Ethiopia, specifically including the Computer Crime Proclamation (No. 958-2016). Continued access to or usage of these services constitutes binding legal acceptance of these rules.',
        ],
      },
      {
        h: '2. Prohibition of System Misuse and Abuse',
        p: ['All users are strictly prohibited from engaging in the following system behaviors:'],
        list: [
          'Forgery: Providing false or misleading profile information, including falsified identity, expertise, or experience claims.',
          'Credential Sharing: Allowing unauthorized individuals to share, lease, or distribute system access credentials or verification tokens.',
          'Cyber Violations: Launching SQL injection attacks, distributing malware, executing unauthorized automated extraction, or attempting privilege escalation.',
        ],
        after: 'Violations will result in immediate termination of the application and referral to federal law enforcement under Proclamation No. 958-2016.',
      },
      {
        h: '3. Developer Intellectual Property & Infrastructure',
        p: [
          "All proprietary system architectures, database schemas, API configurations, and compiled source code elements utilized to launch this application remain under protected intellectual property frameworks. Users are explicitly barred from reverse-engineering, copying, scraping, or redistributing the structural software components powering this platform without express written authorization from the platform's rightful developers and deployment engineers.",
        ],
      },
      {
        h: '4. Governing Jurisdiction and Dispute Resolution',
        p: [
          'Any legal claims, operational grievances, or data disputes arising directly out of the usage or performance of this application shall be interpreted and governed exclusively under the jurisdiction of the federal courts of the Federal Democratic Republic of Ethiopia in Addis Ababa. If any provision of these terms is deemed unlawful by a court of competent authority, the remaining sections will continue to hold full legal force and effect.',
        ],
      },
    ],
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
        <h1 className="font-heading text-3xl font-semibold text-primary-800 mb-8">{page.title}</h1>
        {page.sections.map((s, i) => (
          <section key={i} className="mb-8">
            {s.h && <h2 className="text-lg font-semibold text-ink mb-3">{s.h}</h2>}
            {s.p && s.p.map((t, j) => (
              <p key={j} className="text-slate-600 leading-relaxed mb-3">{t}</p>
            ))}
            {s.list && (
              <ol className="list-decimal pl-6 space-y-2 text-slate-600 leading-relaxed mb-3">
                {s.list.map((li, k) => <li key={k}>{li}</li>)}
              </ol>
            )}
            {s.after && <p className="text-slate-600 leading-relaxed">{s.after}</p>}
          </section>
        ))}
      </main>
    </div>
  )
}
