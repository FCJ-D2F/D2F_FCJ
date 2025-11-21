import React from 'react'
import { NavLink } from 'react-router-dom'

const NavItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-xl transition-colors ${
        isActive ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
      }`
    }
  >
    {icon}
    <span>{label}</span>
  </NavLink>
)

export default function Sidebar() {
  return (
    <div className="p-4 space-y-2">
      <div className="px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground">Overview</div>
      <NavItem to="/" label="Dashboard" />
      <NavItem to="/alerts" label="Alerts" />
      <NavItem to="/devices" label="Devices" />
      <NavItem to="/reports" label="Reports" />
      <NavItem to="/notifications" label="Notifications" />
      <div className="px-4 py-3 text-xs uppercase tracking-widest text-muted-foreground mt-4">Settings</div>
      <NavItem to="/settings" label="Settings" />
    </div>
  )
}
