import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Squares2X2Icon,
  LightBulbIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  BanknotesIcon,
  ChartBarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline'
import mintLogo from '../assets/mint-logo.png'
import { useAuth } from '../context/AuthContext.jsx'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: Squares2X2Icon, roles: ['founder', 'mentor', 'investor', 'admin'] },
  { to: '/startups', label: 'Startups', icon: RocketLaunchIcon, roles: ['founder', 'admin'] },
  { to: '/idea-submission', label: 'Submit Idea', icon: LightBulbIcon, roles: ['founder'] },
  { to: '/evaluate', label: 'AI Evaluation', icon: SparklesIcon, roles: ['founder'] },
  { to: '/workspace', label: 'Workspace', icon: RectangleGroupIcon, roles: ['founder', 'admin'] },
  { to: '/prototype', label: 'Prototype', icon: RocketLaunchIcon, roles: ['founder', 'admin'] },
  { to: '/recommendations', label: 'AI Recommendations', icon: SparklesIcon, roles: ['founder'] },
  { to: '/mentors', label: 'Find a Mentor', icon: UserGroupIcon, roles: ['founder', 'mentor', 'admin'] },
  { to: '/funding', label: 'Funding & Grants', icon: BanknotesIcon, roles: ['founder', 'investor'] },
  { to: '/analytics', label: 'Analytics', icon: ChartBarIcon, roles: ['founder', 'admin'] },
  { to: '/chatbot', label: 'AI Assistant', icon: ChatBubbleLeftRightIcon, roles: ['founder'] },
  { to: '/admin', label: 'Admin', icon: ShieldCheckIcon, roles: ['admin'] },
]

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth()
  const role = String(user?.role || '').toLowerCase()
  const visibleNav = nav.filter((item) => item.roles.includes(role))

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-primary-800 dark:bg-primary-900 text-white flex flex-col z-40 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10 shrink-0">
          <img src={mintLogo} alt="MInT" className="h-9 w-auto bg-white rounded-md p-1" />
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10 text-xs text-slate-400">
          Innovation Incubator Platform
        </div>
      </aside>
    </>
  )
}
