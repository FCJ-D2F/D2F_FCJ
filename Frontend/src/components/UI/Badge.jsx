import React from 'react'

const colorMap = {
  LOW: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  HIGH: 'bg-red-500/15 text-red-300 border-red-500/30',
  INFO: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
}

export default function Badge({ children, tone = 'INFO', className = '' }) {
  const styles = colorMap[tone] || colorMap.INFO
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${styles} ${className}`}>{children}</span>
}
