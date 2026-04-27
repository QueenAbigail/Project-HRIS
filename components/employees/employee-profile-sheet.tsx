'use client'

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
  CreditCard
} from 'lucide-react'

export interface Employee {
  id: string
  name: string
  initials: string
  email: string
  department: string
  position: string
  status: string
  joinDate: string
  location: string
  locationCode: string
  phone?: string
  emergencyContact?: string
  certifications?: string[]
  bankAccount?: string
  taxId?: string
  personalEmail?: string
  bpjsNumber?: string
  npwpNumber?: string
  bloodType?: string
  ktaNumber?: string
  ktaExpiry?: string
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
    ]
  },
  'EMP002': {
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
                <span className="text-xs text-muted-foreground font-mono">{employee.id}</span>
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
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
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
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <span>{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="size-4 text-muted-foreground" />
                  <span>{details.phone}</span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <AlertCircle className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <span>{details.emergencyContact}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                  <Building2 className="size-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <span>{employee.location}</span>
                    <span className="ml-2 text-xs font-mono text-muted-foreground">({employee.locationCode})</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <Briefcase className="size-4 text-muted-foreground mt-0.5" />
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
                <div className="flex flex-wrap gap-2">
                  {details.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-0">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button className="w-full" onClick={() => onEdit(employee)}>
              Edit Employee Details
            </Button>
          </TabsContent>

          <TabsContent value="attendance" className="mt-4 space-y-4">
            {/* Attendance Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-secondary/50 border-border">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-primary">{details.attendanceThisMonth}</p>
                  <p className="text-xs text-muted-foreground">Days Present</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50 border-border">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">{details.totalWorkHours}</p>
                  <p className="text-xs text-muted-foreground">Work Hours</p>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50 border-border">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold text-warning">{details.overtimeHours}</p>
                  <p className="text-xs text-muted-foreground">Overtime</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="size-4" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {details.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-success" />
                        <span>{activity.action}</span>
                      </div>
                      <div className="text-right text-muted-foreground">
                        <p className="text-xs">{activity.date}</p>
                        <p className="text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full">
              <FileText className="size-4 mr-2" />
              View Full Attendance Report
            </Button>
          </TabsContent>

          <TabsContent value="payroll" className="mt-4 space-y-4">
            {/* Salary Info */}
            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CreditCard className="size-4" />
                  Salary Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span className="font-medium">${details.baseSalary.toLocaleString()}/month</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Overtime ({details.overtimeHours}h)</span>
                  <span className="font-medium text-warning">+${(details.overtimeHours * 25).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Estimated Total</span>
                  <span className="text-lg font-bold text-primary">
                    ${(details.baseSalary + details.overtimeHours * 25).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card className="bg-secondary/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Bank Account</span>
                  <span className="font-mono">{details.bankAccount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Tax ID</span>
                  <span className="font-mono">{details.taxId}</span>
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

