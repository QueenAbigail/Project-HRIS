import { PatrolHeader } from '@/components/patrol/patrol-header'
import { PatrolStats } from '@/components/patrol/patrol-stats'
import { PatrolBySiteView } from '@/components/patrol/patrol-by-site-view'

export default function PatrolPage() {
  return (
    <div className="space-y-6">
      <PatrolHeader />
      <PatrolStats />
      <PatrolBySiteView />
    </div>
  )
}
