import { PatrolHeader } from '@/components/patrol/patrol-header'
import { CheckpointStatusDashboard } from '@/components/patrol/checkpoint-status-dashboard'
import { PatrolTimelineView } from '@/components/patrol/patrol-timeline-view'
import { PatrolPageClient } from '@/components/patrol/patrol-page-client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { MapPin } from 'lucide-react'

export default async function PatrolPage() {
  // Get current user to check if CLIENT role
  const currentUser = await getCurrentUser()
  const isClient = currentUser?.role === 'CLIENT'
  
  // Fetch companies and sites from database
  const companies = await prisma.company.findMany({
    where: isClient ? { id: currentUser?.companyId } : undefined,
    include: {
      sites: {
        include: {
          patrolLocations: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  // Transform data for client component
  const clientsData = companies.map((company) => ({
    id: company.id,
    name: company.name,
    totalSites: company.sites.length,
  }))

  const sitesByClientData: Record<string, any[]> = {}
  companies.forEach((company) => {
    sitesByClientData[company.id] = company.sites.map((site) => ({
      id: site.id,
      clientId: company.id,
      name: site.name,
      code: site.code,
      checkpointCount: site.patrolLocations.length,
    }))
  })

  if (clientsData.length === 0) {
    return (
      <div className="space-y-6">
        <PatrolHeader />
        <div className="p-8 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No sites available. Please set up sites in the admin panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PatrolHeader />
      <PatrolPageClient 
        clients={clientsData} 
        sitesByClient={sitesByClientData}
      />
    </div>
  )
}

