'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ALL_SCOPE,
  deductionTypeGroups,
  type DeductionRule,
  type DeductionRuleFormValues,
  type SiteOption,
} from './types'

interface DeductionRuleDialogProps {
  open: boolean
  rule: DeductionRule | null
  positions: string[]
  sites: SiteOption[]
  onOpenChange: (open: boolean) => void
  onSubmit: (values: DeductionRuleFormValues) => Promise<string | null>
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function toFormValues(rule: DeductionRule | null): DeductionRuleFormValues {
  if (!rule) {
    return {
      name: '',
      type: 'tax',
      deductionType: 'percentage',
      value: '',
      positionId: ALL_SCOPE,
      siteId: ALL_SCOPE,
      riskLevel: 'none',
      effectiveDate: today(),
      endDate: '',
      status: 'active',
    }
  }
  return {
    name: rule.name,
    type: rule.type,
    deductionType: rule.deductionType,
    value: String(rule.value),
    positionId: rule.positionId,
    siteId: rule.siteId,
    riskLevel: rule.riskLevel ?? 'none',
    effectiveDate: rule.effectiveDate,
    endDate: rule.endDate ?? '',
    status: rule.status,
  }
}

export function DeductionRuleDialog({
  open,
  rule,
  positions,
  sites,
  onOpenChange,
  onSubmit,
}: DeductionRuleDialogProps) {
  const [form, setForm] = useState<DeductionRuleFormValues>(toFormValues(rule))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(toFormValues(rule))
      setError(null)
    }
  }, [open, rule])

  const update = <K extends keyof DeductionRuleFormValues>(
    key: K,
    value: DeductionRuleFormValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    const message = await onSubmit(form)
    setSaving(false)
    if (message) setError(message)
  }

  const positionOptions =
    form.positionId !== ALL_SCOPE && !positions.includes(form.positionId)
      ? [form.positionId, ...positions]
      : positions

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit Deduction Rule' : 'Add Deduction Rule'}</DialogTitle>
          <DialogDescription>
            Rules apply to every employee in the selected position and site.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule-name">Deduction Name</Label>
            <Input
              id="rule-name"
              required
              maxLength={200}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="e.g., Income Tax (PPh 21)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.type} onValueChange={(v) => update('type', v as DeductionRuleFormValues['type'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {deductionTypeGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Risk Level (optional)</Label>
              <Select
                value={form.riskLevel}
                onValueChange={(v) => update('riskLevel', v as DeductionRuleFormValues['riskLevel'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not specified</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Calculation</Label>
              <Select
                value={form.deductionType}
                onValueChange={(v) => update('deductionType', v as DeductionRuleFormValues['deductionType'])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount (Rp)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-value">Value</Label>
              <Input
                id="rule-value"
                type="number"
                required
                min={0}
                max={form.deductionType === 'percentage' ? 100 : 9999.9999}
                step="any"
                value={form.value}
                onChange={(e) => update('value', e.target.value)}
                placeholder={form.deductionType === 'percentage' ? 'e.g., 5' : 'e.g., 500'}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={form.positionId} onValueChange={(v) => update('positionId', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SCOPE}>All positions</SelectItem>
                  {positionOptions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Site</Label>
              <Select value={form.siteId} onValueChange={(v) => update('siteId', v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_SCOPE}>All sites</SelectItem>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rule-effective">Effective Date</Label>
              <Input
                id="rule-effective"
                type="date"
                required
                value={form.effectiveDate}
                onChange={(e) => update('effectiveDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rule-end">End Date (optional)</Label>
              <Input
                id="rule-end"
                type="date"
                min={form.effectiveDate}
                value={form.endDate}
                onChange={(e) => update('endDate', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update('status', v as DeductionRuleFormValues['status'])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
