'use client'

import { useState, useEffect, useRef } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import type { Employee } from './employee-profile-sheet'
import { Camera, Eye, EyeOff } from 'lucide-react'
import { updateEmployeeAction } from '@/app/actions/employee'

interface EmployeeEditFormData {
  name: string
  email: string
  password?: string
  phoneNumber: string
  personalEmail: string
  gender: string
  maritalStatus: string
  ktpNumber: string
  religion: string
  birthCity: string
  birthDate: string
  bloodType: string
  bpjsNumber: string
  npwpNumber: string
  address: string
  department: string
  position: string
  status: string
  location: string
  locationCode: string
  emergencyContact: string
  bankAccount: string
  taxId: string
}

interface MasterDataItem {
  id: string
  value: string
  category: string
}

interface Site {
  id: string
  name: string
  code: string
  company?: {
    name: string
  } | null
}

interface EmployeeEditDialogProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (employee: Employee) => void
  currentUserRole?: string
}

export function EmployeeEditDialog({ employee, open, onOpenChange, onSave, currentUserRole }: EmployeeEditDialogProps) {
  const [formData, setFormData] = useState<EmployeeEditFormData>({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    personalEmail: '',
    gender: '',
    maritalStatus: '',
    ktpNumber: '',
    religion: '',
    birthCity: '',
    birthDate: '',
    bloodType: '',
    bpjsNumber: '',
    npwpNumber: '',
    address: '',
    department: '',
    position: '',
    status: '',
    location: '',
    locationCode: '',
    emergencyContact: '',
    bankAccount: '',
    taxId: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [sites, setSites] = useState<Site[]>([])
  const [departments, setDepartments] = useState<MasterDataItem[]>([])
  const [positions, setPositions] = useState<MasterDataItem[]>([])
  const [maritalStatuses, setMaritalStatuses] = useState<MasterDataItem[]>([])
  const [religions, setReligions] = useState<MasterDataItem[]>([])
  const [bloodTypes, setBloodTypes] = useState<MasterDataItem[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const dataFetchedRef = useRef(false)

  useEffect(() => {
    if (employee) {
      const siteEntry = sites.find(s => s.name === employee.location || s.code === employee.locationCode)
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        password: employee.password || '',
        phoneNumber: employee.phoneNumber || employee.phone || '',
        personalEmail: employee.personalEmail || '',
        gender: employee.gender || '',
        maritalStatus: employee.maritalStatus || '',
        ktpNumber: employee.ktpNumber || '',
        religion: employee.religion || '',
        birthCity: employee.birthCity || '',
        birthDate: employee.birthDate || '',
        bloodType: employee.bloodType || '',
        bpjsNumber: employee.bpjsNumber || '',
        npwpNumber: employee.npwpNumber || '',
        address: employee.address || '',
        department: employee.department || '',
        position: employee.position || '',
        status: employee.status || '',
        location: siteEntry?.id || '',
        locationCode: employee.locationCode || '',
        emergencyContact: employee.emergencyContact || 'Emergency Contact - +1 (555) 000-0000',
        bankAccount: employee.bankAccount || '**** **** **** 0000',
        taxId: employee.taxId || '***-**-0000',
      })
    }
  }, [employee, sites])

  // Fetch sites and master data from database (only once due to caching)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)

        // Fetch sites
        const sitesResponse = await fetch('/api/sites')
        if (sitesResponse.ok) {
          const sitesData = await sitesResponse.json()
          setSites(sitesData)
        }

        // Fetch all master data categories
        const categories = ['department', 'position', 'maritalStatus', 'religion', 'bloodType']
        const responses = await Promise.all(
          categories.map(cat => fetch(`/api/master-data?category=${cat}`))
        )

        const deptData = await responses[0].json()
        const posData = await responses[1].json()
        const maritalData = await responses[2].json()
        const religionData = await responses[3].json()
        const bloodData = await responses[4].json()

        setDepartments(Array.isArray(deptData) ? deptData : [])
        setPositions(Array.isArray(posData) ? posData : [])
        setMaritalStatuses(Array.isArray(maritalData) ? maritalData : [])
        setReligions(Array.isArray(religionData) ? religionData : [])
        setBloodTypes(Array.isArray(bloodData) ? bloodData : [])

        dataFetchedRef.current = true
      } catch (error) {
        console.error('[v0] Failed to fetch data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    // Only fetch if dialog opened AND data hasn't been fetched yet
    if (open && !dataFetchedRef.current) {
      fetchData()
    }
  }, [open])

  const hasPasswordAccess = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'HR_ADMIN';

  if (!employee) return null

  const handleLocationChange = (value: string) => {
    const siteEntry = sites.find(s => s.id === value)
    setFormData(prev => ({
      ...prev,
      location: value,
      locationCode: siteEntry?.code || '',
    }))
  }

  const handleSave = async () => {
    try {
      // Send formData directly - location is already siteId, no transformation needed
      const result = await updateEmployeeAction(employee!.id, formData)
      
      if (result.success) {
        onSave({ ...employee!, ...formData })
        alert("Mantap Can! Data dan Password berhasil diupdate.")
        onOpenChange(false)
      } else {
        alert("Duh gagal simpan nih: " + result.error)
      }
    } catch (error) {
      console.error(error)
      alert("Ada masalah koneksi/sistem pas mau nyimpen")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden p-0">
        
        {/* === HEADER FIXED === */}
        <div className="px-6 pt-6 pb-2 shrink-0">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-lg">Edit Employee Details</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="size-12 border-2 border-border">
                <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {employee.initials}
                </AvatarFallback>
              </Avatar>
              <Button size="icon" variant="secondary" className="absolute -bottom-0.5 -right-0.5 size-6 rounded-full">
                <Camera className="size-3" />
              </Button>
            </div>
            <div>
              <p className="font-semibold text-lg">{employee.name}</p>
              <p className="text-xs text-muted-foreground font-mono">{employee.employeeCode || employee.id}</p>
            </div>
          </div>
        </div>

        {/* === BODY FLEXIBLE (YANG BISA DI-SCROLL) === */}
        <div className="flex-1 overflow-hidden px-6 flex flex-col min-h-0">
          <Tabs defaultValue="personal" className="flex-1 flex flex-col min-h-0 w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="payroll">Payroll</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto min-h-0 mt-4 pr-3 pb-4">
              
              {/* TAB 1: PERSONAL INFO */}
              <TabsContent value="personal" className="mt-0 p-0">
                <div className="grid grid-cols-2 gap-4 pb-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={hasPasswordAccess ? (showPassword ? "text" : "password") : "password"}
                        value={formData.password || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        disabled={!hasPasswordAccess}
                        className="pr-10"
                        placeholder={!hasPasswordAccess ? "********" : "Enter password"}
                      />
                      {hasPasswordAccess && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="size-4 text-muted-foreground" />
                          ) : (
                            <Eye className="size-4 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" value={formData.phoneNumber} onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalEmail">Personal Email</Label>
                    <Input id="personalEmail" type="email" value={formData.personalEmail} onChange={(e) => setFormData(prev => ({ ...prev, personalEmail: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Select value={formData.maritalStatus} onValueChange={(value) => setFormData(prev => ({ ...prev, maritalStatus: value }))}>
                      <SelectTrigger id="maritalStatus"><SelectValue placeholder={loadingData ? "Loading..." : "Select status"} /></SelectTrigger>
                      <SelectContent>
                        {maritalStatuses.map(item => (
                          <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ktpNumber">KTP Number</Label>
                    <Input id="ktpNumber" value={formData.ktpNumber} onChange={(e) => setFormData(prev => ({ ...prev, ktpNumber: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Select value={formData.religion} onValueChange={(value) => setFormData(prev => ({ ...prev, religion: value }))}>
                      <SelectTrigger id="religion"><SelectValue placeholder={loadingData ? "Loading..." : "Select religion"} /></SelectTrigger>
                      <SelectContent>
                        {religions.map(item => (
                          <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthCity">Birth City</Label>
                    <Input id="birthCity" value={formData.birthCity} onChange={(e) => setFormData(prev => ({ ...prev, birthCity: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date</Label>
                    <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select value={formData.bloodType} onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}>
                      <SelectTrigger id="bloodType"><SelectValue placeholder={loadingData ? "Loading..." : "Select blood type"} /></SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map(item => (
                          <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bpjsNumber">BPJS Number</Label>
                    <Input id="bpjsNumber" value={formData.bpjsNumber} onChange={(e) => setFormData(prev => ({ ...prev, bpjsNumber: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="npwpNumber">NPWP Number</Label>
                    <Input id="npwpNumber" value={formData.npwpNumber} onChange={(e) => setFormData(prev => ({ ...prev, npwpNumber: e.target.value }))} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" value={formData.address} onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))} className="min-h-[80px]" />
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: ASSIGNMENT */}
              <TabsContent value="assignment" className="mt-0 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Placement Location</Label>
                  <Select value={formData.location} onValueChange={handleLocationChange}>
                    <SelectTrigger id="location"><SelectValue placeholder={loadingData ? "Loading..." : "Select location"} /></SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{site.company?.name || 'N/A'} - {site.name}</span>
                            <span className="ml-2 text-xs font-mono text-muted-foreground">({site.code})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Current assignment code: <span className="font-mono">{formData.locationCode || employee?.locationCode}</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                      <SelectTrigger id="department"><SelectValue placeholder={loadingData ? "Loading..." : "Select department"} /></SelectTrigger>
                      <SelectContent>
                        {departments.map(item => (
                          <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select value={formData.position} onValueChange={(value) => setFormData(prev => ({ ...prev, position: value }))}>
                      <SelectTrigger id="position"><SelectValue placeholder={loadingData ? "Loading..." : "Select position"} /></SelectTrigger>
                      <SelectContent>
                        {positions.map(item => (
                          <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="rounded-lg bg-muted/50 p-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Changing the placement location will trigger a notification to the site supervisor at the new location.
                  </p>
                </div>
              </TabsContent>

              {/* TAB 3: PAYROLL */}
              <TabsContent value="payroll" className="mt-0 pb-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank Account Number</Label>
                  <Input id="bank" value={formData.bankAccount} onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))} placeholder="**** **** **** ****" />
                  <p className="text-xs text-muted-foreground">Enter full account number. Will be partially masked after saving.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax ID / NPWP</Label>
                  <Input id="tax" value={formData.taxId} onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))} placeholder="***-**-****" />
                </div>
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-4 mt-4">
                  <p className="text-sm text-warning">
                    <strong>Security Notice:</strong> Changes to payroll information will require verification.
                  </p>
                </div>
              </TabsContent>

            </div>
          </Tabs>
        </div>

        {/* === FOOTER FIXED (TOMBOL SAVE) === */}
        <DialogFooter className="px-6 py-4 border-t shrink-0 flex justify-end gap-2 bg-background">
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
