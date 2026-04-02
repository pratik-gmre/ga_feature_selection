/**
 * components/Navbar.jsx
 * Top navigation bar with active-route highlighting.
 */

import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Dna, Upload, Activity, BarChart2, ChevronRight } from 'lucide-react'
import { useGA } from '../context/GAContext'

const NAV_ITEMS = [
  { to: '/',         label: 'Home',       icon: Dna },
  { to: '/upload',   label: 'Upload',     icon: Upload },
  { to: '/simulate', label: 'Simulation', icon: Activity },
  { to: '/results',  label: 'Results',    icon: BarChart2 },
]

const STATUS_COLORS = {
  idle:        'bg-gray-600',
  initialized: 'bg-yellow-500',
  running:     'bg-brand-400 blink',
  done:        'bg-accent-400',
  error:       'bg-red-500',
}

export default function Navbar() {
  const { status, sessionId } = useGA()


  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <div  className="flex items-center gap-2 shrink-0">
          <Dna size={20} className="text-brand-400" />
          <span   className="font-semibold text-sm hover:cursor-pointer text-gray-100 tracking-wide hidden sm:block">
            GA Feature Selector
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive
                   ? 'bg-brand-600 text-white'
                   : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                 }`
              }
            >
              <Icon size={14} />
              <span className="hidden sm:block">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Status pill */}
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
          <span
            className={`w-2 h-2 rounded-full ${STATUS_COLORS[status] ?? 'bg-gray-600'}`}
          />
          <span className="capitalize hidden sm:block">{status}</span>
          {sessionId && (
            <span className="font-mono text-gray-600 hidden md:block">
              {sessionId.slice(0, 8)}…
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
