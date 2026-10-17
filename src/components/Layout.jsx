import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-surface dark:bg-primary-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
