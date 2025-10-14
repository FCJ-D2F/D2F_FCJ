import React, { useMemo, useState } from 'react'
import Card from '../components/UI/Card.jsx'
import Table from '../components/UI/Table.jsx'
import Badge from '../components/UI/Badge.jsx'
import Input from '../components/UI/Input.jsx'
import useTelemetry from '../stores/useTelemetry.js'

export default function Alerts() {
  const alerts = useTelemetry((s) => s.alerts)
  const [severity, setSeverity] = useState('')
  const [deviceId, setDeviceId] = useState('')

  const filtered = useMemo(() => alerts.filter((a) => {
    if (severity && a.severity !== severity) return false
    if (deviceId && a.deviceId !== deviceId) return false
    return true
  }), [alerts, severity, deviceId])

  const deviceOptions = Array.from(new Set(alerts.map(a => a.deviceId)))

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
            <Input placeholder="contains..." onChange={()=>{}} />
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <Table
          columns={[
            { key: 'ts', header: 'Time', render: (v) => new Date(v).toLocaleString() },
            { key: 'deviceId', header: 'Device' },
            { key: 'type', header: 'Type' },
            { key: 'severity', header: 'Severity', render: (v) => <Badge tone={v}>{v}</Badge> },
            { key: 'message', header: 'Message' },
          ]}
          data={filtered}
        />
      </Card>
    </div>
  )
}
