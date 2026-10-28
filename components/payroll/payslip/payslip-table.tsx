import { Eye } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { formatCurrency } from '@/lib/currency'
import type { PayslipRecord } from './payslip-data'

const statusStyles: Record<PayslipRecord['status'], string> = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
}

interface PayslipTableProps {
  records: PayslipRecord[]
  onView: (record: PayslipRecord) => void
}

export function PayslipTable({ records, onView }: PayslipTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead className="text-right">Gross</TableHead>
            <TableHead className="text-right">Deductions</TableHead>
            <TableHead className="text-right">Net Pay</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Payslip</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const gross = record.baseSalary + record.overtime + record.bonus + record.allowances
            return (
              <TableRow key={record.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={`/avatars/${record.id}.jpg`} alt={record.name} />
                      <AvatarFallback className="bg-primary/10 text-xs text-primary">
                        {record.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{record.name}</p>
                      <p className="text-xs text-muted-foreground">{record.id}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{record.department}</TableCell>
                <TableCell className="text-right font-mono text-sm">{formatCurrency(gross)}</TableCell>
                <TableCell className="text-right font-mono text-sm text-destructive">
                  -{formatCurrency(record.deductions)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold">
                  {formatCurrency(record.netPay)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[record.status]}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => onView(record)}>
                    <Eye className="size-4" aria-hidden="true" />
                    View
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
