'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CalendarDays, Clock3, FileText, Loader2, MapPin, UserRound } from 'lucide-react'

type EditableRecord = {
  id: string
  date: string
  actualCheckIn: string | null
  actualCheckOut: string | null
  status: string
  notes: string | null
  user: { name: string; department?: string | null; employeeCode?: string | null }
  location?: { name: string; company?: { name: string } | null } | null
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
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <div className="border-b bg-gradient-to-br from-primary/[0.08] via-background to-background px-6 pb-5 pt-6">
          <DialogHeader className="pr-8">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <Clock3 className="size-4" aria-hidden="true" />
              Attendance record
            </div>
            <DialogTitle className="text-2xl tracking-tight">Edit attendance</DialogTitle>
            <DialogDescription className="mt-1">Review the employee details, then update the attendance information below.</DialogDescription>
          </DialogHeader>
        </div>
        {record && (
          <div className="px-6 pt-5">
            <div className="rounded-xl border bg-muted/20 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="size-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{record.user.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {[record.user.employeeCode, record.user.department].filter(Boolean).join(' · ') || 'Employee'}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 border-t pt-3 text-sm sm:grid-cols-2">
                <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  <CalendarDays className="size-4 shrink-0 text-primary/70" aria-hidden="true" />
                  <span>{new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4 shrink-0 text-primary/70" aria-hidden="true" />
                  <span className="truncate">{record.location?.company?.name ? `${record.location.company.name} - ` : ''}{record.location?.name || 'Unknown site'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="attendance-edit-check-in">Check-in</Label><Input id="attendance-edit-check-in" type="datetime-local" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="attendance-edit-check-out">Check-out</Label><Input id="attendance-edit-check-out" type="datetime-local" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Status</Label><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-full sm:w-56"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PRESENT">Present</SelectItem><SelectItem value="LATE">Late</SelectItem><SelectItem value="ABSENT">Absent</SelectItem><SelectItem value="LEAVE">Leave</SelectItem><SelectItem value="NOT_CHECKED_IN">Pending</SelectItem></SelectContent></Select></div>
          <div className="space-y-2">
            <Label htmlFor="attendance-edit-notes" className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" aria-hidden="true" />Notes</Label>
            <Textarea id="attendance-edit-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={2000} placeholder="Add a note about this attendance record (optional)" className="min-h-24 resize-y" />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <DialogFooter className="-mx-6 -mb-5 border-t bg-muted/20 px-6 py-4"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 size-4 animate-spin" />}Save changes</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export type { EditableRecord }
export { toIso }

