import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Only 3 leave types are available
    const types = [
      { value: 'Izin', label: 'Cuti' },
      { value: 'Sakit', label: 'Sakit' },
      { value: 'TukarShift', label: 'Tukar Shift' },
    ]

    return Response.json(types)
  } catch (error) {
    console.error('[v0] Failed to fetch leave types:', error)
    return Response.json({ error: 'Failed to fetch leave types' }, { status: 500 })
  }
}
