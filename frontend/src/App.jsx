/**
 * App.jsx
 * Root component — sets up Router, Context, and the top-level layout.
 */

import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { GAProvider } from './context/GAContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Simulation from './pages/Simulation'
import Results from './pages/Results'

export default function App() {
  return (
    <GAProvider>
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/upload"    element={<Upload />} />
            <Route path="/simulate"  element={<Simulation />} />
            <Route path="/results"   element={<Results />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="text-center text-xs text-gray-600 py-4 border-t border-gray-900">
          GA Feature Selection System 
        </footer>
      </div>
    </GAProvider>
  )
}
