import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useTheme } from '../context/ThemeContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function Header({ onMenuClick }) {
  const { dark, toggleDark } = useTheme()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-4 px-4 sm:px-6 bg-white/90 dark:bg-primary-900/90 backdrop-blur border-b border-slate-100 dark:border-primary-700">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 text-slate-500">
        <Bars3Icon className="h-6 w-6" />
      </button>
      <div className="flex-1 max-w-xl relative hidden sm:block">
        <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search startups, mentors, grants..."
          className="input pl-10"
        />
      </div>
      <div className="flex-1 sm:hidden" />
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-primary-700 dark:text-slate-300"
          aria-label="Toggle dark mode"
        >
          {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-primary-700 dark:text-slate-300">
          <BellIcon className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 pl-2"
          >
            <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              {(user?.name || 'IL').split(' ').map((p) => p[0]).slice(0, 2).join('')}
            </div>
            <ChevronDownIcon className="h-4 w-4 text-slate-400 hidden sm:block" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 card p-1.5 text-sm">
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-primary-700"
              >
                My Profile
              </Link>
              <button
                onClick={logout}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-primary-700"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
