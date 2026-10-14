'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DeductionRuleDialog } from '@/components/payroll/deduction/deduction-rule-dialog'
import { DeductionRuleGroup } from '@/components/payroll/deduction/deduction-rule-group'
import {
  deductionTypeGroups,
  type DeductionRule,
  type DeductionRuleFormValues,
  type DeductionRulesResponse,
} from '@/components/payroll/deduction/types'

const ENDPOINT = '/api/payroll/deduction-rules'

async function fetcher(url: string): Promise<DeductionRulesResponse> {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? 'Failed to load deduction rules')
  return body
}

function toPayload(values: DeductionRuleFormValues) {
  return {
    name: values.name,
    type: values.type,
    deductionType: values.deductionType,
    value: Number(values.value),
    positionId: values.positionId,
    siteId: values.siteId,
    riskLevel: values.riskLevel === 'none' ? null : values.riskLevel,
    effectiveDate: values.effectiveDate,
    endDate: values.endDate || null,
    status: values.status,
  }
}

export default function ManageDeductionPage() {
  const { data, error, isLoading, mutate } = useSWR(ENDPOINT, fetcher)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<DeductionRule | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<DeductionRule | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const openCreate = () => {
    setEditingRule(null)
    setDialogOpen(true)
  }

  const openEdit = (rule: DeductionRule) => {
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: DeductionRuleFormValues) => {
    const res = await fetch(editingRule ? `${ENDPOINT}/${editingRule.id}` : ENDPOINT, {
      method: editingRule ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toPayload(values)),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return (body.error as string) ?? 'Failed to save deduction rule'

    await mutate()
    setDialogOpen(false)
    return null
  }

  const handleDeactivate = async () => {
    if (!deactivateTarget) return
    setActionError(null)
    const res = await fetch(`${ENDPOINT}/${deactivateTarget.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setActionError(body.error ?? 'Failed to deactivate deduction rule')
    } else {
      await mutate()
    }
    setDeactivateTarget(null)
  }

  const rules = data?.rules ?? []
  const groupsWithRules = deductionTypeGroups
    .map((group) => ({ group, rules: rules.filter((rule) => rule.type === group.id) }))
    .filter(({ rules: groupRules }) => groupRules.length > 0)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Manage Deduction</h1>
        <p className="mt-2 text-muted-foreground">Configure salary deduction rules and rates</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={openCreate} disabled={!data} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Deduction Rule
        </Button>
      </div>

      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">
          {error.message}
        </div>
      )}

      {data && rules.length === 0 && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No deduction rules yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first rule to start configuring salary deductions.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {groupsWithRules.map(({ group, rules: groupRules }) => (
          <DeductionRuleGroup
            key={group.id}
            group={group}
            rules={groupRules}
            sites={data?.sites ?? []}
            onEdit={openEdit}
            onDeactivate={setDeactivateTarget}
          />
        ))}
      </div>

      <DeductionRuleDialog
        open={dialogOpen}
        rule={editingRule}
        positions={data?.positions ?? []}
        sites={data?.sites ?? []}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />

      <AlertDialog
        open={deactivateTarget !== null}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Deduction Rule</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget?.name} will stop being applied to new payroll calculations. The rule
              and its payroll history are kept, and you can reactivate it anytime by editing it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeactivate}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
