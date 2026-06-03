'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
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

interface Site {
  id: string
  name: string
  code: string
}

interface MasterDataItem {
  id: string
  value: string
  category: string
}

export function AddEmployeeDialog({ 
  open, 
  onOpenChange,
  onAddEmployee,
  onImportEmployees 
}: AddEmployeeDialogProps) {
  const [activeTab, setActiveTab] = useState('manual')
  const [sites, setSites] = useState<Site[]>([])
  const [departments, setDepartments] = useState<MasterDataItem[]>([])
  const [positions, setPositions] = useState<MasterDataItem[]>([])
  const [employmentStatuses, setEmploymentStatuses] = useState<MasterDataItem[]>([])
  const [maritalStatuses, setMaritalStatuses] = useState<MasterDataItem[]>([])
  const [religions, setReligions] = useState<MasterDataItem[]>([])
  const [bloodTypes, setBloodTypes] = useState<MasterDataItem[]>([])
  const [certifications, setCertifications] = useState<MasterDataItem[]>([])
  const [loadingSites, setLoadingSites] = useState(false)
  const [loadingMasterData, setLoadingMasterData] = useState(false)
  
  // Cache ref to prevent redundant fetches
  const dataFetchedRef = useRef(false)
  
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

  // Fetch sites and master data from database (only once due to caching)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingSites(true)
        setLoadingMasterData(true)
        
        // Fetch sites
        const sitesResponse = await fetch('/api/sites')
        if (sitesResponse.ok) {
          const sitesData = await sitesResponse.json()
          setSites(sitesData)
        }
        
        // Fetch all master data categories
        const categories = ['department', 'position', 'employmentStatus', 'maritalStatus', 'religion', 'bloodType', 'certificate']
        const responses = await Promise.all(
          categories.map(cat => fetch(`/api/master-data?category=${cat}`))
        )
        
        const deptData = await responses[0].json()
        const posData = await responses[1].json()
        const empStatusData = await responses[2].json()
        const maritalData = await responses[3].json()
        const religionData = await responses[4].json()
        const bloodData = await responses[5].json()
        const certData = await responses[6].json()
        
        setDepartments(Array.isArray(deptData) ? deptData : [])
        setPositions(Array.isArray(posData) ? posData : [])
        setEmploymentStatuses(Array.isArray(empStatusData) ? empStatusData : [])
        setMaritalStatuses(Array.isArray(maritalData) ? maritalData : [])
        setReligions(Array.isArray(religionData) ? religionData : [])
        setBloodTypes(Array.isArray(bloodData) ? bloodData : [])
        setCertifications(Array.isArray(certData) ? certData : [])
        
        // Mark data as fetched for caching
        dataFetchedRef.current = true
      } catch (error) {
        console.error('[v0] Failed to fetch data:', error)
      } finally {
        setLoadingSites(false)
        setLoadingMasterData(false)
      }
    }

    // Only fetch if modal opened AND data hasn't been fetched yet
    if (open && !dataFetchedRef.current) {
      fetchData()
    }
  }, [open])

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

  // Download template function
  const handleDownloadTemplate = async () => {
    try {
      const XLSX = await import('xlsx')
      const templateData = [
        ['Full Name', 'Email', 'Employee Code (NIP)', 'Department', 'Position', 'Location', 'Join Date'],
        ['John Doe', 'john.doe@company.com', 'EMP001', 'Field Security', 'Security Guard', 'HO-01', '2024-01-15'],
        ['Jane Smith', 'jane.smith@company.com', 'EMP002', 'Surveillance', 'CCTV Operator', 'PT-DT', '2024-02-20'],
        ['Mike Johnson', 'mike.johnson@company.com', 'EMP003', 'Administration', 'HR Coordinator', 'RM', '2024-03-10'],
      ]

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(templateData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Employees')
      
      // Download file
      XLSX.writeFile(wb, 'employee_template.xlsx')
    } catch (error) {
      console.error('Failed to download template:', error)
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
    // Find the selected site to get its ID
    const selectedSite = sites.find(site => site.id === formData.location)
    
    // Kita translate/mapping dulu data dari state lu biar cocok sama maunya backend
    const finalData = {
      ...formData,
      siteId: selectedSite?.id || formData.location, // Use site ID from database
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
                      <SelectTrigger disabled={loadingMasterData || departments.length === 0}><SelectValue placeholder={loadingMasterData ? "Loading..." : departments.length === 0 ? "No departments available" : "Select"} /></SelectTrigger>
                      <SelectContent>
                        {departments.map(d => <SelectItem key={d.id} value={d.value}>{d.value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Position <span className="text-red-500">*</span></Label>
                    <Select value={formData.position} onValueChange={(val) => setFormData({...formData, position: val})}>
                      <SelectTrigger disabled={loadingMasterData || positions.length === 0}><SelectValue placeholder={loadingMasterData ? "Loading..." : positions.length === 0 ? "No positions available" : "Select"} /></SelectTrigger>
                      <SelectContent>
                        {positions.map(p => <SelectItem key={p.id} value={p.value}>{p.value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location <span className="text-red-500">*</span></Label>
                    <Select value={formData.location} onValueChange={(val) => setFormData({...formData, location: val})}>
                      <SelectTrigger><SelectValue placeholder={loadingSites ? "Loading sites..." : "Select"} /></SelectTrigger>
                      <SelectContent>
                        {sites.map(site => <SelectItem key={site.id} value={site.id}>{site.name}</SelectItem>)}
                      </SelectContent>
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
                      <SelectTrigger disabled={loadingMasterData || employmentStatuses.length === 0}><SelectValue placeholder={loadingMasterData ? "Loading..." : employmentStatuses.length === 0 ? "No data available" : "Select"} /></SelectTrigger>
                      <SelectContent>
                        {employmentStatuses.map(item => <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Marital Status <span className="text-red-500">*</span></Label>
                    <Select value={formData.maritalStatus} onValueChange={(val) => setFormData({...formData, maritalStatus: val})}>
                      <SelectTrigger disabled={loadingMasterData || maritalStatuses.length === 0}><SelectValue placeholder={loadingMasterData ? "Loading..." : maritalStatuses.length === 0 ? "No data available" : "Select"} /></SelectTrigger>
                      <SelectContent>
                        {maritalStatuses.map(item => <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Religion <span className="text-red-500">*</span></Label>
                    <Select value={formData.religion} onValueChange={(val) => setFormData({...formData, religion: val})}>
                      <SelectTrigger disabled={loadingMasterData || religions.length === 0}><SelectValue placeholder={loadingMasterData ? "Loading..." : religions.length === 0 ? "No data available" : "Select"} /></SelectTrigger>
                      <SelectContent>
                        {religions.map(item => <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Type</Label>
                    <Select value={formData.bloodType} onValueChange={(val) => setFormData({...formData, bloodType: val})}>
                      <SelectTrigger disabled={loadingMasterData || bloodTypes.length === 0}><SelectValue placeholder={loadingMasterData ? "Loading..." : bloodTypes.length === 0 ? "No data available" : "Select"} /></SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map(item => <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>NPWP Number</Label><Input value={formData.npwpNumber} onChange={(e) => setFormData({...formData, npwpNumber: e.target.value})} /></div>
                  <div className="space-y-2">
                    <Label>Certification Level</Label>
                    <Select value={formData.certification} onValueChange={(val) => setFormData({...formData, certification: val})}>
                      <SelectTrigger disabled={loadingMasterData || certifications.length === 0}><SelectValue placeholder={loadingMasterData ? "Loading..." : certifications.length === 0 ? "No data available" : "Select"} /></SelectTrigger>
                      <SelectContent>
                        {certifications.map(item => <SelectItem key={item.id} value={item.value}>{item.value}</SelectItem>)}
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

                <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-muted-foreground/20">
                  <p className="text-sm text-muted-foreground mb-3">
                    Not sure what format to use? Download our employee template to see the required columns and data structure for bulk imports.
                  </p>
                  <Button variant="outline" className="mt-4 gap-2" onClick={handleDownloadTemplate}>
                    <Download className="size-4" />
                    Download Template
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
