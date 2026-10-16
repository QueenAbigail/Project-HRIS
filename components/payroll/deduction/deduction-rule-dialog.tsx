'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { DeductionRule, DeductionRuleFormValues, DeductionType } from './types'

const empty: DeductionRuleFormValues = { name: '', type: 'tax', deductionType: 'percentage', value: '', status: 'active' }
const groups: { id: DeductionType; label: string }[] = [
  { id: 'tax', label: 'Tax' }, { id: 'insurance', label: 'Social Insurance' }, { id: 'health', label: 'Health Insurance' },
  { id: 'pension', label: 'Pension' }, { id: 'special', label: 'Special' },
]

export function DeductionRuleDialog({ open, rule, onOpenChange, onSubmit }: {
  open: boolean
  rule: DeductionRule | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DeductionRuleFormValues) => Promise<string | null>
}) {
  const [form, setForm] = useState(empty)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    setForm(rule ? { name: rule.name, type: rule.type, deductionType: rule.deductionType, value: String(rule.value), status: rule.status } : empty)
    setError(null)
  }, [rule, open])
  const update = <K extends keyof DeductionRuleFormValues>(key: K, value: DeductionRuleFormValues[K]) => setForm((current) => ({ ...current, [key]: value }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(null)
    const result = await onSubmit(form)
    if (result) setError(result); else onOpenChange(false)
    setSaving(false)
  }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent>
    <DialogHeader><DialogTitle>{rule ? 'Edit Deduction Rule' : 'Add Deduction Rule'}</DialogTitle></DialogHeader>
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2"><Label htmlFor="deduction-name">Deduction Name</Label><Input id="deduction-name" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g., BPJS Employment" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label>Category</Label><Select value={form.type} onValueChange={(v) => update('type', v as DeductionType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{groups.map((group) => <SelectItem key={group.id} value={group.id}>{group.label}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Calculation</Label><Select value={form.deductionType} onValueChange={(v) => update('deductionType', v as DeductionRuleFormValues['deductionType'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="fixed_amount">Fixed amount</SelectItem></SelectContent></Select></div>
      </div>
      <div className="space-y-2"><Label htmlFor="deduction-value">Value</Label><Input id="deduction-value" type="number" min="0" step="0.0001" required value={form.value} onChange={(e) => update('value', e.target.value)} placeholder={form.deductionType === 'percentage' ? 'e.g., 3' : 'e.g., 100000'} /></div>
      <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => update('status', v as DeductionRuleFormValues['status'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button></div>
    </form>
  </DialogContent></Dialog>
}
