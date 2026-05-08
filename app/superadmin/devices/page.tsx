'use client'

import { useState } from 'react'
import { Smartphone, Trash2, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DeviceBinding {
  id: string
  userId: string
  userName: string
  userEmail: string
  deviceId: string
  deviceName: string
  deviceType: string
  appVersion?: string
  bindDate: string
  lastUsed: string
  isActive: boolean
}

// Mock data - replace with database query
const mockDevices: DeviceBinding[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@hris.com',
    deviceId: 'device-001',
    deviceName: 'Samsung Galaxy S23 (Android)',
    deviceType: 'mobile',
    appVersion: '1.2.5',
    bindDate: '2024-01-15',
    lastUsed: '2024-05-08 14:32',
    isActive: true,
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane@hris.com',
    deviceId: 'device-002',
    deviceName: 'iPhone 14 Pro (iOS)',
    deviceType: 'mobile',
    appVersion: '1.2.5',
    bindDate: '2024-02-10',
    lastUsed: '2024-05-08 10:15',
    isActive: true,
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Bob Wilson',
    userEmail: 'bob@hris.com',
    deviceId: 'device-003',
    deviceName: 'Laptop App (Windows)',
    deviceType: 'app',
    appVersion: '2.0.1',
    bindDate: '2024-03-05',
    lastUsed: '2024-05-07 16:45',
    isActive: true,
  },
  {
    id: '4',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john@hris.com',
    deviceId: 'device-004',
    deviceName: 'iPad Air (iOS)',
    deviceType: 'app',
    appVersion: '1.2.3',
    bindDate: '2024-01-20',
    lastUsed: '2024-05-02 09:20',
    isActive: false,
  },
]

export default function DeviceManagementPage() {
  const [devices, setDevices] = useState<DeviceBinding[]>(mockDevices)
  const [filterType, setFilterType] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const filteredDevices = devices.filter((device) => {
    if (filterType === 'active') return device.isActive
    if (filterType === 'inactive') return !device.isActive
    return true
  })

  const handleRemoveDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId)
    setShowConfirmDelete(true)
  }

  const confirmRemoveDevice = () => {
    if (!selectedDeviceId) return

    setDevices((prev) => prev.filter((d) => d.id !== selectedDeviceId))
    toast.success('Device Binding Removed', {
      description: 'The device binding has been successfully removed from the account.',
    })
    setShowConfirmDelete(false)
    setSelectedDeviceId(null)
  }

  const activeCount = devices.filter((d) => d.isActive).length
  const inactiveCount = devices.filter((d) => !d.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Device Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage account device bindings. Each account can have one mobile device and one app device bound for login restrictions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-2xl font-bold mt-1">{devices.length}</p>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Devices</p>
                <p className="text-2xl font-bold mt-1 text-success">{activeCount}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactive Devices</p>
                <p className="text-2xl font-bold mt-1 text-warning">{inactiveCount}</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Devices</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground ml-auto">
          Showing {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Devices List */}
      <div className="space-y-3">
        {filteredDevices.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Smartphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No devices found</p>
            </CardContent>
          </Card>
        ) : (
          filteredDevices.map((device) => (
            <Card key={device.id} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{device.deviceName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {device.userName} ({device.userEmail})
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-2 mt-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{device.deviceType}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Device ID:</span>
                        <span className="font-mono text-xs">{device.deviceId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bound Date:</span>
                        <span>{device.bindDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Last Used:</span>
                        <span>{device.lastUsed}</span>
                      </div>
                      {device.appVersion && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">App Version:</span>
                          <span>{device.appVersion}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      {device.isActive ? (
                        <Badge className="bg-success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveDevice(device.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Alert Dialog for Confirmation */}
      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Remove Device Binding
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the device binding for the selected device. The user will need to rebind their device before they can login from this device again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-3 bg-warning/10 rounded-lg border border-warning/30">
            <p className="text-sm font-medium text-foreground">
              Device:{' '}
              <span className="font-semibold">
                {devices.find((d) => d.id === selectedDeviceId)?.deviceName}
              </span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              User:{' '}
              <span className="font-semibold">
                {devices.find((d) => d.id === selectedDeviceId)?.userName}
              </span>
            </p>
          </div>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmRemoveDevice}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove Binding
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
