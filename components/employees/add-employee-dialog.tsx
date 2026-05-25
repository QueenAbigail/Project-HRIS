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
import { createEmployeeAction } from '@/app/actions/employee' // Taruh di baris paling atas bareng import lain

export interface NewEmployee {
  name: string;
  email: string;
  department: string;
  position: string;
  location: string;
  joinDate: string;
  status: string;
}

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
    // Step 1
    name: '', email: '', employeeCode: '', password: 'promaxima', department: '', position: '', location: '', joinDate: new Date().toISOString().split('T')[0],
    // Step 2
    phoneNumber: '', ktpNumber: '', address: '', birthCity: '', birthDate: '', bpjsNumber: '', gender: '',
// Step 3
    employmentStatus: '', maritalStatus: '', religion: '', bloodType: '', npwpNumber: '', ktaNumber: '', ktaExpiry: '', certification: '',
    // Step 4
    role: 'STAFF', allowMobileAttendance: 'false', allowWebAppAccess: 'false'
  })

  // Reset form
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen)
    if (!isOpen) {
      setStep(1)
      setErrorMsg('')
      resetImportStatus()
      setActiveTab('manual')
      setFormData({
        name: '', email: '', employeeCode: '', password: 'promaxima', department: '', position: '', location: '', joinDate: new Date().toISOString().split('T')[0],
        phoneNumber: '', ktpNumber: '', address: '', birthCity: '', birthDate: '', bpjsNumber: '', gender: '',
        employmentStatus: '', maritalStatus: '', religion: '', bloodType: '', npwpNumber: '', ktaNumber: '', ktaExpiry: '', certification: '',
        role: 'STAFF', allowMobileAttendance: 'false', allowWebAppAccess: 'false'
      })
    }
  }

  // Validasi Dinamis & Navigasi
  const handleNextStep = () => {
    const missingFields = []
    
    if (step === 1) {
      if (!formData.name) missingFields.push('Full Name')
      if (!formData.employeeCode) missingFields.push('NIP')
      if (!formData.password) missingFields.push('Password')
      if (!formData.department) missingFields.push('Department')
      if (!formData.position) missingFields.push('Position')
      if (!formData.location) missingFields.push('Location')
      if (!formData.joinDate) missingFields.push('Join Date')
    } else if (step === 2) {
      if (!formData.phoneNumber) missingFields.push('Phone Number')
      if (!formData.ktpNumber) missingFields.push('KTP Number')
      if (!formData.address) missingFields.push('Address')
      if (!formData.birthCity) missingFields.push('City of Birth')
      if (!formData.birthDate) missingFields.push('Date of Birth')
      if (!formData.gender) missingFields.push('Gender')
    } else if (step === 3) {
      if (!formData.employmentStatus) missingFields.push('Employment Status')
      if (!formData.maritalStatus) missingFields.push('Marital Status')
      if (!formData.religion) missingFields.push('Religion')
    }

    if (missingFields.length > 0) {
      setErrorMsg(`Kolom berikut wajib diisi: ${missingFields.join(', ')}`)
      return
    }
    
    setErrorMsg('')
    setStep(step + 1)
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    // Kita translate/mapping dulu data dari state lu biar cocok sama maunya backend
    const finalData = {
      ...formData,
      siteId: formData.location, // Backend butuh siteId, form lu ngirim location
      systemRole: formData.role, // Backend butuh systemRole, form lu ngirim role
      dob: formData.birthDate,
      cob: formData.birthCity,
      personalEmail: formData.email, // Asumsi form email ini buat personal email
      
      // Ubah teks 'true'/'false' dari form jadi boolean beneran
      mobileAccess: formData.allowMobileAttendance === 'true' || formData.allowMobileAttendance === true,
      webAppAccess: formData.allowWebAppAccess === 'true' || formData.allowWebAppAccess === true,
      
      certifications: formData.certification ? [formData.certification] : [],
      status: 'ACTIVE'
    }

    // Tembak ke action
    const result = await createEmployeeAction(finalData)

    if (result.success) {
      onAddEmployee?.(finalData) 
      alert("Mantap! Karyawan baru berhasil masuk.")
      handleOpenChange(false) 
    } else {
      alert("Gagal simpan data: " + result.error)
    }
  } catch (error) {
    console.error("System error:", error)
    alert("Ada masalah koneksi/sistem.")
  }
}

  // Fitur Import (Tetap utuh)
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
  const resetImportStatus = () => { setImportStatus('idle'); setImportCount(0) }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] min-h-[500px]">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Add a new employee manually or import multiple employees from an Excel file.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2"><UserPlus className="size-4" /> Manual Entry</TabsTrigger>
            <TabsTrigger value="import" className="gap-2"><FileSpreadsheet className="size-4" /> Import from Excel</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4 flex flex-col h-[420px]">
            <h3 className="text-lg font-medium mb-4">
              Step {step} of 4: 
              {step === 1 && " Basic Information"}
              {step === 2 && " Personal Identity"}
              {step === 3 && " Demographics & Admin"}
              {step === 4 && " Access & Authentication"}
            </h3>
            
            <div className="flex-1 overflow-y-auto pr-2 pb-2">
              {/* STEP 1 */}
              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Full Name <span className="text-red-500">*</span></Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Personal Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                  <div className="space-y-2"><Label>NIP / Employee Code <span className="text-red-500">*</span></Label><Input value={formData.employeeCode} onChange={(e) => setFormData({...formData, employeeCode: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Password <span className="text-red-500">*</span></Label><div className="relative"><Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="pr-10" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                  <div className="space-y-2">
                    <Label>Department <span className="text-red-500">*</span></Label>
                    <Select value={formData.department} onValueChange={(val) => setFormData({...formData, department: val})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Position <span className="text-red-500">*</span></Label>
                    <Select value={formData.position} onValueChange={(val) => setFormData({...formData, position: val})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location <span className="text-red-500">*</span></Label>
                    <Select value={formData.location} onValueChange={(val) => setFormData({...formData, location: val})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{locations.map(l => <SelectItem key={l.code} value={l.name}>{l.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Join Date <span className="text-red-500">*</span></Label><Input type="date" value={formData.joinDate} onChange={(e) => setFormData({...formData, joinDate: e.target.value})} /></div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Phone Number <span className="text-red-500">*</span></Label><Input value={formData.phoneNumber} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} /></div>
                  <div className="space-y-2"><Label>KTP Number <span className="text-red-500">*</span></Label><Input value={formData.ktpNumber} onChange={(e) => setFormData({...formData, ktpNumber: e.target.value})} /></div>
                  <div className="space-y-2 col-span-2">
                    <Label>Address <span className="text-red-500">*</span></Label>
                    <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div className="space-y-2"><Label>City of Birth <span className="text-red-500">*</span></Label><Input value={formData.birthCity} onChange={(e) => setFormData({...formData, birthCity: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Date of Birth <span className="text-red-500">*</span></Label><Input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} /></div>
                  <div className="space-y-2">
                    <Label>Gender <span className="text-red-500">*</span></Label>
                    <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>BPJS Number</Label><Input value={formData.bpjsNumber} onChange={(e) => setFormData({...formData, bpjsNumber: e.target.value})} /></div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employment Status <span className="text-red-500">*</span></Label>
                    <Select value={formData.employmentStatus} onValueChange={(val) => setFormData({...formData, employmentStatus: val})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Permanent">Permanent</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                        <SelectItem value="Probation">Probation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marital Status <span className="text-red-500">*</span></Label>
                    <Select value={formData.maritalStatus} onValueChange={(val) => setFormData({...formData, maritalStatus: val})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Religion <span className="text-red-500">*</span></Label>
                    <Select value={formData.religion} onValueChange={(val) => setFormData({...formData, religion: val})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Islam">Islam</SelectItem>
                        <SelectItem value="Christianity">Christianity</SelectItem>
                        <SelectItem value="Catholicism">Catholicism</SelectItem>
                        <SelectItem value="Hinduism">Hinduism</SelectItem>
                        <SelectItem value="Buddhism">Buddhism</SelectItem>
                        <SelectItem value="Confucianism">Confucianism</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Type</Label>
                    <Select value={formData.bloodType} onValueChange={(val) => setFormData({...formData, bloodType: val})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="AB">AB</SelectItem><SelectItem value="O">O</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>NPWP Number</Label><Input value={formData.npwpNumber} onChange={(e) => setFormData({...formData, npwpNumber: e.target.value})} /></div>
                  <div className="space-y-2">
                    <Label>Certification Level</Label>
                    <Select value={formData.certification} onValueChange={(val) => setFormData({...formData, certification: val})}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None / Non-Security</SelectItem>
                        <SelectItem value="Gada Pratama">Gada Pratama</SelectItem>
                        <SelectItem value="Gada Madya">Gada Madya</SelectItem>
                        <SelectItem value="Gada Utama">Gada Utama</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>KTA Number</Label><Input value={formData.ktaNumber} onChange={(e) => setFormData({...formData, ktaNumber: e.target.value})} /></div>
                  <div className="space-y-2"><Label>KTA Expiry</Label><Input type="date" value={formData.ktaExpiry} onChange={(e) => setFormData({...formData, ktaExpiry: e.target.value})} /></div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>System Role <span className="text-red-500">*</span></Label>
                    <Select value={formData.role} onValueChange={(val) => setFormData({...formData, role: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="HR_ADMIN">HR Admin</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Attendance Access <span className="text-red-500">*</span></Label>
                    <Select value={formData.allowMobileAttendance} onValueChange={(val) => setFormData({...formData, allowMobileAttendance: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="true">Yes, Allow</SelectItem><SelectItem value="false">No, Block</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Web App Access <span className="text-red-500">*</span></Label>
                    <Select value={formData.allowWebAppAccess} onValueChange={(val) => setFormData({...formData, allowWebAppAccess: val})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="true">Yes, Allow</SelectItem><SelectItem value="false">No, Block</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && <p className="text-sm text-red-500 mt-2 font-medium bg-red-500/10 p-2 rounded">{errorMsg}</p>}

            <DialogFooter className="mt-4 pt-4 border-t">
              {step === 1 && (
                <>
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
                  <Button type="button" onClick={handleNextStep}>Next &rarr;</Button>
                </>
              )}
              {(step > 1 && step < 4) && (
                <>
                  <Button type="button" variant="outline" onClick={() => { setStep(step - 1); setErrorMsg(''); }}>&larr; Back</Button>
                  <Button type="button" onClick={handleNextStep}>Next &rarr;</Button>
                </>
              )}
              {step === 4 && (
                <>
                  <Button type="button" variant="outline" onClick={() => setStep(3)}>&larr; Back</Button>
                  <Button type="submit" onClick={handleSubmit}>Add Employee</Button>
                </>
              )}
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="import" className="mt-4 space-y-4">
             {/* Konten Import Tetap Utuh */}
             {importStatus === 'idle' && (
              <>
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                  <Upload className="mx-auto size-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Upload Excel File</h3>
                  <input type="file" accept=".xlsx" onChange={handleFileUpload} className="hidden" id="file-upload" />
                  <Button variant="outline" className="mt-4" onClick={() => document.getElementById('file-upload')?.click()}>
                    <Upload className="mr-2 size-4" /> Choose File
                  </Button>
                </div>
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
