import Link from 'next/link'
import { ArrowUpRight, Wrench } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { systemTools } from '@/lib/system-tools'

export function ToolsGateway() {
  if (systemTools.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="items-center py-12 text-center">
          <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <Wrench className="size-6 text-muted-foreground" />
          </div>
          <CardTitle>No tools yet</CardTitle>
          <CardDescription>
            Tools you add to the registry will appear here as shortcuts.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {systemTools.map((tool) => {
        const Icon = tool.icon
        return (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-colors group-hover:border-primary/50 group-hover:bg-accent/40">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <CardTitle className="pt-2">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
