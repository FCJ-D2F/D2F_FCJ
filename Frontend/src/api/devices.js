import { useQuery } from '@tanstack/react-query'
import useTelemetry from '../stores/useTelemetry.js'

export function useDevices() {
  const keys = Object.keys(useTelemetry((s) => s.byDevice))
  return useQuery({
    queryKey: ['devices', keys.join('|')],
    queryFn: async () => (keys.length ? keys : ['dev-001', 'dev-002', 'dev-003']),
    staleTime: 1000,
  })
}

export function useDevice(id) {
  const data = useTelemetry((s) => s.byDevice[id] || [])
  return useQuery({
    queryKey: ['device', id, data.length],
    queryFn: async () => ({ id, telemetry: data }),
    staleTime: 1000,
  })
}
