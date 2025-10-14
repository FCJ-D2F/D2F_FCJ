import { useMemo } from 'react'
import useTelemetry from '../stores/useTelemetry.js'

export function useAlerts(filters = {}) {
  const alerts = useTelemetry((s) => s.alerts)
  const data = useMemo(() => {
    return alerts.filter((a) => {
      if (filters.severity && a.severity !== filters.severity) return false
      if (filters.deviceId && a.deviceId !== filters.deviceId) return false
      return true
    })
  }, [alerts, filters.severity, filters.deviceId])

  return { data }
}
