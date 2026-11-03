'use client'

import { Edit2, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ordinalHour } from '@/lib/overtime-rules'
import type { OvertimeRule, overtimeTypeGroups } from './types'

interface OvertimeRuleGroupProps {
  group: (typeof overtimeTypeGroups)[number]
  rules: OvertimeRule[]
  onAdd: () => void
  onEdit: (rule: OvertimeRule) => void
  onDelete: (rule: OvertimeRule) => void
}

export function OvertimeRuleGroup({ group, rules, onAdd, onEdit, onDelete }: OvertimeRuleGroupProps) {
  return (
    <section className="overflow-hidden rounded-lg border">
      <div className="flex items-start justify-between border-b bg-muted/30 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold">{group.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
        </div>
        <Badge variant="secondary">
          {rules.length} rule{rules.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Hour</TableHead>
            <TableHead className="w-28">Multiplier</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                No multiplier rules configured
              </TableCell>
            </TableRow>
          ) : (
            rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-medium">{ordinalHour(rule.hour)}</TableCell>
                <TableCell className="font-semibold">{rule.multiplier}x</TableCell>
                <TableCell className="text-muted-foreground">{rule.description}</TableCell>
                <TableCell>
                  <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>{rule.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" aria-label={`Edit ${group.name} ${ordinalHour(rule.hour)} hour`} onClick={() => onEdit(rule)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label={`Delete ${group.name} ${ordinalHour(rule.hour)} hour`} onClick={() => onDelete(rule)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="border-t bg-muted/20 px-6 py-3">
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add Multiplier Rule
        </Button>
      </div>
    </section>
  )
}
