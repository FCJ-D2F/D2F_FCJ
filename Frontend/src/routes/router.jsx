import React from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Login from '../pages/Login.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Alerts from '../pages/Alerts.jsx'
import Devices from '../pages/Devices.jsx'
import DeviceDetail from '../pages/DeviceDetail.jsx'
import Settings from '../pages/Settings.jsx'
import AppLayout from '../components/Layout/AppLayout.jsx'
import useAuth from '../stores/useAuth.js'

function RequireAuth() {
  const token = useAuth((s) => s.token)
  const location = useLocation()
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<RequireAuth />}>        
        <Route element={<AppLayout />}> 
          <Route index element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
