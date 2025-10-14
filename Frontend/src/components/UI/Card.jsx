import React from 'react'

export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`rounded-2xl border bg-card text-card-foreground shadow-sm ${className}`} {...props}>
      {children}
    </div>
  )
}
