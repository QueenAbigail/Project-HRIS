'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Edit, Trash2, Eye, Loader2, FileText, Search } from 'lucide-react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  body: string
  recipientType: 'PERSONAL' | 'MULTI_SITE' | 'SITE_WIDE' | 'ALL_EMPLOYEE'
  priority: string
  recipientCount: number
  readCount: number
  unreadCount: number
  attachmentUrl?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface AnnouncementsListProps {
  refreshTrigger: number
}

export function AnnouncementsList({ refreshTrigger }: AnnouncementsListProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [selectedAnalytics, setSelectedAnalytics] = useState<any>(null)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Initial fetch on component mount
    fetchAnnouncements()
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [refreshTrigger])

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true)
      const url = new URL('/api/broadcast/announcements', window.location.origin)
      if (searchQuery) {
        url.searchParams.append('search', searchQuery)
      }
      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error('Failed to fetch announcements')
      }
      const data = await response.json()
      setAnnouncements(data.data)
    } catch (error) {
      toast.error('Failed to fetch announcements')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAnnouncements()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/broadcast/announcements/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete announcement')
      }

      setAnnouncements(announcements.filter(a => a.id !== id))
      toast.success('Announcement deleted successfully')
      setDeleteConfirmOpen(false)
      setDeleteTargetId(null)
    } catch (error) {
      toast.error('Failed to delete announcement')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setEditingId(announcement.id)
    setEditTitle(announcement.title)
    setEditBody(announcement.body)
    setEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editTitle.trim() || !editBody.trim()) {
      toast.error('Title and body are required')
      return
    }

    try {
      setIsEditing(true)
      const response = await fetch(`/api/broadcast/announcements/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          body: editBody,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update announcement')
      }

      setAnnouncements(announcements.map(a => 
        a.id === editingId ? { ...a, title: editTitle, body: editBody } : a
      ))
      toast.success('Announcement updated successfully')
      setEditOpen(false)
      setEditingId(null)
    } catch (error) {
      toast.error('Failed to update announcement')
    } finally {
      setIsEditing(false)
    }
  }

  const handleViewAnalytics = async (id: string) => {
    try {
      const response = await fetch(`/api/broadcast/announcements/${id}`)
      if (!response.ok) throw new Error('Failed to fetch analytics')
      const data = await response.json()
      setSelectedAnalytics(data.analytics)
      setAnalyticsOpen(true)
    } catch (error) {
      toast.error('Failed to load analytics')
    }
  }

  const getRecipientTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PERSONAL': 'Personal',
      'MULTI_SITE': 'Multi-Site',
      'SITE_WIDE': 'Site Wide',
      'ALL_EMPLOYEES': 'All Employees',
    }
    return labels[type] || type
  }

  const getRecipientTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'PERSONAL': 'bg-blue-100 text-blue-800',
      'MULTI_SITE': 'bg-purple-100 text-purple-800',
      'SITE_WIDE': 'bg-orange-100 text-orange-800',
      'ALL_EMPLOYEES': 'bg-red-100 text-red-800',
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
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">No announcements yet</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements by title..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
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
                  <span className="text-green-600">Read: {announcement.readCount}</span>
                  <span className="text-orange-600">Unread: {announcement.unreadCount}</span>
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
                  onClick={() => handleViewAnalytics(announcement.id)}
                  title="View analytics"
                >
                  <Eye className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(announcement)}
                  title="Edit announcement"
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
                  title="Delete announcement"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        </div>
      </div>

      {/* Edit Announcement Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          {editingId && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Body</label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  disabled={isEditing}
                  rows={6}
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditOpen(false)} disabled={isEditing}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={isEditing}>
                  {isEditing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Announcement Analytics</DialogTitle>
            <DialogDescription>Read status breakdown for recipients</DialogDescription>
          </DialogHeader>
          {selectedAnalytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold">{selectedAnalytics.totalRecipients}</div>
                  <div className="text-xs text-muted-foreground">Total Recipients</div>
                </Card>
                <Card className="p-4 text-center bg-green-50 dark:bg-green-950">
                  <div className="text-2xl font-bold text-green-600">{selectedAnalytics.readCount}</div>
                  <div className="text-xs text-muted-foreground">Read</div>
                </Card>
                <Card className="p-4 text-center bg-orange-50 dark:bg-orange-950">
                  <div className="text-2xl font-bold text-orange-600">{selectedAnalytics.unreadCount}</div>
                  <div className="text-xs text-muted-foreground">Unread</div>
                </Card>
              </div>

              <div className="space-y-4">
                {selectedAnalytics.readByUsers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">Read By ({selectedAnalytics.readCount})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {selectedAnalytics.readByUsers.map((user: any) => (
                        <div key={user.id} className="text-sm flex justify-between">
                          <span>{user.name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(user.readAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAnalytics.unreadUsers.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">Unread ({selectedAnalytics.unreadCount})</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {selectedAnalytics.unreadUsers.map((user: any) => (
                        <div key={user.id} className="text-sm">{user.name}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
