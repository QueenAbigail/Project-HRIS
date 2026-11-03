'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OvertimeRule, OvertimeRuleFormValues } from './types'

const empty: OvertimeRuleFormValues = { hour: '', multiplier: '1.5', description: '' }

interface OvertimeRuleDialogProps {
  open: boolean
  typeName: string
  rule: OvertimeRule | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: OvertimeRuleFormValues) => Promise<string | null>
}

export function OvertimeRuleDialog({ open, typeName, rule, onOpenChange, onSubmit }: OvertimeRuleDialogProps) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(
      rule
        ? { hour: String(rule.hour), multiplier: String(rule.multiplier), description: rule.description }
        : empty,
    )
    setError(null)
  }, [rule, open])

  const update = (key: keyof OvertimeRuleFormValues, value: string) => setForm((current) => ({ ...current, [key]: value }))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    const result = await onSubmit(form)
    if (result) setError(result)
    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit' : 'Add'} Multiplier Rule</DialogTitle>
          <DialogDescription>Configure the overtime multiplier for {typeName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="overtime-hour">Hour</Label>
            <Input id="overtime-hour" type="number" min="1" max="24" step="1" required value={form.hour} onChange={(e) => update('hour', e.target.value)} placeholder="e.g., 1, 2, 3" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="overtime-multiplier">Multiplier</Label>
            <Input id="overtime-multiplier" type="number" min="0.01" max="9.99" step="0.01" required value={form.multiplier} onChange={(e) => update('multiplier', e.target.value)} placeholder="e.g., 1.5, 2, 2.5" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="overtime-description">Description</Label>
            <Input id="overtime-description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="e.g., 1st hour, 2nd hour and onwards" />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
