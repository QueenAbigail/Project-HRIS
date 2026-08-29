import { prisma } from '@/lib/prisma'

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

const dummyLoginActivities: LoginActivityRecord[] = [
  { id: 'dummy-1', email: 'demo.success@example.com', employeeName: 'Demo Success', employeeId: 'demo.success', timestamp: '2025-05-07 14:32:15', ipAddress: '192.168.1.100', device: 'Chrome - Windows', channel: 'WEB', result: 'SUCCESS', isDummy: true },
  { id: 'dummy-2', email: 'demo.mobile@example.com', employeeName: 'Demo Mobile', employeeId: 'demo.mobile', timestamp: '2025-05-07 13:45:22', ipAddress: '192.168.1.101', device: 'Mobile demo device', channel: 'MOBILE', result: 'SUCCESS', isDummy: true },
  { id: 'dummy-3', email: 'demo.failed@example.com', employeeName: 'Demo Failed', employeeId: 'demo.failed', timestamp: '2025-05-07 12:15:00', ipAddress: '192.168.1.102', device: 'Firefox - Ubuntu', channel: 'WEB', result: 'FAILED_INVALID_CREDENTIALS', isDummy: true },
]

export async function getLoginActivity(limit = 20): Promise<LoginActivityRecord[]> {
  const records = await prisma.authActivityLog.findMany({
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
    timestamp: record.createdAt.toISOString().replace('T', ' ').slice(0, 19),
    ipAddress: record.ipAddress ?? 'Unknown IP',
    device: record.userAgent ?? 'Unknown device',
    channel: record.channel,
    result: record.result,
    }
  })

  return [...realRecords, ...dummyLoginActivities].slice(0, limit + dummyLoginActivities.length)
}
