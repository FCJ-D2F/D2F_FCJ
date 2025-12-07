import React from 'react'
import { Link, NavLink } from 'react-router-dom'
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

        {/* Mobile nav */}
        <div className="flex items-center gap-3">
          <details className="lg:hidden">
            <summary className="cursor-pointer px-3 py-1 rounded-lg border text-sm text-muted-foreground hover:text-foreground hover:border-primary/60">
              Menu
            </summary>
            <div className="absolute right-4 mt-2 w-48 rounded-xl border bg-background shadow-lg p-2 space-y-1 z-40">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm ${
                    isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/alerts"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm ${
                    isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60'
                  }`
                }
              >
                Alerts
              </NavLink>
              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm ${
                    isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60'
                  }`
                }
              >
                Reports
              </NavLink>
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm ${
                    isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60'
                  }`
                }
              >
                Notifications
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm ${
                    isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/60'
                  }`
                }
              >
                Settings
              </NavLink>
            </div>
          </details>

          <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
          <Button variant="secondary" onClick={logout}>Sign out</Button>
        </div>
      </div>
    </div>
  )
}
