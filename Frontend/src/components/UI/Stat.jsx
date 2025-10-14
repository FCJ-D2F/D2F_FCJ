import React from 'react'

export default function Stat({ label, value, trend }) {
  return (
    <div className="rounded-2xl border p-4 bg-card/60">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {trend && <div className="mt-1 text-xs text-muted-foreground">{trend}</div>}
    </div>
  )
}
