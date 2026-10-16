'use client'

import { useState } from 'react'
import useSWR from 'swr'
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
import { OvertimeRuleDialog } from '@/components/payroll/overtime/overtime-rule-dialog'
import { OvertimeRuleGroup } from '@/components/payroll/overtime/overtime-rule-group'
import {
  overtimeTypeGroups,
  type OvertimeRule,
  type OvertimeRuleFormValues,
  type OvertimeRulesResponse,
  type OvertimeType,
} from '@/components/payroll/overtime/types'
import { ordinalHour } from '@/lib/overtime-rules'

const ENDPOINT = '/api/payroll/overtime-rules'

async function fetcher(url: string): Promise<OvertimeRulesResponse> {
  const res = await fetch(url)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? 'Failed to load overtime rules')
  return body
}

export default function ManageOvertimePage() {
  const { data, error, isLoading, mutate } = useSWR(ENDPOINT, fetcher)
  const [dialogType, setDialogType] = useState<OvertimeType>('overtime_weekly')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<OvertimeRule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OvertimeRule | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const openCreate = (type: OvertimeType) => {
    setDialogType(type)
    setEditingRule(null)
    setDialogOpen(true)
  }

  const openEdit = (rule: OvertimeRule) => {
    setDialogType(rule.type)
    setEditingRule(rule)
    setDialogOpen(true)
  }

  const handleSubmit = async (values: OvertimeRuleFormValues) => {
    const res = await fetch(editingRule ? `${ENDPOINT}/${editingRule.id}` : ENDPOINT, {
      method: editingRule ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: dialogType,
        hour: Number(values.hour),
        multiplier: Number(values.multiplier),
        description: values.description,
        status: editingRule?.status ?? 'active',
      }),
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) return (body.error as string) ?? 'Failed to save overtime rule'

    await mutate()
    setDialogOpen(false)
    return null
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setActionError(null)
    const res = await fetch(`${ENDPOINT}/${deleteTarget.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      setActionError(body.error ?? 'Failed to delete overtime rule')
    } else {
      await mutate()
    }
    setDeleteTarget(null)
  }

  const rules = data?.rules ?? []
  const dialogGroup = overtimeTypeGroups.find((group) => group.id === dialogType)
  const deleteGroup = overtimeTypeGroups.find((group) => group.id === deleteTarget?.type)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Manage Overtime</h1>
        <p className="mt-2 text-muted-foreground">Configure overtime multiplier rules for different overtime types</p>
      </div>

      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}

      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">
          {error.message}
        </div>
      )}

      {data && (
        <div className="space-y-6">
          {overtimeTypeGroups.map((group) => (
            <OvertimeRuleGroup
              key={group.id}
              group={group}
              rules={rules.filter((rule) => rule.type === group.id)}
              onAdd={() => openCreate(group.id)}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <OvertimeRuleDialog
        open={dialogOpen}
        typeName={dialogGroup?.name ?? ''}
        rule={editingRule}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiplier Rule</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && `${deleteGroup?.name} - ${ordinalHour(deleteTarget.hour)} hour (${deleteTarget.multiplier}x) will be removed. If it has already been used in recorded overtime hours, it is deactivated instead so payroll history is kept.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
