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
import { Upload, UserPlus, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface AddEmployeeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEmployee?: (employee: NewEmployee) => void
  onImportEmployees?: (employees: NewEmployee[]) => void
}

export interface NewEmployee {
  name: string
  email: string
  department: string
  position: string
  location: string
  locationCode: string
  joinDate: string
  status: string
}

const departments = [
  'Field Security',
  'Surveillance',
  'Administration',
  'Patrol',
  'VIP Protection',
]

const locations = [
  { name: 'Head Office', code: 'HO' },
  { name: 'Plaza Tower - Downtown', code: 'PT-DT' },
  { name: 'Riverside Mall', code: 'RM' },
  { name: 'Metro Bank - Central', code: 'MB-CT' },
  { name: 'Corporate Center - North', code: 'CC-N' },
  { name: 'Industrial Park - West', code: 'IP-W' },
]

const positions = [
  'Security Guard',
  'Senior Guard',
  'CCTV Operator',
  'Control Room Lead',
  'Patrol Lead',
  'Night Patrol',
  'Mobile Patrol',
  'VIP Protection',
  'HR Coordinator',
  'Payroll Specialist',
]

export function AddEmployeeDialog({ 
  open, 
  onOpenChange,
  onAddEmployee,
  onImportEmployees 
}: AddEmployeeDialogProps) {
  const [activeTab, setActiveTab] = useState('manual')
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importCount, setImportCount] = useState(0)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    location: '',
    joinDate: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const selectedLocation = locations.find(l => l.name === formData.location)
    const newEmployee: NewEmployee = {
      ...formData,
      locationCode: selectedLocation?.code || '',
      status: 'active',
    }
    
    onAddEmployee?.(newEmployee)
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      department: '',
      position: '',
      location: '',
      joinDate: new Date().toISOString().split('T')[0],
    })
    
    onOpenChange(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Simulate file parsing
    const reader = new FileReader()
    reader.onload = () => {
      // In a real app, you would parse the Excel/CSV file here
      // For demo, we'll simulate a successful import
      setTimeout(() => {
        const mockImportedEmployees: NewEmployee[] = Array.from({ length: 15 }, (_, i) => ({
          name: `Imported Employee ${i + 1}`,
          email: `imported.employee${i + 1}@secureguard.com`,
          department: departments[Math.floor(Math.random() * departments.length)],
          position: positions[Math.floor(Math.random() * positions.length)],
          location: locations[Math.floor(Math.random() * locations.length)].name,
          locationCode: locations[Math.floor(Math.random() * locations.length)].code,
          joinDate: new Date().toISOString().split('T')[0],
          status: 'active',
        }))
        
        setImportCount(mockImportedEmployees.length)
        setImportStatus('success')
        onImportEmployees?.(mockImportedEmployees)
      }, 1500)
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    // Create CSV template
    const headers = ['Name', 'Email', 'Department', 'Position', 'Location', 'Location Code', 'Join Date', 'Status']
    const exampleRow = ['John Doe', 'john.doe@example.com', 'Field Security', 'Security Guard', 'Head Office', 'HO', '2024-01-15', 'active']
    
    const csvContent = [
      headers.join(','),
      exampleRow.join(','),
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const resetImportStatus = () => {
    setImportStatus('idle')
    setImportCount(0)
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen)
      if (!isOpen) {
        resetImportStatus()
        setActiveTab('manual')
      }
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
          <DialogDescription>
            Add a new employee manually or import multiple employees from an Excel/CSV file.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual" className="gap-2">
              <UserPlus className="size-4" />
              Manual Entry
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <FileSpreadsheet className="size-4" />
              Import from Excel
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                    required
                  >
                    <SelectTrigger>
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
                  <Select
                    value={formData.position}
                    onValueChange={(value) => setFormData({ ...formData, position: value })}
                    required
                  >
                    <SelectTrigger>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.code} value={loc.name}>
                          {loc.name} ({loc.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joinDate">Join Date</Label>
                  <Input
                    id="joinDate"
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <UserPlus className="mr-2 size-4" />
                  Add Employee
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="import" className="mt-4 space-y-4">
            {importStatus === 'idle' && (
              <>
                <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
                  <Upload className="mx-auto size-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">Upload Excel or CSV File</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop your file here, or click to browse
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="mr-2 size-4" />
                    Choose File
                  </Button>
                </div>
                
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                  <div>
                    <p className="font-medium">Need a template?</p>
                    <p className="text-sm text-muted-foreground">
                      Download our Excel template with the correct format
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="mr-2 size-4" />
                    Download Template
                  </Button>
                </div>
                
                <Alert>
                  <AlertCircle className="size-4" />
                  <AlertTitle>Supported Formats</AlertTitle>
                  <AlertDescription>
                    Excel (.xlsx, .xls) and CSV files are supported. Make sure your file includes columns for:
                    Name, Email, Department, Position, Location, Location Code, Join Date, and Status.
                  </AlertDescription>
                </Alert>
              </>
            )}
            
            {importStatus === 'success' && (
              <Alert className="border-success bg-success/10">
                <CheckCircle2 className="size-4 text-success" />
                <AlertTitle className="text-success">Import Successful!</AlertTitle>
                <AlertDescription>
                  Successfully imported {importCount} employees. They have been added to the directory.
                </AlertDescription>
              </Alert>
            )}
            
            {importStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Import Failed</AlertTitle>
                <AlertDescription>
                  There was an error importing your file. Please check the format and try again.
                </AlertDescription>
              </Alert>
            )}
            
            {importStatus !== 'idle' && (
              <DialogFooter>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={resetImportStatus}>
                  Import Another File
                </Button>
              </DialogFooter>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
