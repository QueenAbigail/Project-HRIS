'use client'

import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  SKIP_ROW,
  type BackfillCandidate,
  type BackfillRow,
  type BackfillTarget,
  type MatchStatus,
} from '@/lib/employee-backfill-types'
import { cn } from '@/lib/utils'

const statusStyles: Record<MatchStatus, { label: string; className: string }> = {
  matched: {
    label: 'Matched',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
  },
  suggested: {
    label: 'Suggested',
    className: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300',
  },
  ambiguous: {
    label: 'Ambiguous',
    className: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300',
  },
  not_found: {
    label: 'Not found',
    className: 'border-border bg-muted text-muted-foreground',
  },
}

function candidateDetails(candidate: BackfillCandidate) {
  return [candidate.siteName, candidate.position, candidate.status !== 'ACTIVE' ? candidate.status : null]
    .filter(Boolean)
    .join(' · ')
}

interface ReviewTableProps {
  rows: BackfillRow[]
  target: BackfillTarget
  selections: Record<number, string>
  onSelect: (rowNumber: number, value: string) => void
}

export function ReviewTable({ rows, target, selections, onSelect }: ReviewTableProps) {
  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">No rows in this view.</p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Row</TableHead>
            <TableHead>{target === 'code' ? 'Name in file' : 'Code in file'}</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead className="min-w-80">{target === 'code' ? 'Employee code to fill' : 'Employee name to fill'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const selection = selections[row.rowNumber]
            const status = statusStyles[row.status]
            const needsDecision = selection === undefined
            return (
              <TableRow key={row.rowNumber} className={cn(needsDecision && 'bg-amber-50/40 dark:bg-amber-950/20')}>
                <TableCell className="font-mono text-xs text-muted-foreground">{row.rowNumber}</TableCell>
                <TableCell className="font-medium">{row.reference}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select value={selection ?? ''} onValueChange={(value) => onSelect(row.rowNumber, value)}>
                    <SelectTrigger
                      className={cn('w-full', needsDecision && 'border-amber-400')}
                      aria-label={`Choose employee for row ${row.rowNumber}`}
                    >
                      <SelectValue placeholder="Choose an employee…" />
                    </SelectTrigger>
                    <SelectContent>
                      {row.candidates.map((candidate) => {
                        const value = target === 'code' ? candidate.employeeCode : candidate.name
                        const details = candidateDetails(candidate)
                        return (
                          <SelectItem key={candidate.id} value={candidate.id} disabled={!value}>
                            <span className="flex flex-col items-start text-left">
                              <span>
                                <span className="font-medium">{value ?? 'No code on record'}</span>
                                {target === 'code' ? ` — ${candidate.name}` : ` — ${candidate.employeeCode ?? ''}`}
                                {candidate.score < 1 && (
                                  <span className="ml-1 text-xs text-muted-foreground">
                                    {`(${Math.round(candidate.score * 100)}%)`}
                                  </span>
                                )}
                              </span>
                              {details && <span className="text-xs text-muted-foreground">{details}</span>}
                            </span>
                          </SelectItem>
                        )
                      })}
                      <SelectItem value={SKIP_ROW}>
                        <span className="text-muted-foreground">Leave blank</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
