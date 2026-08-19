'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Eye, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NotificationRecord {
  id: string
  title: string
  message: string
  recipientType: 'PERSONAL' | 'MULTI_SITE' | 'SITE_WIDE' | 'ALL_EMPLOYEE'
  recipientCount: number
  sentAt: string
  source: 'ANNOUNCEMENT' | 'INDEPENDENT'
}

interface NotificationHistoryProps {
  refreshTrigger: number
}

export function NotificationHistory({ refreshTrigger }: NotificationHistoryProps) {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null)

  useEffect(() => {
    fetchNotifications()
  }, [refreshTrigger])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      // Mock data for now
      setNotifications([
        {
          id: '1',
          title: 'System Maintenance Notice',
          message: 'The system will undergo maintenance on Saturday from 10 PM to 2 AM.',
          recipientType: 'ALL_EMPLOYEE',
          recipientCount: 500,
          sentAt: new Date().toISOString(),
          source: 'ANNOUNCEMENT',
        },
        {
          id: '2',
          title: 'Important Update',
          message: 'Please review the new policy guidelines.',
          recipientType: 'SITE_WIDE',
          recipientCount: 150,
          sentAt: new Date(Date.now() - 3600000).toISOString(),
          source: 'INDEPENDENT',
        },
      ])
    } catch (error) {
      toast.error('Failed to fetch notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const getRecipientTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PERSONAL': 'Personal',
      'MULTI_SITE': 'Multi-Site Group',
      'SITE_WIDE': 'Site Wide',
      'ALL_EMPLOYEE': 'All Employees',
    }
    return labels[type] || type
  }

  const getRecipientTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'PERSONAL': 'bg-blue-100 text-blue-800',
      'MULTI_SITE': 'bg-purple-100 text-purple-800',
      'SITE_WIDE': 'bg-orange-100 text-orange-800',
      'ALL_EMPLOYEE': 'bg-red-100 text-red-800',
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getSourceBadge = (source: string) => {
    return source === 'ANNOUNCEMENT' 
      ? <Badge variant="outline">From Announcement</Badge>
      : <Badge variant="default">Independent</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No notifications sent yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {notifications.map(notification => (
          <Card key={notification.id} className="p-4 hover:bg-muted/50 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{notification.title}</h3>
                  <Badge className={getRecipientTypeColor(notification.recipientType)}>
                    {getRecipientTypeLabel(notification.recipientType)}
                  </Badge>
                  {getSourceBadge(notification.source)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span>Recipients: {notification.recipientCount}</span>
                  <span>{new Date(notification.sentAt).toLocaleString()}</span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedNotification(notification)}
              >
                <Eye className="size-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedNotification?.title}</DialogTitle>
            <DialogDescription>
              {getRecipientTypeLabel(selectedNotification?.recipientType || '')} • {selectedNotification?.recipientCount} recipients
            </DialogDescription>
          </DialogHeader>

          {selectedNotification && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Message</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedNotification.message}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Details</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Source:</span>
                    <span className="ml-2">
                      {selectedNotification.source === 'ANNOUNCEMENT' ? 'From Announcement' : 'Independent Notification'}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Recipients:</span>
                    <span className="ml-2">{selectedNotification.recipientCount}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Sent at:</span>
                    <span className="ml-2">{new Date(selectedNotification.sentAt).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
