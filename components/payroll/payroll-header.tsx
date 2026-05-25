'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Send, TrendingUp, DollarSign } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { PayrollChart } from './payroll-chart'
import { PayrollPayRateDialog } from './payroll-pay-rate-dialog'
import { EmployeeDebtDialog } from './employee-debt-dialog'

export function PayrollHeader() {
  const [openTrendDrawer, setOpenTrendDrawer] = useState(false)
  const [openPayRateDialog, setOpenPayRateDialog] = useState(false)
  const [openDebtDialog, setOpenDebtDialog] = useState(false)
  // In production, this would come from your database/backend
  const lastCalculatedTime = new Date(2026, 2, 17, 0, 0, 0).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground">
            Manage salary, overtime, and compensation
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last calculated: {lastCalculatedTime} (Auto-calculated daily at midnight)
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setOpenPayRateDialog(true)}
          >
            <Send className="mr-2 size-4" />
            Payroll Pay Rate
          </Button>
          <Button 
            variant="outline"
            onClick={() => setOpenDebtDialog(true)}
            className="gap-2"
          >
            <DollarSign className="size-4" />
            Manage Debts
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Select defaultValue="march-2026">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="march-2026">March 2026</SelectItem>
              <SelectItem value="february-2026">February 2026</SelectItem>
              <SelectItem value="january-2026">January 2026</SelectItem>
              <SelectItem value="december-2025">December 2025</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="field">Field Security</SelectItem>
              <SelectItem value="surveillance">Surveillance</SelectItem>
              <SelectItem value="patrol">Patrol</SelectItem>
              <SelectItem value="admin">Administration</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          variant="outline"
          onClick={() => setOpenTrendDrawer(true)}
          className="w-full sm:w-auto"
        >
          <TrendingUp className="mr-2 size-4" />
          Payroll Trend
        </Button>
      </div>

      <Drawer open={openTrendDrawer} onOpenChange={setOpenTrendDrawer}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Payroll Trend</DrawerTitle>
            <DrawerDescription>
              Monthly payroll expenses and trends over the last 6 months
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-6">
            <PayrollChart />
          </div>
        </DrawerContent>
      </Drawer>

      <PayrollPayRateDialog 
        open={openPayRateDialog}
        onOpenChange={setOpenPayRateDialog}
      />

      <EmployeeDebtDialog 
        open={openDebtDialog}
        onOpenChange={setOpenDebtDialog}
      />
    </div>
  )
}
