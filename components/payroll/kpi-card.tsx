import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type KpiTone = 'neutral' | 'success' | 'destructive'

const toneStyles: Record<KpiTone, { icon: string; value: string }> = {
  neutral: { icon: 'bg-primary/10 text-primary', value: 'text-foreground' },
  success: { icon: 'bg-success/10 text-success', value: 'text-success' },
  destructive: { icon: 'bg-destructive/10 text-destructive', value: 'text-destructive' },
}

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  tone?: KpiTone
}

export function KpiCard({ label, value, icon: Icon, tone = 'neutral' }: KpiCardProps) {
  const styles = toneStyles[tone]

  return (
    <Card className="min-w-0">
      <CardContent className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', styles.icon)}
            aria-hidden="true"
          >
            <Icon className="size-4" />
          </span>
          <p className="truncate text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        <p
          title={value}
          className={cn('truncate text-xl font-bold tabular-nums tracking-tight', styles.value)}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  )
}
