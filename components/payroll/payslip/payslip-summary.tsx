import { CheckCircle2, Clock, FileText, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/currency'
import type { PayslipRecord } from './payslip-data'

interface PayslipSummaryProps {
  records: PayslipRecord[]
}

export function PayslipSummary({ records }: PayslipSummaryProps) {
  const totalNetPay = records.reduce((sum, record) => sum + record.netPay, 0)
  const paidCount = records.filter((record) => record.status === 'paid').length
  const pendingCount = records.filter((record) => record.status !== 'paid').length

  const items = [
    { label: 'Payslips', value: String(records.length), hint: 'In selected period', icon: FileText },
    { label: 'Total Net Pay', value: formatCurrency(totalNetPay), hint: 'After deductions', icon: Wallet },
    { label: 'Paid', value: String(paidCount), hint: 'Ready to distribute', icon: CheckCircle2 },
    { label: 'Pending', value: String(pendingCount), hint: 'Awaiting payment', icon: Clock },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, hint, icon: Icon }) => (
        <Card key={label} className="bg-card border-border">
          <CardContent className="flex items-start justify-between gap-3 p-5">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 truncate text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
