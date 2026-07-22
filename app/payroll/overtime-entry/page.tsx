'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Download, Upload, Loader2 } from 'lucide-react'

interface OvertimeEntry {
  employeeId: string
  employeeName: string
  backupHours: number
  holidayHours: number
  weeklyOtHours: number
}

export default function OvertimeEntryPage() {
  const [payrollPeriods, setPayrollPeriods] = useState<any[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [entries, setEntries] = useState<OvertimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [overtimeRules, setOvertimeRules] = useState<any[]>([])
  const [loadingTemplate, setLoadingTemplate] = useState(false)

  useEffect(() => {
    fetchPayrollPeriods()
    fetchEmployees()
    fetchOvertimeRules()
  }, [])

  const fetchPayrollPeriods = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payroll/periods')
      if (response.ok) {
        const data = await response.json()
        setPayrollPeriods(data)
        if (data.length > 0) {
          setSelectedPeriod(data[0].id)
        }
      }
    } catch (error) {
      console.error('[v0] Error fetching payroll periods:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/users?role=STAFF')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching employees:', error)
    }
  }

  const fetchOvertimeRules = async () => {
    try {
      const response = await fetch('/api/payroll/overtime-rules')
      if (response.ok) {
        const data = await response.json()
        setOvertimeRules(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching overtime rules:', error)
    }
  }

  const loadPreviousMonthTemplate = async () => {
    try {
      setLoadingTemplate(true)
      // Get previous month's overtime data
      // For now, initialize with empty entries for all employees
      const templateEntries: OvertimeEntry[] = employees.map((emp) => ({
        employeeId: emp.id,
        employeeName: emp.name,
        backupHours: 0,
        holidayHours: 0,
        weeklyOtHours: 0,
      }))
      setEntries(templateEntries)
    } catch (error) {
      console.error('[v0] Error loading template:', error)
    } finally {
      setLoadingTemplate(false)
    }
  }

  const handleEntryChange = (index: number, field: string, value: number) => {
    const newEntries = [...entries]
    newEntries[index] = {
      ...newEntries[index],
      [field]: value,
    }
    setEntries(newEntries)
  }

  const handleSave = async () => {
    if (!selectedPeriod) {
      alert('Please select a payroll period')
      return
    }

    try {
      setSaving(true)

      // Transform entries to API format
      const apiEntries = []
      for (const entry of entries) {
        const backupRule = overtimeRules.find((r) => r.type === 'regular_backup')
        const holidayRule = overtimeRules.find((r) => r.type === 'national_holiday')
        const weeklyRule = overtimeRules.find((r) => r.type === 'overtime_weekly')

        if (entry.backupHours > 0 && backupRule) {
          apiEntries.push({
            userId: entry.employeeId,
            overtimeRuleId: backupRule.id,
            date: new Date().toISOString().split('T')[0],
            hours: entry.backupHours,
            description: 'Backup duty',
          })
        }
        if (entry.holidayHours > 0 && holidayRule) {
          apiEntries.push({
            userId: entry.employeeId,
            overtimeRuleId: holidayRule.id,
            date: new Date().toISOString().split('T')[0],
            hours: entry.holidayHours,
            description: 'National holiday duty',
          })
        }
        if (entry.weeklyOtHours > 0 && weeklyRule) {
          apiEntries.push({
            userId: entry.employeeId,
            overtimeRuleId: weeklyRule.id,
            date: new Date().toISOString().split('T')[0],
            hours: entry.weeklyOtHours,
            description: 'Weekly overtime',
          })
        }
      }

      const response = await fetch('/api/payroll/overtime-hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payrollPeriodId: selectedPeriod,
          entries: apiEntries,
        }),
      })

      if (response.ok) {
        alert('Overtime entries saved successfully!')
      }
    } catch (error) {
      console.error('[v0] Error saving overtime entries:', error)
      alert('Failed to save overtime entries')
    } finally {
      setSaving(false)
    }
  }

  const handleExportCSV = () => {
    if (entries.length === 0) {
      alert('No entries to export')
      return
    }

    const csv = [
      ['Employee ID', 'Employee Name', 'Backup Hours', 'Holiday Hours', 'Weekly OT Hours'],
      ...entries.map((e) => [
        e.employeeId,
        e.employeeName,
        e.backupHours,
        e.holidayHours,
        e.weeklyOtHours,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `overtime-${selectedPeriod}-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.trim().split('\n')
        const importedEntries: OvertimeEntry[] = []

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const [empId, empName, backup, holiday, weekly] = lines[i].split(',')
          importedEntries.push({
            employeeId: empId.trim(),
            employeeName: empName.trim(),
            backupHours: parseFloat(backup) || 0,
            holidayHours: parseFloat(holiday) || 0,
            weeklyOtHours: parseFloat(weekly) || 0,
          })
        }

        setEntries(importedEntries)
        alert(`Imported ${importedEntries.length} entries`)
      } catch (error) {
        console.error('[v0] Error importing CSV:', error)
        alert('Failed to import CSV')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overtime Entry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage overtime hours for employees by payroll period
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center">Loading...</CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Select Payroll Period</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full px-3 py-2 border rounded-md"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="">Select period...</option>
                {payrollPeriods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {new Date(period.month).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                    })}{' '}
                    - {period.status}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Overtime Hours</CardTitle>
                <CardDescription>
                  Summary entry for all employees (total hours by type)
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadPreviousMonthTemplate}
                  disabled={loadingTemplate}
                >
                  {loadingTemplate ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Load Previous Month
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="table" className="w-full">
                <TabsList>
                  <TabsTrigger value="table">Table Editor</TabsTrigger>
                  <TabsTrigger value="csv">CSV Import/Export</TabsTrigger>
                </TabsList>

                <TabsContent value="table" className="space-y-4">
                  {entries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Load template or add entries manually
                    </div>
                  ) : (
                    <>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Employee Name</TableHead>
                              <TableHead>Backup Hours</TableHead>
                              <TableHead>Holiday Hours</TableHead>
                              <TableHead>Weekly OT Hours</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {entries.map((entry, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">
                                  {entry.employeeName}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.5"
                                    value={entry.backupHours}
                                    onChange={(e) =>
                                      handleEntryChange(
                                        idx,
                                        'backupHours',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.5"
                                    value={entry.holidayHours}
                                    onChange={(e) =>
                                      handleEntryChange(
                                        idx,
                                        'holidayHours',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-20"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.5"
                                    value={entry.weeklyOtHours}
                                    onChange={(e) =>
                                      handleEntryChange(
                                        idx,
                                        'weeklyOtHours',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-20"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={handleExportCSV}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </Button>
                        <Button
                          onClick={handleSave}
                          disabled={saving || entries.length === 0}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Save & Approve All
                        </Button>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="csv" className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium mb-2">Upload CSV File</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Format: Employee ID, Employee Name, Backup Hours, Holiday Hours,
                      Weekly OT Hours
                    </p>
                    <label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleImportCSV}
                        className="hidden"
                      />
                      <Button variant="outline" asChild className="cursor-pointer">
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </span>
                      </Button>
                    </label>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
