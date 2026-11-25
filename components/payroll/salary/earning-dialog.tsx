'use client'

import { useMemo, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EARNING_CALCULATION_LABELS } from '@/lib/payroll-earnings'
import {
  formatDate,
  formatRupiah,
  type CompanyEarnings,
  type EarningCalculationType,
  type EarningGroupRow,
} from './types'

const ALL_VALUE = '__all__'

export interface EarningDialogState {
  mode: 'create' | 'edit'
  defaultCompanyId?: string
  row?: EarningGroupRow
}

interface EarningDialogProps {
  state: EarningDialogState | null
  companies: CompanyEarnings[]
  positions: { id: string; name: string }[]
  defaultEffectiveDate: string
  onOpenChange: (open: boolean) => void
  onCreate: (payload: {
    companyId: string
    siteId: string | null
    positionId: string | null
    name: string
    calculationType: EarningCalculationType
    amount: number
    isTaxable: boolean
  }) => Promise<string | null>
  onUpdate: (payload: {
    groupId: string
    calculationType: EarningCalculationType
    amount: number
    isTaxable: boolean
  }) => Promise<string | null>
}

export function EarningDialog({
  state,
  companies,
  positions,
  defaultEffectiveDate,
  onOpenChange,
  onCreate,
  onUpdate,
}: EarningDialogProps) {
  const formKey = state
    ? `${state.mode}:${state.row?.representativeId ?? state.defaultCompanyId ?? 'new'}`
    : 'closed'

  return (
    <Dialog open={state !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {state && (
          <EarningDialogForm
            key={formKey}
            state={state}
            companies={companies}
            positions={positions}
            defaultEffectiveDate={defaultEffectiveDate}
            onCancel={() => onOpenChange(false)}
            onCreate={onCreate}
            onUpdate={onUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function EarningDialogForm({
  state,
  companies,
  positions,
  defaultEffectiveDate,
  onCancel,
  onCreate,
  onUpdate,
}: {
  state: EarningDialogState
  companies: CompanyEarnings[]
  positions: { id: string; name: string }[]
  defaultEffectiveDate: string
  onCancel: () => void
  onCreate: EarningDialogProps['onCreate']
  onUpdate: EarningDialogProps['onUpdate']
}) {
  const isEdit = state.mode === 'edit' && Boolean(state.row)
  const preset = isEdit && state.row ? state.row.scheduled ?? state.row.current : null

  const [companyId, setCompanyId] = useState(
    isEdit && state.row ? state.row.companyId : state.defaultCompanyId ?? companies[0]?.companyId ?? '',
  )
  const [siteId, setSiteId] = useState<string>(
    isEdit && state.row ? state.row.siteId ?? ALL_VALUE : ALL_VALUE,
  )
  const [positionId, setPositionId] = useState<string>(
    isEdit && state.row ? state.row.positionId ?? ALL_VALUE : ALL_VALUE,
  )
  const [name, setName] = useState(isEdit && state.row ? state.row.name : '')
  const [calculationType, setCalculationType] = useState<EarningCalculationType>(
    preset?.calculationType ?? 'fixed_monthly',
  )
  const [amountInput, setAmountInput] = useState(preset ? String(preset.amount) : '')
  const [isTaxable, setIsTaxable] = useState(preset?.isTaxable ?? true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const selectedCompany = useMemo(
    () => companies.find((c) => c.companyId === companyId) ?? null,
    [companies, companyId],
  )

  const amount = amountInput === '' ? null : Number(amountInput)
  const effectiveDate = isEdit
    ? state.row?.pendingEffectiveDate ?? defaultEffectiveDate
    : defaultEffectiveDate
  const hasCurrent = isEdit ? state.row?.current !== null : false

  const handleCompanyChange = (value: string) => {
    setCompanyId(value)
    setSiteId(ALL_VALUE)
  }

  const handleSave = async () => {
    if (!companyId) {
      setError('Select a client')
      return
    }
    if (!isEdit && !name.trim()) {
      setError('Enter an earning name')
      return
    }
    if (amount === null || Number.isNaN(amount)) {
      setError('Enter an amount (use 0 for none)')
      return
    }

    setSaving(true)
    setError(null)
    const message =
      isEdit && state.row
        ? await onUpdate({
            groupId: state.row.representativeId,
            calculationType,
            amount,
            isTaxable,
          })
        : await onCreate({
            companyId,
            siteId: siteId === ALL_VALUE ? null : siteId,
            positionId: positionId === ALL_VALUE ? null : positionId,
            name: name.trim(),
            calculationType,
            amount,
            isTaxable,
          })
    setSaving(false)
    if (message) setError(message)
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? 'Edit Earning Rule' : 'Add Earning Rule'}</DialogTitle>
        <DialogDescription>
          {isEdit && state.row
            ? `${state.row.name} — ${selectedCompany?.companyName ?? ''}`
            : 'Configure a recurring earning component for a client.'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="earning-client">Client</Label>
          <Select value={companyId} onValueChange={handleCompanyChange} disabled={isEdit}>
            <SelectTrigger id="earning-client">
              <SelectValue placeholder="Select client" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.companyId} value={company.companyId}>
                  {company.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="earning-site">Site (Optional)</Label>
            <Select value={siteId} onValueChange={setSiteId} disabled={isEdit || !selectedCompany}>
              <SelectTrigger id="earning-site">
                <SelectValue placeholder="All Sites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Sites</SelectItem>
                {(selectedCompany?.sites ?? []).map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name} ({site.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="earning-position">Position (Optional)</Label>
            <Select value={positionId} onValueChange={setPositionId} disabled={isEdit}>
              <SelectTrigger id="earning-position">
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>All Positions</SelectItem>
                {positions.map((pos) => (
                  <SelectItem key={pos.id} value={pos.id}>
                    {pos.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="earning-name">Earning Name</Label>
          <Input
            id="earning-name"
            placeholder="e.g. Meal, Transport, Extra Fooding"
            value={name}
            disabled={isEdit}
            onChange={(e) => setName(e.target.value)}
          />
          {isEdit && (
            <p className="text-xs text-muted-foreground">
              Scope and name stay locked so historical versions remain intact. Deactivate this rule if you need a new scope.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="earning-calculation">Calculation</Label>
            <Select
              value={calculationType}
              onValueChange={(value) => setCalculationType(value as EarningCalculationType)}
            >
              <SelectTrigger id="earning-calculation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EARNING_CALCULATION_LABELS) as EarningCalculationType[]).map((type) => (
                  <SelectItem key={type} value={type}>
                    {EARNING_CALCULATION_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="earning-amount">Amount (Rp)</Label>
            <Input
              id="earning-amount"
              inputMode="numeric"
              autoComplete="off"
              placeholder="e.g. 25000"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) handleSave()
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5 pr-4">
            <Label htmlFor="earning-taxable" className="text-sm font-medium">
              Taxable (PPh 21)
            </Label>
            <p className="text-xs text-muted-foreground">
              Include this component in taxable gross income calculations.
            </p>
          </div>
          <Switch id="earning-taxable" checked={isTaxable} onCheckedChange={setIsTaxable} />
        </div>

        <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          {amount !== null && !Number.isNaN(amount) && (
            <p className="mb-1 font-medium text-foreground">
              Preview: {formatRupiah(amount)} ({EARNING_CALCULATION_LABELS[calculationType]})
            </p>
          )}
          {hasCurrent
            ? `This change takes effect on ${formatDate(effectiveDate)}. The current rate stays in use until then.`
            : `Applies immediately from ${formatDate(effectiveDate)}.`}
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </DialogFooter>
    </>
  )
}
