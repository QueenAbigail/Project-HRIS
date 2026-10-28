import { ChevronRight, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/currency'
import { getGross, type PayslipRecord, type PayslipSite } from './payslip-data'

interface PayslipSiteTableProps {
  sites: PayslipSite[]
  records: PayslipRecord[]
  onOpen: (siteId: string) => void
}

function getSiteStatus(paid: number, total: number) {
  if (total > 0 && paid === total) {
    return { label: 'All Paid', className: 'bg-success/10 text-success border-success/20' }
  }
  if (paid === 0) {
    return { label: 'Not Started', className: 'bg-muted text-muted-foreground border-border' }
  }
  return { label: 'In Progress', className: 'bg-warning/10 text-warning border-warning/20' }
}

export function PayslipSiteTable({ sites, records, onOpen }: PayslipSiteTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow>
            <TableHead>Site</TableHead>
            <TableHead className="text-center">Employees</TableHead>
            <TableHead className="text-right">Gross</TableHead>
            <TableHead className="text-right">Deductions</TableHead>
            <TableHead className="text-right">Net Pay</TableHead>
            <TableHead className="w-44">Paid</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Open</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sites.map((site) => {
            const siteRecords = records.filter((record) => record.siteId === site.id)
            const gross = siteRecords.reduce((sum, record) => sum + getGross(record), 0)
            const deductions = siteRecords.reduce((sum, record) => sum + record.deductions, 0)
            const net = siteRecords.reduce((sum, record) => sum + record.netPay, 0)
            const paid = siteRecords.filter((record) => record.status === 'paid').length
            const status = getSiteStatus(paid, siteRecords.length)
            const percent = siteRecords.length ? Math.round((paid / siteRecords.length) * 100) : 0

            return (
              <TableRow key={site.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onOpen(site.id)}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2 text-primary">
                      <MapPin className="size-4" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{site.name}</p>
                      <p className="text-xs text-muted-foreground">{site.location}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center text-sm">{siteRecords.length}</TableCell>
                <TableCell className="text-right font-mono text-sm">{formatCurrency(gross)}</TableCell>
                <TableCell className="text-right font-mono text-sm text-destructive">
                  -{formatCurrency(deductions)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">{formatCurrency(net)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={percent} className="h-1.5" aria-label={`${site.name} payment progress`} />
                    <span className="w-12 shrink-0 text-xs text-muted-foreground">
                      {paid}/{siteRecords.length}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={status.className}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpen(site.id)
                    }}
                  >
                    View Payslips
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
