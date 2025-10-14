import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/UI/Card.jsx'
import Button from '../components/UI/Button.jsx'
import Table from '../components/UI/Table.jsx'
import Badge from '../components/UI/Badge.jsx'
import useTelemetry from '../stores/useTelemetry.js'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function DeviceDetail() {
  const { id } = useParams()
  const telemetry = useTelemetry((s) => s.byDevice[id] || [])
  const alerts = useTelemetry((s) => s.alerts.filter(a => a.deviceId === id))

  const tempData = useMemo(() => telemetry.map(t => ({ ts: t.ts, temp: t.sensors?.temp })), [telemetry])
  const gasData = useMemo(() => telemetry.map(t => ({ ts: t.ts, gas: t.sensors?.gas })), [telemetry])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Device {id}</h1>
        <Button disabled>Send Command</Button>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-3 text-sm text-muted-foreground">Temperature</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tempData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="ts" tickFormatter={(v)=>new Date(v).toLocaleTimeString()} hide />
                <YAxis domain={[0, 'auto']} />
                <Tooltip labelFormatter={(v)=>new Date(v).toLocaleTimeString()} />
                <Line type="monotone" dataKey="temp" stroke="#38bdf8" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 text-sm text-muted-foreground">Gas</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gasData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                <XAxis dataKey="ts" tickFormatter={(v)=>new Date(v).toLocaleTimeString()} hide />
                <YAxis domain={[0, 'auto']} />
                <Tooltip labelFormatter={(v)=>new Date(v).toLocaleTimeString()} />
                <Line type="monotone" dataKey="gas" stroke="#22c55e" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="mb-3 text-sm text-muted-foreground">Alerts</div>
        <Table
          columns={[
            { key: 'ts', header: 'Time', render: (v) => new Date(v).toLocaleString() },
            { key: 'type', header: 'Type' },
            { key: 'severity', header: 'Severity', render: (v) => <Badge tone={v}>{v}</Badge> },
            { key: 'message', header: 'Message' },
          ]}
          data={alerts}
        />
      </Card>
    </div>
  )
}
