import React from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import ForgotPassword from '../pages/ForgotPassword.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Alerts from '../pages/Alerts.jsx'
import Devices from '../pages/Devices.jsx'
import DeviceDetail from '../pages/DeviceDetail.jsx'
import Settings from '../pages/Settings.jsx'
import Reports from '../pages/Reports.jsx'
import Notifications from '../pages/Notifications.jsx'
import AppLayout from '../components/Layout/AppLayout.jsx'
import useAuth from '../stores/useAuth.js'

function RequireAuth() {
  const accessToken = useAuth((s) => s.accessToken)
  const location = useLocation()
  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<RequireAuth />}>        
        <Route element={<AppLayout />}> 
          <Route index element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/devices/:id" element={<DeviceDetail />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
