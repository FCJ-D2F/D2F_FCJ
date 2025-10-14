import React, { useEffect, useState } from 'react'
import Card from '../components/UI/Card.jsx'
import Button from '../components/UI/Button.jsx'
import useTelemetry from '../stores/useTelemetry.js'

export default function Settings() {
  const [dark, setDark] = useState(true)
  const clear = useTelemetry((s) => s.clear)

  useEffect(() => {
    if (dark) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [dark])

  const onClear = () => {
    clear()
    localStorage.clear()
    location.reload()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">Appearance</div>
        <div className="flex items-center justify-between">
          <div>Dark mode</div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={dark} onChange={(e)=>setDark(e.target.checked)} />
            <span className="text-sm text-muted-foreground">{dark? 'On':'Off'}</span>
          </label>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">Environment</div>
        <div className="space-y-2 text-sm">
          <div><span className="text-muted-foreground">MQTT URL:</span> {import.meta.env.VITE_MQTT_URL || 'not set'}</div>
          <div><span className="text-muted-foreground">Topics:</span> {import.meta.env.VITE_DEFAULT_TOPICS || 'not set'}</div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="text-sm text-muted-foreground mb-2">Danger zone</div>
        <Button variant="secondary" onClick={onClear}>Clear local data</Button>
      </Card>
    </div>
  )
}
