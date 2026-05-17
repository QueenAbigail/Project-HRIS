'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface PayrollConfig {
  baseDailyRate: number
  overtimeMultiplier: number
  taxPercentage: number
  insurancePercentage: number
  otherDeductionsPercentage: number
  bonusPercentage: number
  allowanceAmount: number
}

interface PayrollPayRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PayrollPayRateDialog({
  open,
  onOpenChange,
}: PayrollPayRateDialogProps) {
  const [config, setConfig] = useState<PayrollConfig>({
    baseDailyRate: 127.27,
    overtimeMultiplier: 1.5,
    taxPercentage: 5,
    insurancePercentage: 3,
    otherDeductionsPercentage: 2,
    bonusPercentage: 3,
    allowanceAmount: 150,
  })

  const [originalConfig, setOriginalConfig] = useState<PayrollConfig>(config)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (key: keyof PayrollConfig, value: string) => {
    const numValue = parseFloat(value) || 0
    const newConfig = { ...config, [key]: numValue }
    setConfig(newConfig)
    setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(originalConfig))
    setSaveSuccess(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      setOriginalConfig(config)
      setHasChanges(false)
      setSaveSuccess(true)
      setIsSaving(false)
      
      // Log for debugging
      console.log('[v0] Payroll config saved:', config)
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onOpenChange(false)
        setSaveSuccess(false)
      }, 2000)
    }, 1500)
  }

  const handleCancel = () => {
    setConfig(originalConfig)
    setHasChanges(false)
    setSaveSuccess(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Payroll Configuration</DialogTitle>
          <DialogDescription>
            Manage global payroll settings including tax rates, multipliers, and deductions
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="rates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rates">Rates & Multipliers</TabsTrigger>
            <TabsTrigger value="deductions">Deductions & Allowances</TabsTrigger>
          </TabsList>

          {/* Rates & Multipliers Tab */}
          <TabsContent value="rates" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="baseDailyRate">
                  Base Daily Rate ($)
                  <span className="text-xs text-muted-foreground ml-1">
                    Standard daily pay amount
                  </span>
                </Label>
                <Input
                  id="baseDailyRate"
                  type="number"
                  step="0.01"
                  value={config.baseDailyRate}
                  onChange={(e) => handleChange('baseDailyRate', e.target.value)}
                  placeholder="0.00"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overtimeMultiplier">
                  Overtime Multiplier (x)
                  <span className="text-xs text-muted-foreground ml-1">
                    Multiplier for overtime hours
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="overtimeMultiplier"
                    type="number"
                    step="0.1"
                    value={config.overtimeMultiplier}
                    onChange={(e) => handleChange('overtimeMultiplier', e.target.value)}
                    placeholder="0.0"
                    disabled={isSaving}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    (e.g., 1.5x = 50% extra)
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-muted-foreground">
                  <strong>Example:</strong> If base rate is ${config.baseDailyRate.toFixed(2)} and overtime multiplier is {config.overtimeMultiplier}x, 
                  overtime pay per hour would be ${(config.baseDailyRate / 8 * config.overtimeMultiplier).toFixed(2)}
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Deductions & Allowances Tab */}
          <TabsContent value="deductions" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxPercentage">
                  Tax Rate (%)
                  <span className="text-xs text-muted-foreground ml-1">
                    Percentage of gross pay
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="taxPercentage"
                    type="number"
                    step="0.1"
                    value={config.taxPercentage}
                    onChange={(e) => handleChange('taxPercentage', e.target.value)}
                    placeholder="0.0"
                    disabled={isSaving}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="insurancePercentage">
                  Insurance Deduction (%)
                  <span className="text-xs text-muted-foreground ml-1">
                    Percentage of gross pay
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="insurancePercentage"
                    type="number"
                    step="0.1"
                    value={config.insurancePercentage}
                    onChange={(e) => handleChange('insurancePercentage', e.target.value)}
                    placeholder="0.0"
                    disabled={isSaving}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherDeductionsPercentage">
                  Other Deductions (%)
                  <span className="text-xs text-muted-foreground ml-1">
                    Percentage of gross pay
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="otherDeductionsPercentage"
                    type="number"
                    step="0.1"
                    value={config.otherDeductionsPercentage}
                    onChange={(e) => handleChange('otherDeductionsPercentage', e.target.value)}
                    placeholder="0.0"
                    disabled={isSaving}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonusPercentage">
                  Bonus Rate (%)
                  <span className="text-xs text-muted-foreground ml-1">
                    Percentage bonus on gross pay
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bonusPercentage"
                    type="number"
                    step="0.1"
                    value={config.bonusPercentage}
                    onChange={(e) => handleChange('bonusPercentage', e.target.value)}
                    placeholder="0.0"
                    disabled={isSaving}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowanceAmount">
                  Standard Allowance ($)
                  <span className="text-xs text-muted-foreground ml-1">
                    Fixed allowance amount per employee
                  </span>
                </Label>
                <Input
                  id="allowanceAmount"
                  type="number"
                  step="0.01"
                  value={config.allowanceAmount}
                  onChange={(e) => handleChange('allowanceAmount', e.target.value)}
                  placeholder="0.00"
                  disabled={isSaving}
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-muted-foreground">
                  <strong>Deduction Summary:</strong> Tax ({config.taxPercentage}%) + Insurance ({config.insurancePercentage}%) + Other ({config.otherDeductionsPercentage}%) = {(config.taxPercentage + config.insurancePercentage + config.otherDeductionsPercentage).toFixed(1)}% total
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Change Alert */}
        {hasChanges && (
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              Changes will trigger automatic payroll recalculation for the next period
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <Alert className="bg-green-500/10 border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Payroll configuration saved successfully
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
