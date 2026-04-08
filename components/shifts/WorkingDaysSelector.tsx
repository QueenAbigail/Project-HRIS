'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarDays, Check } from 'lucide-react'
import { useState } from 'react'
import { useSchedulesStore } from '@/stores/useSchedulesStore'
import { toast } from 'sonner'

interface WorkingDaysSelectorProps {
  employeeId: string
  currentDays: number[]
  onDaysChange?: (days: number[]) => void
}

export function WorkingDaysSelector({ employeeId, currentDays, onDaysChange }: WorkingDaysSelectorProps) {
  const updateEmployeeWorkingDays = useSchedulesStore(state => state.updateEmployeeWorkingDays)
  const [open, setOpen] = useState(false)
  const [selectedDays, setSelectedDays] = useState<number[]>(currentDays)

  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
  const dayNumbers = [0, 1, 2, 3, 4, 5, 6] as const

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    )
  }

  const saveDays = () => {
    updateEmployeeWorkingDays(employeeId, selectedDays)
    onDaysChange?.(selectedDays)
    setOpen(false)
    toast.success(`Working days updated for ${employeeId}`)
  }

  const activeCount = selectedDays.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <CalendarDays className="size-4" />
          <span>{activeCount} days selected</span>
          {activeCount > 0 && (
            <div className="ml-auto flex size-2 items-center justify-center rounded-full bg-success">
              <Check className="size-1.5" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-2 text-center">
            {dayNumbers.map(day => (
              <Button
                key={day}
                variant={selectedDays.includes(day) ? "default" : "ghost"}
                size="sm"
                className="h-10 w-10 p-0"
                onClick={() => toggleDay(day)}
              >
                <Label className="cursor-pointer font-normal text-sm">{dayNamesShort[day]}</Label>
              </Button>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedDays([])}>
              Clear All
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedDays(dayNumbers.slice(1,6))}>
              Mon-Fri
            </Button>
            <Button size="sm" className="flex-1" onClick={saveDays}>
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

