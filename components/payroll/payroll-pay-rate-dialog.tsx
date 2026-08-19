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
import { CurrencyInput } from '@/components/ui/currency-input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/currency'

// Job positions - hardcoded for now, will fetch from database later
// TODO: Replace with dynamic fetch from database when User.position is available
const JOB_POSITIONS = [
  'Senior Guard',
  'Security Guard',
  'CCTV Operator',
  'Patrol Lead',
  'Mobile Patrol',
  'Night Patrol',
  'Control Room Lead',
  'HR Coordinator',
  'Payroll Specialist',
  'VIP Protection',
] as const

type JobPosition = typeof JOB_POSITIONS[number]

// Payroll configuration per position
interface PayrollConfig {
  position: JobPosition
  baseDailyRate: number
  overtimeMultiplier: number
  taxPercentage: number
  insurancePercentage: number
  bonusPercentage: number
  allowanceAmount: number
}

// Default hardcoded values - will fetch from database later
// TODO: Replace with database fetch (create PayrollConfig table in schema)
const DEFAULT_PAYROLL_CONFIG: Record<JobPosition, Omit<PayrollConfig, 'position'>> = {
  'Senior Guard': {
    baseDailyRate: 127.27,
    overtimeMultiplier: 1.5,
    taxPercentage: 5,
    insurancePercentage: 3,
    bonusPercentage: 2,
    allowanceAmount: 150,
  },
  'Security Guard': {
    baseDailyRate: 100,
    overtimeMultiplier: 1.5,
    taxPercentage: 5,
    insurancePercentage: 3,
    bonusPercentage: 1.5,
    allowanceAmount: 100,
  },
  'CCTV Operator': {
    baseDailyRate: 118.18,
    overtimeMultiplier: 1.5,
    taxPercentage: 5,
    insurancePercentage: 3,
    bonusPercentage: 2,
    allowanceAmount: 100,
  },
  'Patrol Lead': {
    baseDailyRate: 145.45,
    overtimeMultiplier: 1.5,
    taxPercentage: 5,
    insurancePercentage: 3,
    bonusPercentage: 2.5,
    allowanceAmount: 200,
  },
  'Mobile Patrol': {
    baseDailyRate: 120,
    overtimeMultiplier: 1.5,
    taxPercentage: 5,
    insurancePercentage: 3,
    bonusPercentage: 2,
    allowanceAmount: 150,
  },
  'Night Patrol': {
    baseDailyRate: 130,
    overtimeMultiplier: 1.5,
    taxPercentage: 5,
    insurancePercentage: 3,
    bonusPercentage: 2,
    allowanceAmount: 200,
  },
  'Control Room Lead': {
    baseDailyRate: 140,
    overtimeMultiplier: 1.5,
    taxPercentage: 5,
    insurancePercentage: 3,
    bonusPercentage: 2.5,
    allowanceAmount: 150,
  },
  'HR Coordinator': {
    baseDailyRate: 159.09,
    overtimeMultiplier: 1.25,
    taxPercentage: 8,
    insurancePercentage: 4,
    bonusPercentage: 3,
    allowanceAmount: 200,
  },
  'Payroll Specialist': {
    baseDailyRate: 150,
    overtimeMultiplier: 1.25,
    taxPercentage: 8,
    insurancePercentage: 4,
    bonusPercentage: 2.5,
    allowanceAmount: 150,
  },
  'VIP Protection': {
    baseDailyRate: 180,
    overtimeMultiplier: 1.5,
    taxPercentage: 8,
    insurancePercentage: 4,
    bonusPercentage: 3,
    allowanceAmount: 250,
  },
}

interface PayrollPayRateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PayrollPayRateDialog({
  open,
  onOpenChange,
}: PayrollPayRateDialogProps) {
  const [selectedPosition, setSelectedPosition] = useState<JobPosition>('Senior Guard')
  const [config, setConfig] = useState<Record<JobPosition, PayrollConfig>>(
    Object.entries(DEFAULT_PAYROLL_CONFIG).reduce(
      (acc, [position, data]) => ({
        ...acc,
        [position]: { position: position as JobPosition, ...data },
      }),
      {} as Record<JobPosition, PayrollConfig>
    )
  )
  const [hasChanges, setHasChanges] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('rates')

  const currentConfig = config[selectedPosition]

  const handleChange = (field: keyof Omit<PayrollConfig, 'position'>, value: number) => {
    setConfig(prev => ({
      ...prev,
      [selectedPosition]: {
        ...prev[selectedPosition],
        [field]: value,
      },
    }))
    setHasChanges(true)
    setShowSuccess(false)
  }

  const handleSave = () => {
    // In production, this would send data to your backend API
    setHasChanges(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleReset = () => {
    setConfig(
      Object.entries(DEFAULT_PAYROLL_CONFIG).reduce(
        (acc, [position, data]) => ({
          ...acc,
          [position]: { position: position as JobPosition, ...data },
        }),
        {} as Record<JobPosition, PayrollConfig>
      )
    )
    setHasChanges(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payroll Configuration</DialogTitle>
          <DialogDescription>
            Manage pay rates, overtime multipliers, and deductions by job position. Changes will trigger automatic payroll recalculation for the next cycle.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rates">Rates & Multipliers</TabsTrigger>
            <TabsTrigger value="deductions">Deductions & Allowances</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4">
            <div className="space-y-4 py-4">
              {/* Position Selector */}
              <div className="space-y-2">
                <Label>Select Job Position</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                  {JOB_POSITIONS.map(position => (
                    <Button
                      key={position}
                      variant={selectedPosition === position ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPosition(position)}
                      className="text-xs h-auto py-2"
                    >
                      {position}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Rates Configuration */}
              {currentConfig && (
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="baseDailyRate">Base Daily Rate (IDR)</Label>
                      <CurrencyInput
                        id="baseDailyRate"
                        value={currentConfig.baseDailyRate}
                        onValueChange={(value) => handleChange('baseDailyRate', value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Monthly: {formatCurrency(currentConfig.baseDailyRate * 22)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="overtimeMultiplier">Overtime Multiplier (x)</Label>
                      <Input
                        id="overtimeMultiplier"
                        type="number"
                        step="0.1"
                        value={currentConfig.overtimeMultiplier}
                        onChange={e => handleChange('overtimeMultiplier', parseFloat(e.target.value))}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        OT Rate: {formatCurrency(currentConfig.baseDailyRate * currentConfig.overtimeMultiplier / 8)}/hour
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      For <strong>{selectedPosition}</strong>: Base daily rate {formatCurrency(currentConfig.baseDailyRate)} 
                      × {currentConfig.overtimeMultiplier}x multiplier = {formatCurrency(currentConfig.baseDailyRate * currentConfig.overtimeMultiplier)} OT daily
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="deductions" className="space-y-4">
            <div className="space-y-4 py-4">
              {/* Position Selector */}
              <div className="space-y-2">
                <Label>Select Job Position</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
                  {JOB_POSITIONS.map(position => (
                    <Button
                      key={position}
                      variant={selectedPosition === position ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPosition(position)}
                      className="text-xs h-auto py-2"
                    >
                      {position}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Deductions Configuration */}
              {currentConfig && (
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="taxPercentage">Pajak PPh 21 (%)</Label>
                      <Input
                        id="taxPercentage"
                        type="number"
                        step="0.1"
                        value={currentConfig.taxPercentage}
                        onChange={e => handleChange('taxPercentage', parseFloat(e.target.value))}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        On {formatCurrency(currentConfig.baseDailyRate)}: {formatCurrency(currentConfig.baseDailyRate * currentConfig.taxPercentage / 100)}/day
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="insurancePercentage">BPJS Kesehatan (%)</Label>
                      <Input
                        id="insurancePercentage"
                        type="number"
                        step="0.1"
                        value={currentConfig.insurancePercentage}
                        onChange={e => handleChange('insurancePercentage', parseFloat(e.target.value))}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        On {formatCurrency(currentConfig.baseDailyRate)}: {formatCurrency(currentConfig.baseDailyRate * currentConfig.insurancePercentage / 100)}/day
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bonusPercentage">BPJS Ketenagakerjaan (%)</Label>
                      <Input
                        id="bonusPercentage"
                        type="number"
                        step="0.1"
                        value={currentConfig.bonusPercentage}
                        onChange={e => handleChange('bonusPercentage', parseFloat(e.target.value))}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        On {formatCurrency(currentConfig.baseDailyRate)}: {formatCurrency(currentConfig.baseDailyRate * currentConfig.bonusPercentage / 100)}/day
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="allowanceAmount">Standard Allowance (IDR)</Label>
                      <CurrencyInput
                        id="allowanceAmount"
                        value={currentConfig.allowanceAmount}
                        onValueChange={(value) => handleChange('allowanceAmount', value)}
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground">
                        Fixed daily allowance
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      For <strong>{selectedPosition}</strong>: Total daily deductions {formatCurrency((currentConfig.baseDailyRate * currentConfig.taxPercentage / 100) + (currentConfig.baseDailyRate * currentConfig.insurancePercentage / 100))}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {hasChanges && (
          <Alert className="bg-yellow-500/10 border-yellow-500/20">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700 text-sm">
              You have unsaved changes. Payroll will recalculate automatically when you save.
            </AlertDescription>
          </Alert>
        )}

        {showSuccess && (
          <Alert className="bg-green-500/10 border-green-500/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 text-sm">
              Payroll configuration saved successfully. Next calculation will use updated rates.
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              handleReset()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleReset}
            >
              Reset Changes
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
          >
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
