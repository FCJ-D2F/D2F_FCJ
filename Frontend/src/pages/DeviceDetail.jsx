import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Card from '../components/UI/Card.jsx'
import Button from '../components/UI/Button.jsx'
import Table from '../components/UI/Table.jsx'
import Badge from '../components/UI/Badge.jsx'
import useTelemetry from '../stores/useTelemetry.js'
import * as devicesAPI from '../api/devices-api.js'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

export default function DeviceDetail() {
  const { id } = useParams()
  const [command, setCommand] = useState('')
  const [commandValue, setCommandValue] = useState('')
  
  const mqttTelemetry = useTelemetry((s) => s.byDevice[id] || [])
  const mqttAlerts = useTelemetry((s) => s.alerts.filter(a => a.deviceId === id))

  // Fetch device details and history from API
  const { data: deviceData } = useQuery({
    queryKey: ['device', id],
    queryFn: async () => {
      try {
        return await devicesAPI.getDevice(id)
      } catch (error) {
        console.error('Failed to fetch device:', error)
        return null
      }
    },
  })

  const { data: historyData } = useQuery({
    queryKey: ['deviceHistory', id],
    queryFn: async () => {
      try {
        const result = await devicesAPI.getDeviceHistory(id)
        return result.history || []
      } catch (error) {
        console.error('Failed to fetch device history:', error)
        return []
      }
    },
    refetchInterval: 30000,
  })

  // Combine MQTT and API telemetry
  const allTelemetry = useMemo(() => {
    const apiTelemetry = (historyData || []).map(item => ({
      ts: new Date(item.timestamp || item.ts).getTime(),
      sensors: {
        temp: item.temperature || item.temp,
        gas: item.gas,
        humidity: item.humidity,
      },
    }))
    return [...mqttTelemetry, ...apiTelemetry].sort((a, b) => a.ts - b.ts)
  }, [mqttTelemetry, historyData])

  const tempData = useMemo(() => allTelemetry.map(t => ({ ts: t.ts, temp: t.sensors?.temp })), [allTelemetry])
  const gasData = useMemo(() => allTelemetry.map(t => ({ ts: t.ts, gas: t.sensors?.gas })), [allTelemetry])
  const humidityData = useMemo(() => allTelemetry.map(t => ({ ts: t.ts, humidity: t.sensors?.humidity })), [allTelemetry])

  const sendCommandMutation = useMutation({
    mutationFn: async () => {
      return devicesAPI.sendDeviceCommand(id, command, commandValue || undefined)
    },
    onSuccess: () => {
      alert('Command sent successfully!')
      setCommand('')
      setCommandValue('')
    },
    onError: (error) => {
      alert(`Failed to send command: ${error.message}`)
    },
  })

  const handleSendCommand = () => {
    if (!command) {
      alert('Please select a command')
      return
    }
    if (confirm(`Send command "${command}" to device ${id}?`)) {
      sendCommandMutation.mutate()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Device {id}</h1>
        <div className="flex gap-2">
          <select
            className="rounded-xl border bg-background px-3 py-2 text-sm"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
          >
            <option value="">Select command...</option>
            <option value="on">Turn On</option>
            <option value="off">Turn Off</option>
            <option value="reset">Reset</option>
            <option value="calibrate">Calibrate</option>
          </select>
          {command && (
            <input
              type="text"
              placeholder="Value (optional)"
              className="rounded-xl border bg-background px-3 py-2 text-sm"
              value={commandValue}
              onChange={(e) => setCommandValue(e.target.value)}
            />
          )}
          <Button
            onClick={handleSendCommand}
            disabled={!command || sendCommandMutation.isPending}
          >
            {sendCommandMutation.isPending ? 'Sending...' : 'Send Command'}
          </Button>
        </div>
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
        <div className="mb-3 text-sm text-muted-foreground">Humidity</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={humidityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis dataKey="ts" tickFormatter={(v)=>new Date(v).toLocaleTimeString()} hide />
              <YAxis domain={[0, 100]} />
              <Tooltip labelFormatter={(v)=>new Date(v).toLocaleTimeString()} />
              <Line type="monotone" dataKey="humidity" stroke="#3b82f6" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <div className="mb-3 text-sm text-muted-foreground">Alerts</div>
        {mqttAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No alerts for this device</div>
        ) : (
          <Table
            columns={[
              { key: 'ts', header: 'Time', render: (v) => v ? new Date(v).toLocaleString() : '—' },
              { key: 'type', header: 'Type' },
              { key: 'severity', header: 'Severity', render: (v) => <Badge tone={v}>{v || 'INFO'}</Badge> },
              { key: 'message', header: 'Message' },
            ]}
            data={mqttAlerts}
          />
        )}
      </Card>
    </div>
  )
}
