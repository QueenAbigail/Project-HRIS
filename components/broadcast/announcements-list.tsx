'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Eye, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  body: string
  recipientType: 'PERSONAL' | 'MULTI_SITE' | 'SITE_WIDE' | 'ALL_EMPLOYEE'
  recipientCount: number
  attachmentUrl?: string
  createdAt: string
  updatedAt: string
}

interface AnnouncementsListProps {
  refreshTrigger: number
}

export function AnnouncementsList({ refreshTrigger }: AnnouncementsListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [refreshTrigger])

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true)
      // Mock data for now
      setAnnouncements([
        {
          id: '1',
          title: 'System Maintenance Notice',
          body: 'The system will undergo maintenance on Saturday from 10 PM to 2 AM. Services will be unavailable during this time.',
          recipientType: 'ALL_EMPLOYEE',
          recipientCount: 500,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Holiday Schedule Update',
          body: 'Please note the updated holiday schedule for Q4. Check your email for details.',
          recipientType: 'SITE_WIDE',
          recipientCount: 150,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ])
    } catch (error) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to fetch announcements')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      // API call would go here
      setAnnouncements(announcements.filter(a => a.id !== id))
      toast.success('Announcement deleted successfully')
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
    } catch (error) {
      console.error('Error deleting announcement:', error)
      toast.error('Failed to delete announcement')
    } finally {
      setIsDeleting(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No announcements yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {announcements.map(announcement => (
          <Card key={announcement.id} className="p-4 hover:bg-muted/50 transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{announcement.title}</h3>
                  <Badge className={getRecipientTypeColor(announcement.recipientType)}>
                    {getRecipientTypeLabel(announcement.recipientType)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{announcement.body}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <span>Recipients: {announcement.recipientCount}</span>
                  <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                  {announcement.attachmentUrl && (
                    <span className="flex items-center gap-1">
                      <FileText className="size-3" />
                      PDF attached
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedAnnouncement(announcement)}
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled
                >
                  <Edit className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setDeleteTargetId(announcement.id)
                    setDeleteConfirmOpen(true)
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* View Details Dialog */}
      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              {getRecipientTypeLabel(selectedAnnouncement?.recipientType || '')} • {selectedAnnouncement?.recipientCount} recipients
            </DialogDescription>
          </DialogHeader>

          {selectedAnnouncement && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Content</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedAnnouncement.body}</p>
              </div>

              {selectedAnnouncement.attachmentUrl && (
                <div>
                  <h4 className="font-semibold mb-2">Attachment</h4>
                  <Button variant="outline" size="sm" asChild>
                    <a href={selectedAnnouncement.attachmentUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="size-4 mr-2" />
                      Download PDF
                    </a>
                  </Button>
                </div>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>Created: {new Date(selectedAnnouncement.createdAt).toLocaleString()}</p>
                <p>Last updated: {new Date(selectedAnnouncement.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetId && handleDelete(deleteTargetId)}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
