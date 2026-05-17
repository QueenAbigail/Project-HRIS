'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calculator, Download, Send, TrendingUp } from 'lucide-react'
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
import { CalculatePayrollDialog } from './calculate-payroll-dialog'
import { PayrollChart } from './payroll-chart'

export function PayrollHeader() {
  const [openCalculateDialog, setOpenCalculateDialog] = useState(false)
  const [openTrendDrawer, setOpenTrendDrawer] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payroll</h1>
          <p className="text-muted-foreground">
            Manage salary, overtime, and compensation
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={() => setOpenCalculateDialog(true)}
          >
            <Calculator className="mr-2 size-4" />
            Calculate Payroll
          </Button>
          <Button variant="outline">
            <Download className="mr-2 size-4" />
            Export
          </Button>
          <Button className="bg-green-600 hover:bg-green-700">
            <Send className="mr-2 size-4" />
            Process Payment
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

      <CalculatePayrollDialog 
        open={openCalculateDialog} 
        onOpenChange={setOpenCalculateDialog} 
      />

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
    </div>
  )
}
