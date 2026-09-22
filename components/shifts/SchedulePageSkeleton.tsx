import { Skeleton } from '@/components/ui/skeleton'

function ShiftListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-9 w-16" />
        </div>
      ))}
    </div>
  )
}

function ScheduleTableSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>
      <Skeleton className="h-4 w-40" />
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-5 gap-4 bg-muted p-4">
          {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-4" />)}
        </div>
        <div className="space-y-0 divide-y divide-border">
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-4 p-4">
              {Array.from({ length: 5 }).map((_, cellIndex) => <Skeleton key={cellIndex} className="h-4" />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SchedulePageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading schedules">
      <span className="sr-only">Loading schedules</span>
      <ShiftListSkeleton />
      <ScheduleTableSkeleton />
    </div>
  )
}
