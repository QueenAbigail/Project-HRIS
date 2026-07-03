'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Building2, 
  Briefcase,
  Clock,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle2,
  User,
  CreditCard,
  ChevronDown,
  Building,
  FileSignature,
  UserCheck
} from 'lucide-react'

export interface Employee {
  id: string
  name: string
  initials: string
  email: string
  employeeCode?: string | null
  department: string
  position: string
  status: string
  joinDate: string
  location: string
  locationCode: string
  phone?: string
  phoneNumber?: string
  emergencyContact?: string
  certifications?: string[]
  bankAccount?: string
  taxId?: string
  bankName?: string
  accountHolder?: string
  accountNumber?: string
  personalEmail?: string
  bpjsNumber?: string
  npwpNumber?: string
  bloodType?: string
  ktaNumber?: string
  ktaExpiry?: string
  ktpNumber?: string
  address?: string
  birthCity?: string
  birthDate?: string
  gender?: string
  religion?: string
  maritalStatus?: string
  employmentStatus?: string
  site?: { name: string }
  supervisor?: { name: string }
}

interface EmployeeProfileSheetProps {
  employee: Employee | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (employee: Employee) => void
}

const statusStyles: Record<string, string> = {
  'active': 'bg-success/10 text-success border-success/20',
  'on-leave': 'bg-warning/10 text-warning border-warning/20',
  'inactive': 'bg-muted text-muted-foreground border-muted',
}

// Mock additional employee data
const employeeDetails: Record<string, Partial<Employee> & { 
  phone: string
  emergencyContact: string
  certifications: string[]
  bankAccount: string
  taxId: string
  attendanceThisMonth: number
  totalWorkHours: number
  overtimeHours: number
  baseSalary: number
  recentActivity: { date: string; action: string; time: string }[]
}> = {
  'EMP001': {
    phone: '+1 (555) 123-4567',
    emergencyContact: 'Jane Chen - +1 (555) 987-6543',
    certifications: ['CPR Certified', 'Armed Guard License', 'First Aid'],
    bankAccount: '**** **** **** 4521',
    taxId: '***-**-7890',
    attendanceThisMonth: 22,
    totalWorkHours: 176,
    overtimeHours: 12,
    baseSalary: 4200,
  recentActivity: [
      { date: 'Mar 28, 2026', action: 'Checked In', time: '07:55 AM' },
      { date: 'Mar 28, 2026', action: 'Checked Out', time: '04:05 PM' },
      { date: 'Mar 27, 2026', action: 'Overtime Approved', time: '06:30 PM' },
    ],
    employmentStatus: 'Permanent',
    site: { name: 'Head Office' },
    supervisor: { name: 'Michael Johnson' }
  },
  'EMP002': {
    recentActivity: [
      { date: 'Mar 28, 2026', action: 'Checked In', time: '08:00 AM' },
      { date: 'Mar 27, 2026', action: 'Shift Completed', time: '04:00 PM' },
    ],
    employmentStatus: 'Contract',
    site: { name: 'Branch A' },
    supervisor: { name: 'Sarah Wilson' },
    phone: '+1 (555) 234-5678',
    emergencyContact: 'Tom Williams - +1 (555) 876-5432',
    certifications: ['CCTV Operations', 'Security Systems'],
    bankAccount: '**** **** **** 8834',
    taxId: '***-**-4567',
    attendanceThisMonth: 21,
    totalWorkHours: 168,
    overtimeHours: 4,
    baseSalary: 3800,
    recentActivity: [
      { date: 'Mar 28, 2026', action: 'Checked In', time: '08:00 AM' },
      { date: 'Mar 27, 2026', action: 'Shift Completed', time: '04:00 PM' },
    ]
  },
}

// Default details for employees without specific data
const defaultDetails = {
  phone: '+1 (555) 000-0000',
  emergencyContact: 'Emergency Contact - +1 (555) 000-0000',
  certifications: ['Basic Security Training'],
  bankAccount: '**** **** **** 0000',
  taxId: '***-**-0000',
  attendanceThisMonth: 20,
  totalWorkHours: 160,
  overtimeHours: 0,
  baseSalary: 3500,
  recentActivity: [
    { date: 'Mar 28, 2026', action: 'Checked In', time: '08:00 AM' },
  ]
}

export function EmployeeProfileSheet({ employee, open, onOpenChange, onEdit }: EmployeeProfileSheetProps) {
  if (!employee) return null

const details = employeeDetails[employee.id] || defaultDetails
  const [isExpanded, setIsExpanded] = useState(false)
  const [isExpandedAssignment, setIsExpandedAssignment] = useState(false)
  const [isExpandedKTA, setIsExpandedKTA] = useState(false)

  // Dynamic check for missing administrative fields
  const fieldChecks: { key: keyof Employee; label: string }[] = [
    { key: 'personalEmail', label: 'Personal Email' },
    { key: 'bpjsNumber', label: 'BPJS Number' },
    { key: 'npwpNumber', label: 'NPWP Number' },
    { key: 'ktaNumber', label: 'KTA Number' },
  ]

  const missingFields = fieldChecks
    .filter((f) => !employee[f.key])
    .map((f) => f.label)

  const hasMissingFields = missingFields.length > 0

  const certName = employee.certifications?.[0];
  const hasCert = !!certName && certName !== "none"; 
  const isKtaExpired = employee.ktaExpiry ? new Date(employee.ktaExpiry) < new Date() : false;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-16 border-2 border-primary/20">
              <AvatarImage src={`/avatars/${employee.id}.jpg`} alt={employee.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {employee.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-xl">{employee.name}</SheetTitle>
              <p className="text-muted-foreground">{employee.position}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className={statusStyles[employee.status]}>
                  {employee.status === 'on-leave' ? 'On Leave' : employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{employee.employeeCode || 'No ID'}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        {hasMissingFields && (
          <Alert className="mb-4 border-warning/20 bg-warning/10 text-warning">
            <AlertCircle className="size-4" />
            <AlertTitle>Perhatian</AlertTitle>
            <AlertDescription className="text-warning/90">
              Mohon segera lengkapi data berikut: {missingFields.join(', ')}.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            {/* Contact Information */}
            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="size-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <Mail className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Personal Email</p>
                    <span>{employee.personalEmail || 'Not provided'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Phone className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone Number</p>
                    <span>{employee.phoneNumber || 'Not provided'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <User className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <span>{employee.gender || 'Not provided'}</span>
                  </div>
                </div>

                {/* Expandable Section */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex items-start gap-3 text-sm">
                        <AlertCircle className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">KTP Number</p>
                          <span>{employee.ktpNumber || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Address</p>
                          <span>{employee.address || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Shield className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Religion</p>
                          <span>{employee.religion || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">City of Birth</p>
                          <span>{employee.birthCity || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Calendar className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date of Birth</p>
                          <span>{employee.birthDate || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <CreditCard className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">BPJS Number</p>
                          <span>{employee.bpjsNumber || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <FileText className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">NPWP Number</p>
                          <span>{employee.npwpNumber || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <User className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Marital Status</p>
                          <span>{employee.maritalStatus || 'Not provided'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Blood Type</p>
                          <span>{employee.bloodType || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full flex justify-center items-center py-1 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsExpanded((prev) => !prev)}
                >
                  <ChevronDown className={`size-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                </button>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="size-4" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={
                  !hasCert ? "bg-warning/10 text-warning border-0" :
                  isKtaExpired ? "bg-destructive/10 text-destructive border-0" :
                  "bg-primary/10 text-primary border-0"
                }>
                  {!hasCert ? "No Certification" : certName}
                </Badge>

                {/* Expandable KTA Details */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isExpandedKTA ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex items-start gap-3 text-sm">
                        <CreditCard className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">KTA Number</p>
                          <span>{employee.ktaNumber || "Not provided"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <Calendar className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">KTA Expiry</p>
                          <span>{employee.ktaExpiry ? new Date(employee.ktaExpiry).toLocaleDateString() : "Not provided"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {hasCert && (
                  <button
                    type="button"
                    className="w-full flex justify-center items-center py-1 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsExpandedKTA((prev) => !prev)}
                  >
                    <ChevronDown className={`size-4 transition-transform duration-300 ${isExpandedKTA ? 'rotate-180' : 'rotate-0'}`} />
                  </button>
                )}
              </CardContent>
            </Card>

            <Button className="w-full" onClick={() => onEdit(employee)}>
              Edit Employee Details
            </Button>
          </TabsContent>

          <TabsContent value="assignment" className="mt-4 space-y-4">
            {/* Assignment Details */}
            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="size-4" />
                  Assignment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location / Site</p>
                    <span>{employee.site?.name || employee.location}</span>
                    <span className="ml-2 text-xs font-mono text-muted-foreground">({employee.locationCode})</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Building className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Department</p>
                    <span>{employee.department}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Calendar className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Join Date</p>
                    <span>{employee.joinDate}</span>
                  </div>
                </div>

                {/* Expandable Assignment Section */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${isExpandedAssignment ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-3 pt-3 border-t border-border">
                      <div className="flex items-start gap-3 text-sm">
                        <FileSignature className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Employment Status</p>
                          <span>{employee.employmentStatus || 'Not specified'}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 text-sm">
                        <UserCheck className="size-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Direct Supervisor</p>
                          <span>{employee.supervisor?.name || 'Not assigned'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full flex justify-center items-center py-1 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsExpandedAssignment((prev) => !prev)}
                >
                  <ChevronDown className={`size-4 transition-transform duration-300 ${isExpandedAssignment ? 'rotate-180' : 'rotate-0'}`} />
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="mt-4 space-y-4">
            {/* Salary Information */}
            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="size-4" />
                  Salary Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Base Salary */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span className="font-medium">Rp 0/month</span>
                </div>

                {/* Adjustments */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Adjustments</span>
                  <span className="text-success font-medium">+ Rp 0</span>
                </div>

                {/* Deductions */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Deductions</span>
                  <span className="text-destructive font-medium">- Rp 0</span>
                </div>

                <Separator />

                {/* Take Home Pay */}
                <div className="flex justify-between items-center">
                  <span className="font-medium">Take Home Pay</span>
                  <span className="text-lg font-bold text-primary">Rp 0</span>
                </div>
              </CardContent>
            </Card>

            {/* Account Detail */}
            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Account Detail</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Bank Name</span>
                  <span className="font-medium">{employee.bankName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Account Holder</span>
                  <span className="font-medium">{employee.accountHolder || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Account Number</span>
                  <span className="font-mono text-xs">{employee.accountNumber ? `••••${employee.accountNumber.slice(-4)}` : 'Not specified'}</span>
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full">
              <FileText className="size-4 mr-2" />
              View Payroll History
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

