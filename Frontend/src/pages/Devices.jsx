import React, { useMemo } from 'react'
import Card from '../components/UI/Card.jsx'
import Table from '../components/UI/Table.jsx'
import Badge from '../components/UI/Badge.jsx'
import Button from '../components/UI/Button.jsx'
import { useNavigate } from 'react-router-dom'
import useTelemetry from '../stores/useTelemetry.js'
import * as devicesAPI from '../api/devices-api.js'
import { useQuery } from '@tanstack/react-query'

export default function Devices() {
  const mqttDevices = useTelemetry((s) => s.byDevice)
  const navigate = useNavigate()

  // Fetch devices from API
  const { data: apiDevicesData, isLoading, refetch } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      try {
        const result = await devicesAPI.getDevices()
        return result.devices || []
      } catch (error) {
        console.error('Failed to fetch devices from API:', error)
        return []
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Combine MQTT devices (realtime) with API devices
  const rows = useMemo(() => {
    const apiDevices = apiDevicesData || []
    const mqttRows = Object.entries(mqttDevices).map(([id, list]) => {
      const last = list[list.length - 1]
      const status = Date.now() - (last?.ts || 0) < 60_000 ? 'ONLINE' : 'OFFLINE'
      return {
        id,
        lastTs: last?.ts,
        temp: last?.sensors?.temp,
        gas: last?.sensors?.gas,
        humidity: last?.sensors?.humidity,
        status,
        source: 'mqtt',
      }
    })

    const apiRows = apiDevices.map((device) => ({
      id: device.id || device.deviceId,
      lastTs: device.lastSeen || device.timestamp,
      temp: device.temperature || device.temp,
      gas: device.gas,
      humidity: device.humidity,
      status: device.status || (device.lastSeen && Date.now() - new Date(device.lastSeen).getTime() < 60_000 ? 'ONLINE' : 'OFFLINE'),
      source: 'api',
    }))

    // Merge: prefer API data, fallback to MQTT
    const merged = new Map()
    mqttRows.forEach(row => merged.set(row.id, row))
    apiRows.forEach(row => {
      if (merged.has(row.id)) {
        // Merge data
        const existing = merged.get(row.id)
        merged.set(row.id, { ...existing, ...row, source: 'both' })
      } else {
        merged.set(row.id, row)
      }
    })

    return Array.from(merged.values())
  }, [mqttDevices, apiDevicesData])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Devices</h1>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        {isLoading && rows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Loading devices...</div>
        ) : rows.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No devices found</div>
        ) : (
          <>
            <Table
              columns={[
                { key: 'id', header: 'Device ID' },
                { key: 'status', header: 'Status', render: (v) => <Badge tone={v === 'ONLINE' ? 'INFO' : 'MEDIUM'}>{v}</Badge> },
                { key: 'temp', header: 'Temp (°C)', render: (v) => v ? v.toFixed(1) : '—' },
                { key: 'gas', header: 'Gas (ppm)', render: (v) => v ? v.toFixed(1) : '—' },
                { key: 'humidity', header: 'Humidity (%)', render: (v) => v ? v.toFixed(1) : '—' },
                { key: 'lastTs', header: 'Last Seen', render: (v) => v ? new Date(v).toLocaleString() : '—' },
              ]}
              data={rows}
              onRowClick={(row) => navigate(`/devices/${row.id}`)}
            />
            <div className="text-xs text-muted-foreground mt-3">Click a row to view details.</div>
          </>
        )}
      </Card>
    </div>
  )
}
