'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

const payrollData = [
  {
    id: 'EMP001',
    name: 'Michael Chen',
    initials: 'MC',
    department: 'Field Security',
    baseSalary: 2800,
    overtime: 450,
    deductions: 280,
    netPay: 2970,
    status: 'paid',
  },
  {
    id: 'EMP002',
    name: 'Sarah Williams',
    initials: 'SW',
    department: 'Surveillance',
    baseSalary: 2600,
    overtime: 320,
    deductions: 260,
    netPay: 2660,
    status: 'paid',
  },
  {
    id: 'EMP003',
    name: 'David Rodriguez',
    initials: 'DR',
    department: 'Patrol',
    baseSalary: 3200,
    overtime: 580,
    deductions: 320,
    netPay: 3460,
    status: 'pending',
  },
  {
    id: 'EMP004',
    name: 'Emily Johnson',
    initials: 'EJ',
    department: 'Administration',
    baseSalary: 3500,
    overtime: 0,
    deductions: 350,
    netPay: 3150,
    status: 'paid',
  },
  {
    id: 'EMP005',
    name: 'James Wilson',
    initials: 'JW',
    department: 'Field Security',
    baseSalary: 2400,
    overtime: 380,
    deductions: 240,
    netPay: 2540,
    status: 'paid',
  },
  {
    id: 'EMP006',
    name: 'Robert Taylor',
    initials: 'RT',
    department: 'Patrol',
    baseSalary: 2200,
    overtime: 0,
    deductions: 220,
    netPay: 1980,
    status: 'pending',
  },
]

const statusStyles: Record<string, string> = {
  'paid': 'bg-success/10 text-success border-success/20',
  'pending': 'bg-warning/10 text-warning border-warning/20',
  'failed': 'bg-destructive/10 text-destructive border-destructive/20',
}

export function PayrollTable() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle>Payroll Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Base</TableHead>
                <TableHead className="text-right hidden sm:table-cell">Overtime</TableHead>
                <TableHead className="text-right hidden md:table-cell">Deductions</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarImage src={`/avatars/${record.id}.jpg`} alt={record.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {record.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{record.name}</p>
                        <p className="text-xs text-muted-foreground hidden sm:block">{record.department}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${record.baseSalary.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono hidden sm:table-cell text-success">
                    +${record.overtime.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono hidden md:table-cell text-destructive">
                    -${record.deductions.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    ${record.netPay.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[record.status]}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
