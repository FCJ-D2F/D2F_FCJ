import React, { useState } from 'react'
import Card from '../components/UI/Card.jsx'
import Button from '../components/UI/Button.jsx'
import * as notificationsAPI from '../api/notifications-api.js'
import { useQuery, useMutation } from '@tanstack/react-query'

export default function Notifications() {
  const [alerts, setAlerts] = useState(true)
  const [reports, setReports] = useState(true)
  const [weeklySummary, setWeeklySummary] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async () => {
      const result = await notificationsAPI.getPreferences()
      return result.preferences
    },
    onSuccess: (preferences) => {
      if (preferences) {
        setAlerts(preferences.alerts ?? true)
        setReports(preferences.reports ?? true)
        setWeeklySummary(preferences.weeklySummary ?? false)
      }
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (prefs) => {
      return notificationsAPI.updatePreferences(prefs)
    },
    onSuccess: () => {
      alert('Preferences updated successfully!')
    },
    onError: (error) => {
      alert(`Failed to update preferences: ${error.message}`)
    },
  })

  const testMutation = useMutation({
    mutationFn: async () => {
      return notificationsAPI.sendTestNotification()
    },
    onSuccess: () => {
      alert('Test notification sent! Check your email.')
    },
    onError: (error) => {
      alert(`Failed to send test notification: ${error.message}`)
    },
  })

  const handleSave = () => {
    updateMutation.mutate({
      alerts,
      reports,
      weeklySummary,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold">Notification Preferences</h1>
        <Card className="p-4">
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Notification Preferences</h1>
      </div>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Email Notifications</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure when you want to receive email notifications.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Alert Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive emails when alerts are triggered
              </div>
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={alerts}
                onChange={(e) => setAlerts(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{alerts ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Report Notifications</div>
              <div className="text-sm text-muted-foreground">
                Receive emails when reports are generated
              </div>
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={reports}
                onChange={(e) => setReports(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{reports ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <div className="font-medium">Weekly Summary</div>
              <div className="text-sm text-muted-foreground">
                Receive a weekly summary of all activities
              </div>
            </div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={weeklySummary}
                onChange={(e) => setWeeklySummary(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">{weeklySummary ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending}
          >
            {testMutation.isPending ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>
      </Card>

      {data?.email && (
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">
            Notifications will be sent to: <strong>{data.email}</strong>
          </div>
        </Card>
      )}
    </div>
  )
}

