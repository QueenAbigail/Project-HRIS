'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import type { Employee } from './employee-profile-sheet'
import { Camera } from 'lucide-react'

interface EmployeeEditDialogProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (employee: Employee) => void
}

const locations = [
  { value: 'head-office', label: 'Head Office', code: 'HO' },
  { value: 'plaza-tower', label: 'Plaza Tower - Downtown', code: 'PT-DT' },
  { value: 'riverside-mall', label: 'Riverside Mall', code: 'RM' },
  { value: 'metro-bank', label: 'Metro Bank - Central', code: 'MB-CT' },
  { value: 'corporate-center', label: 'Corporate Center - North', code: 'CC-N' },
  { value: 'industrial-park', label: 'Industrial Park - West', code: 'IP-W' },
]

const departments = [
  'Field Security',
  'Surveillance',
  'Patrol',
  'Administration',
  'VIP Protection',
]

const positions = [
  'Security Guard',
  'Senior Guard',
  'Patrol Lead',
  'Night Patrol',
  'Mobile Patrol',
  'CCTV Operator',
  'Control Room Lead',
  'HR Coordinator',
  'VIP Protection',
]

const statuses = [
  { value: 'active', label: 'Active' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'inactive', label: 'Inactive' },
]

export function EmployeeEditDialog({ employee, open, onOpenChange, onSave }: EmployeeEditDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    status: '',
    location: '',
    locationCode: '',
    emergencyContact: '',
    bankAccount: '',
    taxId: '',
  })

  useEffect(() => {
    if (employee) {
      const locationEntry = locations.find(l => l.label === employee.location || l.code === employee.locationCode)
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone || '+1 (555) 000-0000',
        department: employee.department,
        position: employee.position,
        status: employee.status,
        location: locationEntry?.value || 'head-office',
        locationCode: employee.locationCode,
        emergencyContact: employee.emergencyContact || 'Emergency Contact - +1 (555) 000-0000',
        bankAccount: employee.bankAccount || '**** **** **** 0000',
        taxId: employee.taxId || '***-**-0000',
      })
    }
  }, [employee])

  if (!employee) return null

  const handleLocationChange = (value: string) => {
    const locationEntry = locations.find(l => l.value === value)
    setFormData(prev => ({
      ...prev,
      location: value,
      locationCode: locationEntry?.code || '',
    }))
  }

  const handleSave = () => {
    const locationEntry = locations.find(l => l.value === formData.location)
    onSave({
      ...employee,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
      status: formData.status,
      location: locationEntry?.label || employee.location,
      locationCode: locationEntry?.code || employee.locationCode,
      emergencyContact: formData.emergencyContact,
      bankAccount: formData.bankAccount,
      taxId: formData.taxId,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Employee Details</DialogTitle>
        </DialogHeader>

        {/* Avatar Section */}
        <div className="flex items-center gap-4 py-4">
          <div className="relative">
            <Avatar className="size-20 border-2 border-border">
              <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {employee.initials}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute -bottom-1 -right-1 size-7 rounded-full"
            >
              <Camera className="size-3" />
            </Button>
          </div>
          <div>
            <p className="font-medium">{employee.name}</p>
            <p className="text-sm text-muted-foreground font-mono">{employee.id}</p>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input
                id="emergency"
                value={formData.emergencyContact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                placeholder="Name - Phone Number"
              />
            </div>
          </TabsContent>

          <TabsContent value="assignment" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Placement Location</Label>
              <Select value={formData.location} onValueChange={handleLocationChange}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.value} value={location.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{location.label}</span>
                        <span className="ml-2 text-xs font-mono text-muted-foreground">({location.code})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Current assignment code: <span className="font-mono">{formData.locationCode || employee.locationCode}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4 mt-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Note:</strong> Changing the placement location will trigger a notification to the site supervisor at the new location. Make sure to coordinate shift schedules before reassigning personnel.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="payroll" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank">Bank Account Number</Label>
              <Input
                id="bank"
                value={formData.bankAccount}
                onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                placeholder="**** **** **** ****"
              />
              <p className="text-xs text-muted-foreground">
                Enter full account number. Will be partially masked after saving.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax">Tax ID / SSN</Label>
              <Input
                id="tax"
                value={formData.taxId}
                onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                placeholder="***-**-****"
              />
              <p className="text-xs text-muted-foreground">
                Required for payroll processing. Will be encrypted and partially masked.
              </p>
            </div>

            <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 mt-4">
              <p className="text-sm text-warning">
                <strong>Security Notice:</strong> Changes to payroll information will require verification from the employee via their registered email address.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
