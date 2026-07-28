'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
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
import { createShift, updateShiftInDb, deleteShiftFromDb, getShifts } from '@/app/superadmin/actions'

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
  onSuccess?: () => void
}

export function ShiftFormDialog({ shift, open, onOpenChange, onSuccess }: ShiftFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: shift || { name: '', startTime: '', endTime: '', gracePeriodMinutes: 10 }
  })

  // Update form when shift data changes
  useEffect(() => {
    if (shift) {
      form.reset({
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        gracePeriodMinutes: shift.gracePeriodMinutes
      })
    } else {
      form.reset({
        name: '',
        startTime: '',
        endTime: '',
        gracePeriodMinutes: 10
      })
    }
  }, [shift, form])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      if (shift && 'id' in shift) {
        // Editing an existing shift - call server action
        await updateShiftInDb(shift.id, values)
        toast.success('Shift updated successfully')
      } else {
        // Creating a new shift - call server action
        await createShift(values)
        toast.success('Shift created successfully')
      }
      
      form.reset()
      onOpenChange(false)
      
      // Notify parent to refresh data
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      console.error('[v0] Error saving shift:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save shift'
      toast.error(errorMessage)
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
              {shift && 'id' in shift && (
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={loading}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </Button>
              )}
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

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!shift || !('id' in shift) || !shift.id) {
                  toast.error('Invalid shift data')
                  return
                }
                
                try {
                  setLoading(true)
                  await deleteShiftFromDb(shift.id)
                  
                  toast.success('Shift deleted successfully')
                  setDeleteConfirmOpen(false)
                  onOpenChange(false)
                  
                  // Notify parent to refresh data
                  if (onSuccess) {
                    onSuccess()
                  }
                } catch (error) {
                  console.error('[v0] Error deleting shift:', error)
                  const errorMessage = error instanceof Error ? error.message : 'Failed to delete shift'
                  toast.error(errorMessage)
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  )
}

