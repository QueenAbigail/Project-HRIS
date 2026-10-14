import type { Worksheet } from 'exceljs'
import type {
  BackfillCandidate,
  BackfillRow,
  BackfillTarget,
  SheetColumn,
} from '@/lib/employee-backfill-types'

export interface DirectoryEmployee {
  id: string
  name: string
  employeeCode: string | null
  position: string | null
  status: string
  site: { name: string } | null
}

const STRONG_MATCH = 0.75
const WEAK_HINT = 0.5
const AMBIGUITY_MARGIN = 0.05
const MAX_CANDIDATES = 5

export function cellText(sheet: Worksheet, rowNumber: number, column: number): string {
  try {
    return String(sheet.getRow(rowNumber).getCell(column).text ?? '').trim()
  } catch {
    return ''
  }
}

export function detectHeaderRow(sheet: Worksheet): number {
  const lastRow = Math.min(sheet.rowCount, 20)
  let bestRow = 1
  let bestCount = 0
  for (let r = 1; r <= lastRow; r++) {
    let count = 0
    sheet.getRow(r).eachCell((cell) => {
      const text = String(cell.text ?? '').trim()
      if (text && Number.isNaN(Number(text))) count++
    })
    if (count > bestCount) {
      bestCount = count
      bestRow = r
    }
  }
  return bestRow
}

export function readColumns(sheet: Worksheet, headerRow: number): SheetColumn[] {
  const columns: SheetColumn[] = []
  sheet.getRow(headerRow).eachCell((cell, colNumber) => {
    const header = String(cell.text ?? '').trim()
    if (header) {
      columns.push({ index: colNumber, letter: sheet.getColumn(colNumber).letter, header })
    }
  })
  return columns
}

export function suggestColumn(columns: SheetColumn[], kind: BackfillTarget): number | null {
  const pattern =
    kind === 'code' ? /(code|kode|nik|nip|emp.?id|id karyawan)/i : /(name|nama)/i
  return columns.find((c) => pattern.test(c.header))?.index ?? null
}

export function normalizeName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

// Drops initials/title prefixes (e.g. "R." or "M.") and sorts tokens so word order doesn't matter.
function coreName(normalized: string): string {
  const tokens = normalized.split(' ').filter(Boolean)
  const meaningful = tokens.filter((t) => t.length > 1)
  return (meaningful.length ? meaningful : tokens).sort().join(' ')
}

function normalizeCode(value: string): string {
  return value.toUpperCase().replace(/\s+/g, '')
}

function compactCode(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/^([A-Z]*)0+(\d)/, '$1$2')
}

interface Bigrams {
  grams: Map<string, number>
  size: number
  raw: string
}

function bigrams(value: string): Bigrams {
  const raw = value.replace(/ /g, '')
  const grams = new Map<string, number>()
  for (let i = 0; i < raw.length - 1; i++) {
    const g = raw.slice(i, i + 2)
    grams.set(g, (grams.get(g) ?? 0) + 1)
  }
  return { grams, size: Math.max(raw.length - 1, 0), raw }
}

function dice(a: Bigrams, b: Bigrams): number {
  if (a.size === 0 || b.size === 0) return a.raw === b.raw ? 1 : 0
  let intersection = 0
  for (const [g, count] of a.grams) {
    const other = b.grams.get(g)
    if (other) intersection += Math.min(count, other)
  }
  return (2 * intersection) / (a.size + b.size)
}

function toCandidate(emp: DirectoryEmployee, score: number): BackfillCandidate {
  return {
    id: emp.id,
    name: emp.name,
    employeeCode: emp.employeeCode,
    siteName: emp.site?.name ?? null,
    position: emp.position,
    status: emp.status,
    score: Math.round(score * 100) / 100,
  }
}

function groupBy<T>(items: T[], key: (item: T) => string | null): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const k = key(item)
    if (!k) continue
    const list = map.get(k)
    if (list) list.push(item)
    else map.set(k, [item])
  }
  return map
}

export function createMatcher(employees: DirectoryEmployee[], target: BackfillTarget) {
  if (target === 'name') {
    const byCode = groupBy(employees, (e) => (e.employeeCode ? normalizeCode(e.employeeCode) : null))
    const byCompact = groupBy(employees, (e) => (e.employeeCode ? compactCode(e.employeeCode) : null))

    return (rowNumber: number, reference: string): BackfillRow => {
      const exact = byCode.get(normalizeCode(reference))
      if (exact?.length) {
        return {
          rowNumber,
          reference,
          status: exact.length === 1 ? 'matched' : 'ambiguous',
          candidates: exact.map((e) => toCandidate(e, 1)),
        }
      }
      const loose = byCompact.get(compactCode(reference))
      if (loose?.length) {
        return {
          rowNumber,
          reference,
          status: loose.length === 1 ? 'suggested' : 'ambiguous',
          candidates: loose.slice(0, MAX_CANDIDATES).map((e) => toCandidate(e, 0.9)),
        }
      }
      return { rowNumber, reference, status: 'not_found', candidates: [] }
    }
  }

  const prepared = employees.map((emp) => {
    const full = normalizeName(emp.name)
    const core = coreName(full)
    return { emp, full, core, grams: bigrams(core) }
  })
  const byFull = groupBy(prepared, (p) => p.full || null)
  const byCore = groupBy(prepared, (p) => p.core || null)

  return (rowNumber: number, reference: string): BackfillRow => {
    const full = normalizeName(reference)
    const exact = byFull.get(full)
    if (exact?.length) {
      return {
        rowNumber,
        reference,
        status: exact.length === 1 ? 'matched' : 'ambiguous',
        candidates: exact.map((p) => toCandidate(p.emp, 1)),
      }
    }

    const core = coreName(full)
    const coreHits = byCore.get(core)
    if (coreHits?.length) {
      return {
        rowNumber,
        reference,
        status: coreHits.length === 1 ? 'suggested' : 'ambiguous',
        candidates: coreHits.slice(0, MAX_CANDIDATES).map((p) => toCandidate(p.emp, 0.95)),
      }
    }

    const refGrams = bigrams(core)
    const refTokens = core.split(' ').filter(Boolean)
    const scored: { emp: DirectoryEmployee; score: number }[] = []
    for (const p of prepared) {
      const empTokens = new Set(p.core.split(' '))
      const containsAll = refTokens.length > 0 && refTokens.every((t) => empTokens.has(t))
      const lengthGap = Math.abs(p.grams.raw.length - refGrams.raw.length)
      const similarLength = lengthGap <= Math.max(p.grams.raw.length, refGrams.raw.length) * 0.5
      const score = Math.max(similarLength ? dice(refGrams, p.grams) : 0, containsAll ? 0.8 : 0)
      if (score >= WEAK_HINT) scored.push({ emp: p.emp, score })
    }
    scored.sort((a, b) => b.score - a.score)
    const candidates = scored.slice(0, MAX_CANDIDATES).map((s) => toCandidate(s.emp, s.score))
    const strong = candidates.filter((c) => c.score >= STRONG_MATCH)

    if (strong.length === 0) {
      return { rowNumber, reference, status: 'not_found', candidates }
    }
    const isAmbiguous = strong.length > 1 && strong[1].score >= strong[0].score - AMBIGUITY_MARGIN
    return { rowNumber, reference, status: isAmbiguous ? 'ambiguous' : 'suggested', candidates }
  }
}
