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
      <Card className="p-5 space-y-3">
        <div className="text-sm font-medium">Appearance</div>
        <p className="text-xs text-muted-foreground">
          Chuyển nhanh chế độ tối/sáng cho toàn bộ bảng điều khiển.
        </p>
        <div className="flex items-center justify-between rounded-lg border border-secondary/50 px-3 py-2">
          <div>Dark mode</div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={dark} onChange={(e)=>setDark(e.target.checked)} />
            <span className="text-sm text-muted-foreground">{dark? 'On':'Off'}</span>
          </label>
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <div className="text-sm font-medium text-red-500">Danger zone</div>
        <p className="text-xs text-muted-foreground">
          Xóa cache nội bộ (phiên đăng nhập, dữ liệu tạm). Thao tác này sẽ tải lại trang.
        </p>
        <Button variant="secondary" onClick={onClear}>Clear local data</Button>
      </Card>
    </div>
  )
}
