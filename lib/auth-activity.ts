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
