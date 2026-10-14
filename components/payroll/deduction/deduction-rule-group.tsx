'use client'

import { Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ALL_SCOPE,
  type DeductionRule,
  type SiteOption,
  deductionTypeGroups,
} from './types'

interface DeductionRuleGroupProps {
  group: (typeof deductionTypeGroups)[number]
  rules: DeductionRule[]
  sites: SiteOption[]
  onEdit: (rule: DeductionRule) => void
  onDeactivate: (rule: DeductionRule) => void
}

function formatValue(rule: DeductionRule) {
  return rule.deductionType === 'percentage'
    ? `${rule.value}%`
    : `Rp ${rule.value.toLocaleString('id-ID')}`
}

export function DeductionRuleGroup({
  group,
  rules,
  sites,
  onEdit,
  onDeactivate,
}: DeductionRuleGroupProps) {
  const siteName = (siteId: string) =>
    siteId === ALL_SCOPE ? 'All sites' : (sites.find((s) => s.id === siteId)?.name ?? 'Unknown site')

  return (
    <section className="overflow-hidden rounded-lg border">
      <div className="flex items-start justify-between border-b bg-muted/30 px-6 py-4">
        <div>
          <h2 className={`text-lg font-semibold ${group.color}`}>{group.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{group.description}</p>
        </div>
        <Badge variant="secondary">
          {rules.length} rule{rules.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deduction Name</TableHead>
            <TableHead>Calculation</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Applies To</TableHead>
            <TableHead>Effective</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id}>
              <TableCell className="font-medium">
                {rule.name}
                {rule.riskLevel && (
                  <span className="ml-2 text-xs capitalize text-muted-foreground">
                    {rule.riskLevel} risk
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {rule.deductionType === 'percentage' ? 'Percentage' : 'Fixed'}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">{formatValue(rule)}</TableCell>
              <TableCell className="text-sm">
                <div>{rule.positionId === ALL_SCOPE ? 'All positions' : rule.positionId}</div>
                <div className="text-muted-foreground">{siteName(rule.siteId)}</div>
              </TableCell>
              <TableCell className="text-sm">
                <div>{rule.effectiveDate}</div>
                {rule.endDate && (
                  <div className="text-muted-foreground">until {rule.endDate}</div>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={rule.status === 'active' ? 'default' : 'secondary'}>
                  {rule.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${rule.name}`}
                    onClick={() => onEdit(rule)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {rule.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Deactivate ${rule.name}`}
                      onClick={() => onDeactivate(rule)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  )
}
