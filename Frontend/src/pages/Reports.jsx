import React, { useState, useEffect } from 'react'
import Card from '../components/UI/Card.jsx'
import Button from '../components/UI/Button.jsx'
import Table from '../components/UI/Table.jsx'
import Badge from '../components/UI/Badge.jsx'
import Input from '../components/UI/Input.jsx'
import * as reportsAPI from '../api/reports-api.js'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function Reports() {
  const [deviceId, setDeviceId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reportType, setReportType] = useState('summary')
  const [generateOpen, setGenerateOpen] = useState(false)
  const queryClient = useQueryClient()

  // Set default date range (last 7 days)
  useEffect(() => {
    const end = new Date()
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
    setEndTime(end.toISOString().slice(0, 16))
    setStartTime(start.toISOString().slice(0, 16))
  }, [])

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const result = await reportsAPI.listReports()
      return result.reports || []
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const generateMutation = useMutation({
    mutationFn: async () => {
      return reportsAPI.generateReport(deviceId || null, startTime, endTime, reportType)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      alert('Report generated successfully! Check your email for download link.')
    },
    onError: (error) => {
      alert(`Failed to generate report: ${error.message}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return reportsAPI.deleteReport(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: (error) => {
      alert(`Failed to delete report: ${error.message}`)
    },
  })

  const handleDownload = async (report) => {
    try {
      const result = await reportsAPI.downloadReport(report.key)
      window.open(result.downloadUrl, '_blank')
    } catch (error) {
      alert(`Failed to download report: ${error.message}`)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const reports = reportsData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Reports</h1>
          <p className="text-xs text-muted-foreground">
            Generate and download IoT reports. Defaults to last 7 days.
          </p>
        </div>
        <Button size="sm" onClick={() => setGenerateOpen(!generateOpen)}>
          {generateOpen ? 'Close' : 'Generate'}
        </Button>
      </div>

      {/* Generate Form (collapsible on mobile) */}
      {generateOpen && (
        <Card className="p-4">
          <h2 className="text-lg font-semibold mb-4">Generate New Report</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Device ID (optional)</label>
              <Input
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="Leave empty for all devices"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Report Type</label>
              <select
                className="w-full rounded-xl border bg-background px-3 py-2 text-sm"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="summary">Summary</option>
                <option value="detailed">Detailed</option>
                <option value="alerts">Alerts Only</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Start Time</label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">End Time</label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending || !startTime || !endTime}
            >
              {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button variant="secondary" onClick={() => setGenerateOpen(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="px-4 pt-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Available Reports</h2>
            <p className="text-xs text-muted-foreground">Tap a row to download; long-press to delete.</p>
          </div>
        </div>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No reports available</div>
        ) : (
          <div className="overflow-x-auto">
            <Table
              columns={[
                { key: 'name', header: 'Report Name' },
                { key: 'size', header: 'Size', render: (v) => formatFileSize(v) },
                {
                  key: 'lastModified',
                  header: 'Generated',
                  render: (v) => new Date(v).toLocaleString(),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (_, row) => (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(row)}
                      >
                        Download
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this report?')) {
                            deleteMutation.mutate(row.key)
                          }
                        }}
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  ),
                },
              ]}
              data={reports}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

