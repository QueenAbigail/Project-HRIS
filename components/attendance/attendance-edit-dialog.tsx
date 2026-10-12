'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

type EditableRecord = {
  id: string
  actualCheckIn: string | null
  actualCheckOut: string | null
  status: string
  notes: string | null
  user: { name: string }
}

function toLocalInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (part: number) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null
}

export function AttendanceEditDialog({ record, open, onOpenChange, onSaved }: {
  record: EditableRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [status, setStatus] = useState('NOT_CHECKED_IN')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!record) return
    setCheckIn(toLocalInput(record.actualCheckIn))
    setCheckOut(toLocalInput(record.actualCheckOut))
    setStatus(record.status)
    setNotes(record.notes ?? '')
    setError(null)
  }, [record])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!record) return
    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/attendance?id=${encodeURIComponent(record.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actualCheckIn: toIso(checkIn), actualCheckOut: toIso(checkOut), status, notes: notes.trim() || null }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) throw new Error(body?.error || 'Attendance could not be updated.')
      onSaved()
      onOpenChange(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Attendance could not be updated.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit attendance</DialogTitle>
          <DialogDescription>Update the attendance record for {record?.user.name}.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="attendance-edit-check-in">Check-in</Label><Input id="attendance-edit-check-in" type="datetime-local" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="attendance-edit-check-out">Check-out</Label><Input id="attendance-edit-check-out" type="datetime-local" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PRESENT">Present</SelectItem><SelectItem value="LATE">Late</SelectItem><SelectItem value="ABSENT">Absent</SelectItem><SelectItem value="LEAVE">Leave</SelectItem><SelectItem value="NOT_CHECKED_IN">Pending</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="attendance-edit-notes">Notes</Label><Textarea id="attendance-edit-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} /></div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}Save changes</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export type { EditableRecord }
export { toIso }

