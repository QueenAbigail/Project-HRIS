'use client'

import { useState } from 'react'
import { useSchedulesStore } from '@/stores/useSchedulesStore'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Clock, Trash2 } from 'lucide-react'
import type { Shift } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
  name: z.string().min(1, 'Shift name is required').max(50),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time (HH:MM)'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time (HH:MM)'),
  gracePeriodMinutes: z.coerce.number().min(0).max(60),
})

type FormValues = z.infer<typeof formSchema>

interface ShiftFormDialogProps {
  shift?: Shift | Omit<Shift, 'id'>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShiftFormDialog({ shift, open, onOpenChange }: ShiftFormDialogProps) {
  const addShift = useSchedulesStore(state => state.addShift)
  const updateShift = useSchedulesStore(state => state.updateShift)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: shift || { name: '', startTime: '', endTime: '', gracePeriodMinutes: 10 }
  })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      if (shift && 'id' in shift) {
        // Editing an existing shift
        updateShift(shift.id, values)
      } else {
        // Creating a new shift
        addShift(values)
      }
      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to save shift')
    } finally {
      setLoading(false)
    }
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="size-5" />
            {shift ? 'Edit Shift' : 'Create New Shift'}
          </DialogTitle>
          <DialogDescription>
            Configure shift times and grace period.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning Shift" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time (HH:MM)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time (HH:MM)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="gracePeriodMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grace Period (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} max={60} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : shift ? 'Update Shift' : 'Create Shift'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

