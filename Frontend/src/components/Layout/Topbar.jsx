import React from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../../stores/useAuth.js'
import Button from '../UI/Button.jsx'

export default function Topbar() {
  const appName = import.meta.env.VITE_APP_NAME || 'IoT Secure Monitor'
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)

  return (
    <div className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="px-4 md:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-lg flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-primary shadow-[0_0_20px_theme(colors.primary.DEFAULT)]"></span>
          {appName}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="secondary" onClick={logout}>Sign out</Button>
        </div>
      </div>
    </div>
  )
}
