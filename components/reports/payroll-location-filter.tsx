'use client'

import { LocationAttendanceStats } from '@/lib/data'
import { MapPin, DollarSign } from 'lucide-react'

interface PayrollLocationFilterProps {
  locations: LocationAttendanceStats[]
  selectedLocationId: string | null
  onLocationSelect: (locationId: string | null) => void
}

export function PayrollLocationFilter({ locations, selectedLocationId, onLocationSelect }: PayrollLocationFilterProps) {
  // Mock payroll data per location (in a real app, this would come from the data)
  const getPayrollForLocation = (locationId: string): number => {
    const payrollMap: Record<string, number> = {
      'H0': 45200,
      'PT-DT': 52800,
      'RM': 48500,
      'MB-CT': 41300,
      'CC-N': 38900,
      'IP-W': 35600,
    }
    return payrollMap[locationId] || 0
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium flex items-center gap-2">
        <MapPin className="size-4" />
        Payroll by Location
      </h4>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((location) => {
          const payrollAmount = getPayrollForLocation(location.locationId)
          return (
            <button
              key={location.locationId}
              onClick={() => onLocationSelect(selectedLocationId === location.locationId ? null : location.locationId)}
              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedLocationId === location.locationId
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-secondary/20 hover:border-border/80'
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-medium">{location.locationName}</p>
                <p className="text-xs text-muted-foreground font-mono">{location.locationId}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-purple-500" />
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-500">{formatCurrency(payrollAmount)}</p>
                    <p className="text-xs text-muted-foreground">total payroll</p>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
