import { prisma } from '@/lib/prisma'

const normalize = (value: string) => value.trim().toLowerCase()

export type PositionMatch = { id: string; value: string }

/**
 * Loads master_data positions once so a bulk import can resolve many rows
 * without a query per row. Ambiguous names (duplicates after normalizing)
 * are skipped so a row is never linked to a guessed position.
 */
export async function loadPositionLookup() {
  const positions = await prisma.masterData.findMany({
    where: { category: 'position' },
    select: { id: true, value: true },
  })

  const byName = new Map<string, PositionMatch>()
  const ambiguous = new Set<string>()
  for (const position of positions) {
    const key = normalize(position.value)
    if (byName.has(key)) ambiguous.add(key)
    else byName.set(key, position)
  }
  for (const key of ambiguous) byName.delete(key)

  const byId = new Map(positions.map((position) => [position.id, position]))

  return {
    resolveByName(text: unknown): PositionMatch | null {
      if (typeof text !== 'string' || !text.trim()) return null
      return byName.get(normalize(text)) ?? null
    },
    resolveById(id: unknown): PositionMatch | null {
      return typeof id === 'string' ? byId.get(id) ?? null : null
    },
  }
}

/**
 * Resolves the position fields for a single employee write. `positionId`
 * wins when given; otherwise the text is matched against master_data.
 * Unmatched text is kept as-is with a null positionId.
 */
export async function resolveEmployeePosition(input: { positionId?: unknown; position?: unknown }) {
  const lookup = await loadPositionLookup()
  const match = lookup.resolveById(input.positionId) ?? lookup.resolveByName(input.position)
  if (match) return { position: match.value, positionId: match.id }

  const text = typeof input.position === 'string' ? input.position.trim() : ''
  return { position: text || null, positionId: null }
}
