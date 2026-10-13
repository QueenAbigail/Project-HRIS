import { ToolsGateway } from '@/components/system/tools-gateway'

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
        <p className="mt-2 text-muted-foreground">Utilities and helpers for managing the system</p>
      </div>
      <ToolsGateway />
    </div>
  )
}
