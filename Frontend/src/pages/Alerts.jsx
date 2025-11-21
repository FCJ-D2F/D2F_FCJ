import React, { useMemo, useState } from 'react'
import Card from '../components/UI/Card.jsx'
import Table from '../components/UI/Table.jsx'
import Badge from '../components/UI/Badge.jsx'
import Input from '../components/UI/Input.jsx'
import Button from '../components/UI/Button.jsx'
import useTelemetry from '../stores/useTelemetry.js'
import * as alertsAPI from '../api/alerts-api.js'
import { useQuery, useMutation } from '@tanstack/react-query'

export default function Alerts() {
  const mqttAlerts = useTelemetry((s) => s.alerts)
  const [severity, setSeverity] = useState('')
  const [deviceId, setDeviceId] = useState('')
  const [searchMessage, setSearchMessage] = useState('')

  // Fetch alerts from API
  const { data: apiAlertsData, isLoading, refetch } = useQuery({
    queryKey: ['alerts', deviceId, severity],
    queryFn: async () => {
      try {
        const result = await alertsAPI.getAlerts(deviceId || undefined, severity || undefined, 100)
        return result.alerts || []
      } catch (error) {
        console.error('Failed to fetch alerts from API:', error)
        return []
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Combine MQTT alerts (realtime) with API alerts
  const allAlerts = useMemo(() => {
    const apiAlerts = apiAlertsData || []
    const combined = [...mqttAlerts, ...apiAlerts]
    // Remove duplicates by timestamp + deviceId + message
    const unique = combined.reduce((acc, alert) => {
      const key = `${alert.ts}-${alert.deviceId}-${alert.message}`
      if (!acc.has(key)) {
        acc.set(key, alert)
      }
      return acc
    }, new Map())
    return Array.from(unique.values()).sort((a, b) => (b.ts || 0) - (a.ts || 0))
  }, [mqttAlerts, apiAlertsData])

  const filtered = useMemo(() => allAlerts.filter((a) => {
    if (severity && a.severity !== severity) return false
    if (deviceId && a.deviceId !== deviceId) return false
    if (searchMessage && !a.message?.toLowerCase().includes(searchMessage.toLowerCase())) return false
    return true
  }), [allAlerts, severity, deviceId, searchMessage])

  const deviceOptions = Array.from(new Set(allAlerts.map(a => a.deviceId).filter(Boolean)))

  const markReadMutation = useMutation({
    mutationFn: async (id) => {
      return alertsAPI.markAlertRead(id)
    },
    onSuccess: () => {
      refetch()
    },
  })

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Severity</div>
            <select className="w-full rounded-xl border bg-background px-3 py-2 text-sm" value={severity} onChange={(e)=>setSeverity(e.target.value)}>
              <option value="">All</option>
              <option>LOW</option>
              <option>MEDIUM</option>
              <option>HIGH</option>
              <option>INFO</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Device</div>
            <select className="w-full rounded-xl border bg-background px-3 py-2 text-sm" value={deviceId} onChange={(e)=>setDeviceId(e.target.value)}>
              <option value="">All</option>
              {deviceOptions.map(id => <option key={id}>{id}</option>)}
            </select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Search message</div>
            <Input 
              placeholder="contains..." 
              value={searchMessage}
              onChange={(e) => setSearchMessage(e.target.value)} 
            />
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {filtered.length} alert{filtered.length !== 1 ? 's' : ''}
          </div>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        {isLoading && filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Loading alerts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No alerts found</div>
        ) : (
          <Table
            columns={[
              { key: 'ts', header: 'Time', render: (v) => v ? new Date(v).toLocaleString() : '—' },
              { key: 'deviceId', header: 'Device' },
              { key: 'type', header: 'Type' },
              { key: 'severity', header: 'Severity', render: (v) => <Badge tone={v}>{v || 'INFO'}</Badge> },
              { key: 'message', header: 'Message' },
              {
                key: 'actions',
                header: 'Actions',
                render: (_, row) => (
                  row.id ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => markReadMutation.mutate(row.id)}
                      disabled={markReadMutation.isPending}
                    >
                      Mark Read
                    </Button>
                  ) : null
                ),
              },
            ]}
            data={filtered}
          />
        )}
      </Card>
    </div>
  )
}
