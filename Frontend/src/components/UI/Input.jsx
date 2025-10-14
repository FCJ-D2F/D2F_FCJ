import React from 'react'

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      {...props}
    />
  )
}
