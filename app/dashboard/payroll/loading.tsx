'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function PayrollLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">Payroll Management</h1>
          <p className="h-4 w-96 text-muted-foreground">Manage employee payroll and salary</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-border rounded-lg p-4 space-y-2">
              <div className="h-4 w-20 text-sm">Total Payroll</div>
              <div className="h-6 w-24 font-bold text-lg">$450,000</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="h-10 w-full rounded-md" placeholder="Search" />
          <select className="h-10 w-full rounded-md"><option>Month</option></select>
          <button className="h-10 w-full rounded-md">Generate Report</button>
        </div>

        {/* Payroll table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                <div className="h-8 w-full">Employee</div>
                <div className="h-8 w-full">Base Salary</div>
                <div className="h-8 w-full">Deductions</div>
                <div className="h-8 w-full">Allowances</div>
                <div className="h-8 w-full">Net Salary</div>
                <div className="h-8 w-full">Status</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PhantomSkeleton>
  )
}
