import { AlertTriangle, CheckCircle2, Clock3, FileText, LockKeyhole, Send } from 'lucide-react'

const activities = [
  { label: 'Payroll calculation completed', detail: 'March 2026 · 247 employees processed', time: 'Today, 12:00 AM', icon: CheckCircle2, tone: 'text-success' },
  { label: 'Attendance validation needs review', detail: '2 employees have missing records', time: 'Requires attention', icon: AlertTriangle, tone: 'text-amber-500' },
  { label: 'Payslips are ready to send', detail: '247 payslips available for delivery', time: 'Not sent yet', icon: FileText, tone: 'text-primary' },
]

export function PayrollOperationsOverview() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.05fr_1.95fr]" aria-label="Payroll operations overview">
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Payroll readiness</p>
            <h2 className="mt-1 text-xl font-semibold">Action required</h2>
          </div>
          <span className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500"><AlertTriangle className="size-5" aria-hidden="true" /></span>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">Resolve the remaining validation issue before finalizing this payroll period.</p>
        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3"><Clock3 className="size-4 text-amber-500" aria-hidden="true" /><span className="text-sm">2 missing attendance records</span></div>
          <div className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3"><LockKeyhole className="size-4 text-muted-foreground" aria-hidden="true" /><span className="text-sm text-muted-foreground">Finalize after validation clears</span></div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-muted-foreground">Payroll activity</p><h2 className="mt-1 text-xl font-semibold">March 2026 processing</h2></div><Send className="size-5 text-muted-foreground" aria-hidden="true" /></div>
        <div className="mt-5 divide-y">
          {activities.map(({ label, detail, time, icon: Icon, tone }) => <div key={label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"><Icon className={`mt-0.5 size-4 shrink-0 ${tone}`} aria-hidden="true" /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><span className="shrink-0 text-right text-xs text-muted-foreground">{time}</span></div>)}
        </div>
      </div>
    </section>
  )
}
