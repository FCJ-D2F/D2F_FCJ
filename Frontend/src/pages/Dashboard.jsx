import React, { useEffect, useMemo } from 'react'
import Card from '../components/UI/Card.jsx'
import Stat from '../components/UI/Stat.jsx'
import Table from '../components/UI/Table.jsx'
import Badge from '../components/UI/Badge.jsx'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import useTelemetry from '../stores/useTelemetry.js'
import { connectMqtt, isMqttConnected, parseTopics } from '../realtime/mqttClient.js'

export default function Dashboard() {
  const byDevice = useTelemetry((s) => s.byDevice)
  const alerts = useTelemetry((s) => s.alerts)

  useEffect(() => {
    if (!isMqttConnected()) {
      const url = import.meta.env.VITE_MQTT_URL
      const topics = parseTopics(import.meta.env.VITE_DEFAULT_TOPICS)
      if (url && topics.length) connectMqtt(url, topics)
    }
  }, [])

  const allTelemetry = useMemo(() => {
    const arr = Object.values(byDevice).flat()
    return arr.sort((a, b) => a.ts - b.ts).slice(-200)
  }, [byDevice])

  const tempData = allTelemetry.map((t) => ({ ts: t.ts, temp: t.sensors?.temp }))
  const gasData = allTelemetry.map((t) => ({ ts: t.ts, gas: t.sensors?.gas }))

  const onlineDevices = Object.keys(byDevice).length
  const lastAlert = alerts[0]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Stat label="Devices Online" value={onlineDevices} />
        <Stat label="Last Alert Severity" value={lastAlert?.severity || '—'} trend={lastAlert?.type} />
        <Stat label="Total Alerts" value={alerts.length} />
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
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Last 5 alerts</div>
        </div>
        <Table
          columns={[
            { key: 'ts', header: 'Time', render: (v) => new Date(v).toLocaleTimeString() },
            { key: 'deviceId', header: 'Device' },
            { key: 'type', header: 'Type' },
            { key: 'severity', header: 'Severity', render: (v) => <Badge tone={v}>{v}</Badge> },
          ]}
          data={alerts.slice(0, 5)}
        />
      </Card>
    </div>
  )
}
