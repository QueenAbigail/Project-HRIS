import { prisma } from '@/lib/prisma'

export type LoginActivityRecord = {
  id: string
  email: string
  timestamp: string
  ipAddress: string
  device: string
  channel: string
  result: string
  isDummy?: boolean
}

const dummyLoginActivities: LoginActivityRecord[] = [
  { id: 'dummy-1', email: 'demo.success@example.com', timestamp: '2025-05-07 14:32:15', ipAddress: '192.168.1.100', device: 'Chrome - Windows', channel: 'WEB', result: 'SUCCESS', isDummy: true },
  { id: 'dummy-2', email: 'demo.mobile@example.com', timestamp: '2025-05-07 13:45:22', ipAddress: '192.168.1.101', device: 'Mobile demo device', channel: 'MOBILE', result: 'SUCCESS', isDummy: true },
  { id: 'dummy-3', email: 'demo.failed@example.com', timestamp: '2025-05-07 12:15:00', ipAddress: '192.168.1.102', device: 'Firefox - Ubuntu', channel: 'WEB', result: 'FAILED_INVALID_CREDENTIALS', isDummy: true },
]

export async function getLoginActivity(limit = 20): Promise<LoginActivityRecord[]> {
  const records = await prisma.authActivityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.max(0, limit),
  })

  const realRecords = records.map((record) => ({
    id: record.id,
    email: record.email,
    timestamp: record.createdAt.toISOString().replace('T', ' ').slice(0, 19),
    ipAddress: record.ipAddress ?? 'Unknown IP',
    device: record.userAgent ?? 'Unknown device',
    channel: record.channel,
    result: record.result,
  }))

  return [...realRecords, ...dummyLoginActivities].slice(0, limit + dummyLoginActivities.length)
}
