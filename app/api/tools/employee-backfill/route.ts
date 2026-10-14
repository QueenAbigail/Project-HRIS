import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/system'
import { canUseSystemTools } from '@/lib/authorization'
import {
  cellText,
  createMatcher,
  detectHeaderRow,
  readColumns,
  suggestColumn,
} from '@/lib/employee-backfill'
import type {
  BackfillResolution,
  BackfillTarget,
  InspectResponse,
  MatchResponse,
  MatchSummary,
} from '@/lib/employee-backfill-types'

export const runtime = 'nodejs'

const MAX_FILE_BYTES = 10 * 1024 * 1024
const MAX_ROWS = 5000

class BadRequest extends Error {}

function parsePositiveInt(value: FormDataEntryValue | null, field: string): number {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1) throw new BadRequest(`Invalid ${field}`)
  return n
}

async function loadWorkbook(file: File) {
  if (!file.name.toLowerCase().endsWith('.xlsx')) {
    throw new BadRequest('Only .xlsx files are supported')
  }
  if (file.size > MAX_FILE_BYTES) throw new BadRequest('File is larger than 10 MB')
  const workbook = new ExcelJS.Workbook()
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await workbook.xlsx.load((await file.arrayBuffer()) as any)
  } catch {
    throw new BadRequest('Could not read the Excel file')
  }
  return workbook
}

function getSheet(workbook: ExcelJS.Workbook, name: string | null) {
  const sheet = name ? workbook.getWorksheet(name) : workbook.worksheets[0]
  if (!sheet) throw new BadRequest('Sheet not found')
  return sheet
}

function readJobParams(form: FormData) {
  const target = form.get('target')
  if (target !== 'code' && target !== 'name') throw new BadRequest('Invalid target')
  const headerRow = parsePositiveInt(form.get('headerRow'), 'header row')
  const referenceColumn = parsePositiveInt(form.get('referenceColumn'), 'reference column')
  const targetColumn = parsePositiveInt(form.get('targetColumn'), 'target column')
  if (referenceColumn === targetColumn) {
    throw new BadRequest('Reference and target columns must be different')
  }
  return { target: target as BackfillTarget, headerRow, referenceColumn, targetColumn }
}

function asciiFilename(name: string) {
  const base = name.replace(/\.xlsx$/i, '').replace(/[^\w.-]+/g, '_') || 'workbook'
  return `${base}_backfilled.xlsx`
}

export async function POST(request: NextRequest) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!canUseSystemTools(currentUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) throw new BadRequest('File is required')

    const action = form.get('action')
    const workbook = await loadWorkbook(file)
    const sheet = getSheet(workbook, (form.get('sheetName') as string) || null)

    if (action === 'inspect') {
      const requestedHeader = form.get('headerRow')
      const headerRow = requestedHeader
        ? parsePositiveInt(requestedHeader, 'header row')
        : detectHeaderRow(sheet)
      const columns = readColumns(sheet, headerRow)
      const body: InspectResponse = {
        sheetNames: workbook.worksheets.map((ws) => ws.name),
        sheetName: sheet.name,
        headerRow,
        columns,
        suggestedNameColumn: suggestColumn(columns, 'name'),
        suggestedCodeColumn: suggestColumn(columns, 'code'),
      }
      return NextResponse.json(body)
    }

    const { target, headerRow, referenceColumn, targetColumn } = readJobParams(form)
    const lastRow = sheet.rowCount
    if (lastRow - headerRow > MAX_ROWS) {
      throw new BadRequest(`Sheet has more than ${MAX_ROWS} data rows`)
    }

    if (action === 'match') {
      const employees = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          employeeCode: true,
          position: true,
          status: true,
          site: { select: { name: true } },
        },
      })
      const match = createMatcher(employees, target)
      const summary: MatchSummary = {
        totalRows: 0,
        alreadyFilled: 0,
        matched: 0,
        suggested: 0,
        ambiguous: 0,
        notFound: 0,
      }
      const rows = []
      for (let r = headerRow + 1; r <= lastRow; r++) {
        const reference = cellText(sheet, r, referenceColumn)
        if (!reference) continue
        summary.totalRows++
        if (cellText(sheet, r, targetColumn)) {
          summary.alreadyFilled++
          continue
        }
        const row = match(r, reference)
        if (row.status === 'matched') summary.matched++
        else if (row.status === 'suggested') summary.suggested++
        else if (row.status === 'ambiguous') summary.ambiguous++
        else summary.notFound++
        rows.push(row)
      }
      const body: MatchResponse = { rows, summary }
      return NextResponse.json(body)
    }

    if (action === 'export') {
      let resolutions: BackfillResolution[]
      try {
        resolutions = JSON.parse(String(form.get('resolutions') ?? '[]'))
      } catch {
        throw new BadRequest('Invalid resolutions')
      }
      if (!Array.isArray(resolutions)) throw new BadRequest('Invalid resolutions')

      const ids = [...new Set(resolutions.map((r) => String(r.employeeId)))]
      const employees = await prisma.user.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true, employeeCode: true },
      })
      const byId = new Map(employees.map((e) => [e.id, e]))

      let filled = 0
      for (const { rowNumber, employeeId } of resolutions) {
        const r = Number(rowNumber)
        if (!Number.isInteger(r) || r <= headerRow || r > lastRow) continue
        if (!cellText(sheet, r, referenceColumn)) continue
        if (cellText(sheet, r, targetColumn)) continue
        const employee = byId.get(String(employeeId))
        const value = target === 'code' ? employee?.employeeCode : employee?.name
        if (!value) continue
        sheet.getRow(r).getCell(targetColumn).value = value
        filled++
      }

      const buffer = await workbook.xlsx.writeBuffer()
      return new NextResponse(buffer as ArrayBuffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${asciiFilename(file.name)}"`,
          'X-Filled-Count': String(filled),
          'Cache-Control': 'no-store',
        },
      })
    }

    throw new BadRequest('Unknown action')
  } catch (error) {
    if (error instanceof BadRequest) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('[employee-backfill] failed:', error)
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
  }
}
