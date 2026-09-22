'use client'

import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Users, Clock, Calendar, AlertTriangle, FileText, DollarSign } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>
  title: string
  description: string
  className?: string
}

export function EmptyState({ icon: Icon = Users, title, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 text-center ${className}`}>
      <div className="size-12 text-muted-foreground mb-4">
        {typeof Icon === 'function' ? <Icon className="size-12" /> : Icon}
      </div>
      <p className="text-lg font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
