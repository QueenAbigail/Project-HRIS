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

const DEDUCTION_TYPES = [
  { value: 'tax', label: 'Income Tax' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'health', label: 'Health/Medical' },
  { value: 'pension', label: 'Pension/401K' },
  { value: 'special', label: 'Special' },
]

const DEDUCTION_CALC_TYPES = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed_amount', label: 'Fixed Amount' },
]

const RISK_LEVELS = [
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' },
  { value: 'high', label: 'High Risk' },
]

export default function DeductionRulesPage() {
  const [rules, setRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    positionId: '',
    siteId: '',
    name: '',
    type: '',
    deductionType: 'percentage',
    value: '',
    riskLevel: '',
    effectiveDate: '',
    endDate: '',
  })
  const [sites, setSites] = useState<any[]>([])

  useEffect(() => {
    fetchRules()
    fetchSites()
  }, [])

  const fetchRules = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/payroll/deduction-rules')
      if (response.ok) {
        const data = await response.json()
        setRules(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching deduction rules:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/sites')
      if (response.ok) {
        const data = await response.json()
        setSites(data)
      }
    } catch (error) {
      console.error('[v0] Error fetching sites:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/payroll/deduction-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchRules()
        setIsDialogOpen(false)
        setFormData({
          positionId: '',
          siteId: '',
          name: '',
          type: '',
          deductionType: 'percentage',
          value: '',
          riskLevel: '',
          effectiveDate: '',
          endDate: '',
        })
      }
    } catch (error) {
      console.error('[v0] Error saving deduction rule:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this deduction rule?')) {
      try {
        await fetch(`/api/payroll/deduction-rules/${id}`, { method: 'DELETE' })
        await fetchRules()
      } catch (error) {
        console.error('[v0] Error deleting deduction rule:', error)
      }
    }
  }

  const getTypeLabel = (type: string) => {
    return DEDUCTION_TYPES.find((t) => t.value === type)?.label || type
  }

  const getCalcTypeLabel = (type: string) => {
    return DEDUCTION_CALC_TYPES.find((t) => t.value === type)?.label || type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deduction Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage deduction rates by position and site
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Deduction Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Deduction Rule</DialogTitle>
              <DialogDescription>
                Configure deduction rates for a position at a site
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Position ID</label>
                  <Input
                    placeholder="e.g., security-guard"
                    value={formData.positionId}
                    onChange={(e) =>
                      setFormData({ ...formData, positionId: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Site</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.siteId}
                    onChange={(e) =>
                      setFormData({ ...formData, siteId: e.target.value })
                    }
                    required
                  >
                    <option value="">Select site...</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Deduction Name</label>
                  <Input
                    placeholder="e.g., Health Insurance"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    required
                  >
                    <option value="">Select type...</option>
                    {DEDUCTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Calculation Type</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.deductionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deductionType: e.target.value,
                      })
                    }
                    required
                  >
                    {DEDUCTION_CALC_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Value ({formData.deductionType === 'percentage' ? '%' : 'Amount'})
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.value}
                    onChange={(e) =>
                      setFormData({ ...formData, value: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Risk Level</label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.riskLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        riskLevel: e.target.value,
                      })
                    }
                  >
                    <option value="">None</option>
                    {RISK_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Effective Date</label>
                  <Input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        effectiveDate: e.target.value,
                      })
                    }
                    required
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
          <CardTitle>Active Deduction Rules</CardTitle>
          <CardDescription>
            {rules.length} rule{rules.length !== 1 ? 's' : ''} configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No deduction rules configured yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Deduction Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.positionId}</TableCell>
                    <TableCell>{rule.site?.name}</TableCell>
                    <TableCell>{rule.name}</TableCell>
                    <TableCell>{getTypeLabel(rule.type)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {rule.deductionType === 'percentage'
                        ? `${rule.value}%`
                        : `Rp ${parseInt(rule.value).toLocaleString('id-ID')}`}
                    </TableCell>
                    <TableCell>{rule.riskLevel || '-'}</TableCell>
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
