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

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon: Squares2X2Icon },
  { to: '/startups', label: 'Startups', icon: RocketLaunchIcon },
  { to: '/idea-submission', label: 'Submit Idea', icon: LightBulbIcon },
  { to: '/evaluate', label: 'AI Evaluation', icon: SparklesIcon },
  { to: '/workspace', label: 'Workspace', icon: RectangleGroupIcon },
  { to: '/prototype', label: 'Prototype', icon: RocketLaunchIcon },
  { to: '/recommendations', label: 'AI Recommendations', icon: SparklesIcon },
  { to: '/mentors', label: 'Find a Mentor', icon: UserGroupIcon },
  { to: '/funding', label: 'Funding & Grants', icon: BanknotesIcon },
  { to: '/analytics', label: 'Analytics', icon: ChartBarIcon },
  { to: '/chatbot', label: 'AI Assistant', icon: ChatBubbleLeftRightIcon },
  { to: '/admin', label: 'Admin', icon: ShieldCheckIcon },
]

export default function Sidebar({ open, onClose }) {
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
          {nav.map((item) => (
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
