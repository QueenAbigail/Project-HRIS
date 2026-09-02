import { prisma } from '@/lib/prisma'
import { formatBusinessDateTime } from '@/lib/timezone'

export type LoginActivityRecord = {
  id: string
  email: string
  employeeName: string
  employeeId: string
  timestamp: string
  ipAddress: string
  device: string
  channel: string
  result: string
  isDummy?: boolean
}

export type AttendanceActivityRecord = {
  id: string
  email: string
  employeeName: string
  employeeId: string
  timestamp: string
  result: string
  action: string
  deviceId: string
  device: string
  latitude: number | null
  longitude: number | null
  distance: number | null
  isMockLocation: boolean | null
}

const attendanceResults = [
  'FAILED_GPS_DENIED',
  'FAILED_GPS_TIMEOUT',
  'FAILED_OUT_OF_RADIUS',
  'FAILED_FAKE_GPS',
  'FAILED_CAMERA_DENIED',
] as const

export async function getActivityErrorCounts() {
  const [login, attendance] = await Promise.all([
    prisma.authActivityLog.count({
      where: {
        result: {
          in: ['FAILED_INVALID_CREDENTIALS', 'FAILED_DEVICE_LIMIT', 'FAILED_OTHER'],
        },
      },
    }),
    prisma.authActivityLog.count({
      where: { result: { in: [...attendanceResults] } },
    }),
  ])

  return { login, attendance }
}

export async function getAttendanceActivity(limit = 20): Promise<AttendanceActivityRecord[]> {
  const records = await prisma.authActivityLog.findMany({
    where: { result: { in: [...attendanceResults] } },
    orderBy: { createdAt: 'desc' },
    take: Math.max(0, limit),
  })
  const users = await prisma.user.findMany({
    where: { email: { in: records.map((record) => record.email) } },
    select: { email: true, name: true, employeeCode: true },
  })
  const usersByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]))
  return records.map((record) => {
    const user = usersByEmail.get(record.email.toLowerCase())
    return {
      id: record.id,
      email: record.email,
      employeeName: user?.name ?? record.email.split('@')[0],
      employeeId: user?.employeeCode ?? record.email.split('@')[0],
      timestamp: formatBusinessDateTime(record.createdAt),
      result: record.result,
      action: record.action ?? 'ATTENDANCE_IN',
      deviceId: record.deviceId ?? 'Unknown device',
      device: record.userAgent ?? 'Unknown device',
      latitude: record.latitude,
      longitude: record.longitude,
      distance: record.distance,
      isMockLocation: record.isMockLocation,
    }
  })
}

export async function getLoginActivity(limit = 20): Promise<LoginActivityRecord[]> {
  const records = await prisma.authActivityLog.findMany({
    where: {
      result: {
        notIn: [
          'FAILED_GPS_DENIED',
          'FAILED_GPS_TIMEOUT',
          'FAILED_OUT_OF_RADIUS',
          'FAILED_FAKE_GPS',
          'FAILED_CAMERA_DENIED',
        ],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: Math.max(0, limit),
  })

  const users = await prisma.user.findMany({
    where: { email: { in: records.map((record) => record.email) } },
    select: { email: true, name: true, employeeCode: true },
  })
  const usersByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]))

  const realRecords = records.map((record) => {
    const user = usersByEmail.get(record.email.toLowerCase())
    return {
    id: record.id,
    email: record.email,
    employeeName: user?.name ?? record.email.split('@')[0],
    employeeId: user?.employeeCode ?? record.email.split('@')[0],
    timestamp: formatBusinessDateTime(record.createdAt),
    ipAddress: record.ipAddress ?? 'Unknown IP',
    device: record.userAgent ?? 'Unknown device',
    channel: record.channel,
    result: record.result,
    }
  })

  return realRecords
}
