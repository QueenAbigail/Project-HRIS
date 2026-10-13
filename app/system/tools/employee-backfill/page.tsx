import Link from 'next/link'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackfillTool } from '@/components/tools/employee-backfill/backfill-tool'
import { canUseSystemTools } from '@/lib/authorization'
import { getCurrentUser } from '@/lib/system'

export const metadata = {
  title: 'Employee Backfill | Tools',
}

export default async function EmployeeBackfillPage() {
  const user = await getCurrentUser()
  const allowed = canUseSystemTools(user?.role)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2 text-muted-foreground">
          <Link href="/system/tools">
            <ArrowLeft className="size-4" />
            All tools
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Backfill</h1>
          <p className="mt-2 text-muted-foreground">
            Fill missing employee codes from names, or names from codes, in your own Excel file.
          </p>
        </div>
      </div>

      {allowed ? (
        <BackfillTool />
      ) : (
        <Card>
          <CardHeader className="items-center py-12 text-center">
            <ShieldAlert className="mb-2 size-8 text-muted-foreground" />
            <CardTitle>Access restricted</CardTitle>
            <CardDescription>This tool is available to Super Admin and HR Admin only.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  )
}
