'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
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
import { formatDate, formatRupiah, type PositionRow } from './types'

export interface AllowanceTarget {
  siteId: string
  siteName: string
  minimumWage: number
  row: PositionRow
}

interface AllowanceDialogProps {
  target: AllowanceTarget | null
  onOpenChange: (open: boolean) => void
  onSubmit: (siteId: string, positionId: string, positionAllowance: number) => Promise<string | null>
}

export function AllowanceDialog({ target, onOpenChange, onSubmit }: AllowanceDialogProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!target) return
    const preset = target.row.scheduled ?? target.row.current
    setValue(preset ? String(preset.positionAllowance) : '')
    setError(null)
  }, [target])

  const allowance = value === '' ? null : Number(value)
  const isFirstAllowance = target ? target.row.current === null : false

  const handleSave = async () => {
    if (!target) return
    if (allowance === null) {
      setError('Enter a position allowance (use 0 for none)')
      return
    }
    setSaving(true)
    setError(null)
    const message = await onSubmit(target.siteId, target.row.positionId, allowance)
    setSaving(false)
    if (message) setError(message)
  }

  return (
    <Dialog open={target !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Position Allowance</DialogTitle>
          <DialogDescription>
            {target && `${target.row.positionName} at ${target.siteName}`}
          </DialogDescription>
        </DialogHeader>

        {target && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="position-allowance">Position Allowance (Rp)</Label>
              <Input
                id="position-allowance"
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 5000000"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) handleSave()
                }}
              />
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              <p className="text-muted-foreground">Base salary preview</p>
              <p className="mt-1 font-medium">
                {formatRupiah(target.minimumWage)} + {formatRupiah(allowance ?? 0)} ={' '}
                {formatRupiah(target.minimumWage + (allowance ?? 0))}
              </p>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              {isFirstAllowance
                ? `No allowance has been set for this position yet, so this one applies immediately (from ${formatDate(target.row.pendingEffectiveDate)}).`
                : `This change takes effect on ${formatDate(target.row.pendingEffectiveDate)}. The current allowance stays in use until then.`}
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
