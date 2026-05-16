'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface DateRangeFilterProps {
  selectedRange: 'current-month' | 'custom'
  startDate: string
  endDate: string
  onRangeChange: (range: 'current-month' | 'custom') => void
  onDateChange: (startDate: string, endDate: string) => void
}

export function DateRangeFilter({
  selectedRange,
  startDate,
  endDate,
  onRangeChange,
  onDateChange,
}: DateRangeFilterProps) {
  const [customOpen, setCustomOpen] = useState(false)
  const [tempStartDate, setTempStartDate] = useState(startDate)
  const [tempEndDate, setTempEndDate] = useState(endDate)

  const getCurrentMonthDates = () => {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
    }
  }

  const handleMonthlySelect = () => {
    const dates = getCurrentMonthDates()
    onRangeChange('current-month')
    onDateChange(dates.start, dates.end)
  }

  const handleCustomApply = () => {
    if (tempStartDate && tempEndDate) {
      onRangeChange('custom')
      onDateChange(tempStartDate, tempEndDate)
      setCustomOpen(false)
    }
  }

  const handleRangeChange = (value: string) => {
    if (value === 'current-month') {
      handleMonthlySelect()
    } else if (value === 'custom') {
      setCustomOpen(true)
    }
  }

  const getMonthYear = () => {
    const now = new Date()
    return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(now)
  }

  const getDateRangeDisplay = () => {
    if (selectedRange === 'current-month') {
      return getMonthYear()
    }
    return `${startDate} to ${endDate}`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Calendar className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Date Range</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={selectedRange} onValueChange={handleRangeChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select date range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Current Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={customOpen} onOpenChange={setCustomOpen}>
          <DialogTrigger asChild>
            {selectedRange === 'custom' && (
              <Button variant="outline" className="w-full sm:w-auto">
                {getDateRangeDisplay()}
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Select Custom Date Range</DialogTitle>
              <DialogDescription>
                Choose the start and end dates for your report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={tempEndDate}
                  onChange={(e) => setTempEndDate(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCustomOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCustomApply}>Apply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="hidden sm:flex items-center text-sm text-muted-foreground px-3">
          {getDateRangeDisplay()}
        </div>
      </div>
    </div>
  )
}
