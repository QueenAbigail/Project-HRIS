'use client'

import { useState } from 'react'
import { BaseSalaryTab } from '@/components/payroll/salary/base-salary-tab'
import { PositionSalaryTab } from '@/components/payroll/salary/position-salary-tab'

const TABS = [
  { id: 'position', label: 'Position Salary' },
  { id: 'base', label: 'Manage Base Salary' },
] as const

export default function ManageSalaryPage() {
  const [view, setView] = useState<(typeof TABS)[number]['id']>('position')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Salary</h1>
        <p className="mt-2 text-muted-foreground">
          Configure base salary by position for each site. All positions start with minimum wage plus position allowance.
        </p>
      </div>

      <div className="flex w-fit overflow-hidden rounded-lg border border-border bg-background shadow-sm" role="tablist">
        {TABS.map((tab, index) => (
          <div key={tab.id} className="flex">
            {index > 0 && <div className="w-px bg-border" />}
            <button
              role="tab"
              aria-selected={view === tab.id}
              onClick={() => setView(tab.id)}
              className={`px-6 py-2.5 text-sm font-medium transition-all ${
                view === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/20 text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          </div>
        ))}
      </div>

      {view === 'position' ? <PositionSalaryTab /> : <BaseSalaryTab />}
    </div>
  )
}
