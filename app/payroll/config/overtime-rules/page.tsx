'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Plus, Trash2 } from 'lucide-react'

const OVERTIME_TYPES = [
  { value: 'regular_backup', label: 'Regular Backup Duty' },
  { value: 'national_holiday', label: 'National Holiday Duty' },
  { value: 'overtime_weekly', label: 'Weekly Overtime' },
]

export default function OvertimeRulesPage() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    multiplier: '',
    maxHoursPerMonth: '',
  })

  useEffect(() => {
    fetchRules()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payroll/overtime-rules')
      if (response.ok) {
        const data = await response.json()
        setRules(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching overtime rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/payroll/overtime-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchRules()
        setIsDialogOpen(false)
        setFormData({
          type: '',
          description: '',
          multiplier: '',
          maxHoursPerMonth: '',
        })
      }
    } catch (error) {
      console.error('[v0] Error saving overtime rule:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this overtime rule?')) {
      try {
        await fetch(`/api/payroll/overtime-rules/${id}`, { method: 'DELETE' })
        await fetchRules()
      } catch (error) {
        console.error('[v0] Error deleting overtime rule:', error)
      }
    }
  }

  const getTypeLabel = (type: string) => {
    return OVERTIME_TYPES.find((t) => t.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overtime Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage overtime multiplier rates and limits
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Overtime Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Overtime Rule</DialogTitle>
              <DialogDescription>
                Configure overtime multiplier rates for different types of overtime work
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="">Select type...</option>
                    {OVERTIME_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Multiplier</label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1.5"
                    value={formData.multiplier}
                    onChange={(e) =>
                      setFormData({ ...formData, multiplier: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    placeholder="e.g., Weekend Overtime"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Hours Per Month</label>
                  <Input
                    type="number"
                    placeholder="Leave empty for no limit"
                    value={formData.maxHoursPerMonth}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxHoursPerMonth: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Rule</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Overtime Rules</CardTitle>
          <CardDescription>
            {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No overtime rules configured yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Multiplier</TableHead>
                  <TableHead className="text-right">Max Hours/Month</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">
                      {getTypeLabel(rule.type)}
                    </TableCell>
                    <TableCell>{rule.description}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {rule.multiplier}x
                    </TableCell>
                    <TableCell className="text-right">
                      {rule.maxHoursPerMonth || 'No limit'}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          rule.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
