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
import { Upload, UserPlus, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEmployee?: (employee: any) => void
  onImportEmployees?: (employees: any[]) => void
}

const departments = ['Field Security', 'Surveillance', 'Administration', 'Patrol', 'VIP Protection']
const locations = [
  { name: 'Head Office', code: 'HO' },
  { name: 'Plaza Tower - Downtown', code: 'PT-DT' },
  { name: 'Riverside Mall', code: 'RM' },
]
const positions = ['Security Guard', 'Senior Guard', 'CCTV Operator', 'HR Coordinator']

export function AddEmployeeDialog({ 
  open, 
  onOpenChange,
  onAddEmployee,
  onImportEmployees 
}: AddEmployeeDialogProps) {
  const [activeTab, setActiveTab] = useState('manual')
  
  // State Import
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importCount, setImportCount] = useState(0)
  
  // State Manual Form Wizard
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '', // Personal Email (Optional)
    employeeCode: '',
    password: 'promaxima',
    department: '',
    position: '',
    location: '',
    joinDate: new Date().toISOString().split('T')[0],
    // Sisanya buat Step 2, 3, 4 nyusul di fase berikutnya
  })

  // Reset form tiap kali modal ditutup
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setStep(1)
      setErrorMsg('')
      resetImportStatus()
      setActiveTab('manual')
      setFormData({
        name: '', email: '', employeeCode: '', password: 'promaxima', 
        department: '', position: '', location: '', joinDate: new Date().toISOString().split('T')[0]
      })
    }
  }

  // Logika Validasi Pindah Step
  const handleNextStep = () => {
    if (step === 1) {
      const missingFields = []
      if (!formData.name) missingFields.push('Full Name')
      if (!formData.employeeCode) missingFields.push('NIP / Employee Code')
      if (!formData.password) missingFields.push('Password')
      if (!formData.department) missingFields.push('Department')
      if (!formData.position) missingFields.push('Position')
      if (!formData.location) missingFields.push('Location')
      if (!formData.joinDate) missingFields.push('Join Date')

      if (missingFields.length > 0) {
        setErrorMsg(`Kolom berikut wajib diisi: ${missingFields.join(', ')}`)
        return // Stop, jangan pindah step
      }
    }
    
    setErrorMsg('')
    setStep(step + 1)
  }

  // Fitur Import (Tidak diubah, tetap bawaan dari kodemu)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setTimeout(() => {
        setImportCount(15)
        setImportStatus('success')
      }, 1500)
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    // Simulasi download template bawaanmu
    alert("Downloading template...") 
  }

  const resetImportStatus = () => {
    setImportStatus('idle')
    setImportCount(0)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] min-h-[500px]">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Add a new employee manually or import multiple employees from an Excel/CSV file.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <UserPlus className="size-4" /> Manual Entry
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <FileSpreadsheet className="size-4" /> Import from Excel
            </TabsTrigger>
          </TabsList>
          
          {/* TAB 1: MANUAL ENTRY WIZARD */}
          <TabsContent value="manual" className="mt-4 flex flex-col h-[400px]">
            <h3 className="text-lg font-medium mb-4">Step {step} of 4: Basic Information</h3>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label>Full Name <span className="text-red-500">*</span></Label>
                    <Input placeholder="Enter full name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                  </div>

                  {/* Optional Email */}
                  <div className="space-y-2">
                    <Label>Personal Email</Label>
                    <Input type="email" placeholder="Enter email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                  </div>

                  {/* NIP */}
                  <div className="space-y-2">
                    <Label>NIP / Employee Code <span className="text-red-500">*</span></Label>
                    <Input placeholder="Enter NIP" value={formData.employeeCode} onChange={(e) => setFormData({...formData, employeeCode: e.target.value})} />
                  </div>

                  {/* Password Show/Hide */}
                  <div className="space-y-2">
                    <Label>Password <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <Label>Department <span className="text-red-500">*</span></Label>
                    <Select value={formData.department} onValueChange={(val) => setFormData({...formData, department: val})}>
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Position */}
                  <div className="space-y-2">
                    <Label>Position <span className="text-red-500">*</span></Label>
                    <Select value={formData.position} onValueChange={(val) => setFormData({...formData, position: val})}>
                      <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                      <SelectContent>
                        {positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label>Location <span className="text-red-500">*</span></Label>
                    <Select value={formData.location} onValueChange={(val) => setFormData({...formData, location: val})}>
                      <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                      <SelectContent>
                        {locations.map(l => <SelectItem key={l.code} value={l.name}>{l.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Join Date */}
                  <div className="space-y-2">
                    <Label>Join Date <span className="text-red-500">*</span></Label>
                    <Input type="date" value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message Display */}
            {errorMsg && (
              <p className="text-sm text-red-500 mt-2 font-medium">{errorMsg}</p>
            )}

            <DialogFooter className="mt-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="button" onClick={handleNextStep}>Next &rarr;</Button>
            </DialogFooter>
          </TabsContent>
          
          {/* TAB 2: IMPORT EXCEL (Bawaan Kodingan Lu) */}
          <TabsContent value="import" className="mt-4 space-y-4">
            {importStatus === 'idle' && (
              <>
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                  <Upload className="mx-auto size-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Upload Excel or CSV File</h3>
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <Button variant="outline" className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="mr-2 size-4" /> Choose File
                  </Button>
                </div>
                
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertTitle>Supported Formats</AlertTitle>
                  <AlertDescription>Excel (.xlsx, .xls) and CSV files are supported.</AlertDescription>
                </Alert>
              </>
            )}
            
            {importStatus === 'success' && (
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="size-4 text-success" />
                <AlertTitle className="text-success">Import Successful!</AlertTitle>
                <AlertDescription>Successfully imported {importCount} employees.</AlertDescription>
              </Alert>
            )}
            
            {importStatus !== 'idle' && (
              <DialogFooter>
                <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
                <Button onClick={resetImportStatus}>Import Another File</Button>
              </DialogFooter>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}