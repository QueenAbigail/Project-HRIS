'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Send } from 'lucide-react'
import { AnnouncementsList } from '@/components/broadcast/announcements-list'
import { CreateAnnouncementForm } from '@/components/broadcast/create-announcement-form'
import { NotificationHistory } from '@/components/broadcast/notification-history'
import { CreatePushNotificationForm } from '@/components/broadcast/create-push-notification-form'

export default function BroadcastPage() {
  const [refreshAnnouncements, setRefreshAnnouncements] = useState(0)
  const [refreshNotifications, setRefreshNotifications] = useState(0)

  const handleAnnouncementCreated = () => {
    setRefreshAnnouncements(prev => prev + 1)
    setRefreshNotifications(prev => prev + 1)
  }

  const handleNotificationCreated = () => {
    setRefreshNotifications(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Broadcast Management</h1>
        <p className="text-muted-foreground mt-2">Manage announcements and push notifications</p>
      </div>

      <Tabs defaultValue="announcements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="announcements" className="flex gap-2">
            <Bell className="size-4" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex gap-2">
            <Send className="size-4" />
            Push Notifications
          </TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Announcement</CardTitle>
              <CardDescription>
                Post an announcement that will be sent as push notifications to selected recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateAnnouncementForm onSuccess={handleAnnouncementCreated} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Posted Announcements</CardTitle>
              <CardDescription>
                View and manage all announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementsList refreshTrigger={refreshAnnouncements} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Push Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Push Notification</CardTitle>
              <CardDescription>
                Send independent push notifications not tied to announcements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreatePushNotificationForm onSuccess={handleNotificationCreated} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                View all sent notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationHistory refreshTrigger={refreshNotifications} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
