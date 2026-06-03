'use client'

import { PhantomSkeleton } from '@/components/phantom-skeleton'

export default function EmployeesLoading() {
  return (
    <PhantomSkeleton loading={true} animation="shimmer">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="h-8 w-48 text-2xl font-bold">Employee Directory</h1>
          <p className="h-4 w-96 text-muted-foreground">Manage and organize your employee information</p>
        </div>

        {/* Search and filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="h-10 w-full rounded-md" placeholder="Search employees" />
          <select className="h-10 w-full rounded-md"><option>Filter</option></select>
          <button className="h-10 w-full rounded-md">Add Employee</button>
        </div>

        {/* Table header */}
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4 p-4 border-b">
            <div className="h-4 w-20 font-medium">Employee</div>
            <div className="h-4 w-16 font-medium">ID</div>
            <div className="h-4 w-20 font-medium">Department</div>
            <div className="h-4 w-20 font-medium">Position</div>
            <div className="h-4 w-16 font-medium">Status</div>
          </div>

          {/* Table rows */}
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <div className="h-4 w-24">Name</div>
                  <div className="h-3 w-32 text-sm">email@company.com</div>
                </div>
              </div>
              <div className="h-4 w-16">ID123</div>
              <div className="h-4 w-20">Department</div>
              <div className="h-4 w-20">Position</div>
              <div className="h-4 w-12 rounded-full bg-green-500/20">Active</div>
            </div>
          ))}
        </div>
      </div>
    </PhantomSkeleton>
  )
}
