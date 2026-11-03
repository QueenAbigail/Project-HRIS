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
import { formatDate, formatRupiah, type SiteWage } from './types'

interface MinimumWageDialogProps {
  site: SiteWage | null
  onOpenChange: (open: boolean) => void
  onSubmit: (siteId: string, minimumWage: number) => Promise<string | null>
}

export function MinimumWageDialog({ site, onOpenChange, onSubmit }: MinimumWageDialogProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!site) return
    const preset = site.scheduled?.minimumWage ?? site.current?.minimumWage
    setValue(preset ? String(preset) : '')
    setError(null)
  }, [site])

  const amount = Number(value)
  const isFirstWage = site ? site.current === null : false

  const handleSave = async () => {
    if (!site) return
    if (!amount || amount <= 0) {
      setError('Enter a minimum wage greater than 0')
      return
    }
    setSaving(true)
    setError(null)
    const message = await onSubmit(site.siteId, amount)
    setSaving(false)
    if (message) setError(message)
  }

  return (
    <Dialog open={site !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set Minimum Wage</DialogTitle>
          <DialogDescription>
            {site && `Regional minimum wage (UMK/UMP) for ${site.siteName}`}
          </DialogDescription>
        </DialogHeader>

        {site && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="minimum-wage">Minimum Wage (Rp)</Label>
              <Input
                id="minimum-wage"
                inputMode="numeric"
                autoComplete="off"
                placeholder="e.g. 4755000"
                value={value}
                onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) handleSave()
                }}
              />
              {amount > 0 && <p className="text-sm font-medium">{formatRupiah(amount)}</p>}
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              {isFirstWage
                ? `No minimum wage has been set for this site yet, so this one applies immediately (from ${formatDate(site.pendingEffectiveDate)}).`
                : `This change takes effect on ${formatDate(site.pendingEffectiveDate)}. The current minimum wage stays in use until then.`}
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
