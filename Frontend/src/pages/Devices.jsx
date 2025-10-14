import React from 'react'
import Card from '../components/UI/Card.jsx'
import Table from '../components/UI/Table.jsx'
import Badge from '../components/UI/Badge.jsx'
import { useNavigate } from 'react-router-dom'
import useTelemetry from '../stores/useTelemetry.js'

export default function Devices() {
  const byDevice = useTelemetry((s) => s.byDevice)
  const navigate = useNavigate()

  const rows = Object.entries(byDevice).map(([id, list]) => {
    const last = list[list.length - 1]
    const status = Date.now() - (last?.ts || 0) < 60_000 ? 'ONLINE' : 'OFFLINE'
    return { id, lastTs: last?.ts, temp: last?.sensors?.temp, gas: last?.sensors?.gas, status }
  })

  return (
    <Card className="p-4">
      <Table
        columns={[
          { key: 'id', header: 'Device' },
          { key: 'status', header: 'Status', render: (v)=> <Badge tone={v==='ONLINE'?'INFO':'MEDIUM'}>{v}</Badge> },
          { key: 'temp', header: 'Temp (°C)' },
          { key: 'gas', header: 'Gas (ppm)' },
          { key: 'lastTs', header: 'Last Seen', render: (v)=> v? new Date(v).toLocaleString() : '—' },
        ]}
        data={rows}
        onRowClick={(row)=> navigate(`/devices/${row.id}`)}
      />
      <div className="text-xs text-muted-foreground mt-3">Click a row to view details.</div>
    </Card>
  )
}
