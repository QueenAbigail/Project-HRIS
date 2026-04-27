import { Spinner } from "@/components/ui/spinner"

export default function DashboardLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-background">
      <Spinner className="size-10 md:size-12 text-foreground/60 animate-spin" />
    </div>
  )
}

