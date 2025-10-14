import React from 'react'
import { Outlet } from 'react-router-dom'
import Topbar from './Topbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function AppLayout() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block bg-card/60 backdrop-blur border-r">
        <Sidebar />
      </aside>
      <main className="flex flex-col min-h-screen">
        <Topbar />
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
