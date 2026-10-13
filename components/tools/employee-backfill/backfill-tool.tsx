'use client'

import { useMemo, useRef, useState } from 'react'
import { CheckCircle2, Download, FileSpreadsheet, Loader2, RotateCcw, Upload } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  SKIP_ROW,
  type BackfillResolution,
  type BackfillRow,
  type BackfillTarget,
  type InspectResponse,
  type MatchResponse,
} from '@/lib/employee-backfill-types'
import { ReviewTable } from './review-table'

const ENDPOINT = '/api/tools/employee-backfill'

type ReviewFilter = 'review' | 'matched' | 'not_found' | 'all'

async function postForm(form: FormData) {
  const res = await fetch(ENDPOINT, { method: 'POST', body: form })
  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new Error(body?.error ?? 'Request failed')
  }
  return res
}

function defaultSelection(row: BackfillRow): string | undefined {
  if (row.status === 'matched') return row.candidates[0]?.id
  if (row.status === 'not_found') return SKIP_ROW
  return undefined
}

function columnLabel(column: { letter: string; header: string }) {
  return `${column.letter} — ${column.header}`
}

export function BackfillTool() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [sheet, setSheet] = useState<InspectResponse | null>(null)
  const [target, setTarget] = useState<BackfillTarget>('code')
  const [referenceColumn, setReferenceColumn] = useState<number | null>(null)
  const [targetColumn, setTargetColumn] = useState<number | null>(null)
  const [headerRowInput, setHeaderRowInput] = useState('')
  const [match, setMatch] = useState<MatchResponse | null>(null)
  const [selections, setSelections] = useState<Record<number, string>>({})
  const [filter, setFilter] = useState<ReviewFilter>('review')
  const [busy, setBusy] = useState<'inspect' | 'match' | 'export' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filledCount, setFilledCount] = useState<number | null>(null)

  function applyColumnDefaults(info: InspectResponse, nextTarget: BackfillTarget) {
    const nameCol = info.suggestedNameColumn
    const codeCol = info.suggestedCodeColumn
    setReferenceColumn(nextTarget === 'code' ? nameCol : codeCol)
    setTargetColumn(nextTarget === 'code' ? codeCol : nameCol)
  }

  function resetResults() {
    setMatch(null)
    setSelections({})
    setFilledCount(null)
  }

  async function inspect(nextFile: File, options: { sheetName?: string; headerRow?: number } = {}) {
    setBusy('inspect')
    setError(null)
    resetResults()
    try {
      const form = new FormData()
      form.set('action', 'inspect')
      form.set('file', nextFile)
      if (options.sheetName) form.set('sheetName', options.sheetName)
      if (options.headerRow) form.set('headerRow', String(options.headerRow))
      const info: InspectResponse = await (await postForm(form)).json()
      setSheet(info)
      setHeaderRowInput(String(info.headerRow))
      applyColumnDefaults(info, target)
    } catch (err) {
      setSheet(null)
      setError(err instanceof Error ? err.message : 'Could not read the file')
    } finally {
      setBusy(null)
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0]
    if (!nextFile) return
    setFile(nextFile)
    void inspect(nextFile)
  }

  function handleTargetChange(value: string) {
    const nextTarget = value as BackfillTarget
    setTarget(nextTarget)
    resetResults()
    if (sheet) applyColumnDefaults(sheet, nextTarget)
  }

  function buildJobForm(action: 'match' | 'export') {
    const form = new FormData()
    form.set('action', action)
    form.set('file', file as File)
    form.set('sheetName', sheet?.sheetName ?? '')
    form.set('headerRow', String(sheet?.headerRow ?? 1))
    form.set('target', target)
    form.set('referenceColumn', String(referenceColumn))
    form.set('targetColumn', String(targetColumn))
    return form
  }

  async function runMatch() {
    setBusy('match')
    setError(null)
    setFilledCount(null)
    try {
      const result: MatchResponse = await (await postForm(buildJobForm('match'))).json()
      const initial: Record<number, string> = {}
      for (const row of result.rows) {
        const value = defaultSelection(row)
        if (value !== undefined) initial[row.rowNumber] = value
      }
      setMatch(result)
      setSelections(initial)
      setFilter(result.summary.suggested + result.summary.ambiguous > 0 ? 'review' : 'all')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Matching failed')
    } finally {
      setBusy(null)
    }
  }

  async function download() {
    if (!match || !file) return
    setBusy('export')
    setError(null)
    try {
      const resolutions: BackfillResolution[] = Object.entries(selections)
        .filter(([, employeeId]) => employeeId !== SKIP_ROW)
        .map(([rowNumber, employeeId]) => ({ rowNumber: Number(rowNumber), employeeId }))
      const form = buildJobForm('export')
      form.set('resolutions', JSON.stringify(resolutions))
      const res = await postForm(form)
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') ?? ''
      const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? 'backfilled.xlsx'
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      setFilledCount(Number(res.headers.get('X-Filled-Count') ?? 0))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setBusy(null)
    }
  }

  function startOver() {
    setFile(null)
    setSheet(null)
    setError(null)
    resetResults()
    if (inputRef.current) inputRef.current.value = ''
  }

  const reviewRows = useMemo(() => {
    if (!match) return []
    return match.rows.filter((row) => {
      if (filter === 'all') return true
      if (filter === 'review') return row.status === 'suggested' || row.status === 'ambiguous'
      return row.status === filter
    })
  }, [match, filter])

  const pendingCount = match ? match.rows.filter((row) => selections[row.rowNumber] === undefined).length : 0
  const fillCount = Object.values(selections).filter((v) => v !== SKIP_ROW).length
  const suggestedPending = match?.rows.filter(
    (row) => row.status === 'suggested' && selections[row.rowNumber] === undefined,
  ) ?? []

  function acceptSuggestions() {
    setSelections((prev) => {
      const next = { ...prev }
      for (const row of suggestedPending) {
        if (row.candidates[0]) next[row.rowNumber] = row.candidates[0].id
      }
      return next
    })
  }

  function leaveRemainingBlank() {
    setSelections((prev) => {
      const next = { ...prev }
      for (const row of match?.rows ?? []) {
        if (next[row.rowNumber] === undefined) next[row.rowNumber] = SKIP_ROW
      }
      return next
    })
  }

  const referenceLabel = target === 'code' ? 'Name column (reference)' : 'Code column (reference)'
  const targetLabel = target === 'code' ? 'Employee code column (to fill)' : 'Employee name column (to fill)'
  const canMatch = Boolean(file && sheet && referenceColumn && targetColumn && referenceColumn !== targetColumn)

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">1. Upload and configure</CardTitle>
          <CardDescription>
            Only empty cells in the target column are filled. Cells that already have a value are never overwritten.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              id="backfill-file"
              onChange={handleFileChange}
            />
            <Button asChild variant={file ? 'outline' : 'default'} className="gap-2">
              <label htmlFor="backfill-file" className="cursor-pointer">
                {busy === 'inspect' ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {file ? 'Choose another file' : 'Upload Excel file'}
              </label>
            </Button>
            {file ? (
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <FileSpreadsheet className="size-4 shrink-0 text-emerald-600" />
                <span className="truncate font-medium">{file.name}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">.xlsx files up to 10 MB</span>
            )}
          </div>

          {sheet && (
            <>
              <div className="space-y-3">
                <Label>What do you want to fill?</Label>
                <RadioGroup value={target} onValueChange={handleTargetChange} className="grid gap-3 sm:grid-cols-2">
                  <Label
                    htmlFor="target-code"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value="code" id="target-code" className="mt-0.5" />
                    <span className="space-y-1">
                      <span className="block font-medium">Employee Code</span>
                      <span className="block text-sm text-muted-foreground">Look up each name and fill its code</span>
                    </span>
                  </Label>
                  <Label
                    htmlFor="target-name"
                    className="flex cursor-pointer items-start gap-3 rounded-lg border p-4 font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem value="name" id="target-name" className="mt-0.5" />
                    <span className="space-y-1">
                      <span className="block font-medium">Employee Name</span>
                      <span className="block text-sm text-muted-foreground">Look up each code and fill its name</span>
                    </span>
                  </Label>
                </RadioGroup>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="backfill-sheet">Sheet</Label>
                  <Select
                    value={sheet.sheetName}
                    onValueChange={(name) => file && inspect(file, { sheetName: name })}
                  >
                    <SelectTrigger id="backfill-sheet" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sheet.sheetNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backfill-header-row">Header row</Label>
                  <Input
                    id="backfill-header-row"
                    type="number"
                    min={1}
                    value={headerRowInput}
                    onChange={(e) => setHeaderRowInput(e.target.value)}
                    onBlur={() => {
                      const n = Number(headerRowInput)
                      if (file && Number.isInteger(n) && n >= 1 && n !== sheet.headerRow) {
                        void inspect(file, { sheetName: sheet.sheetName, headerRow: n })
                      } else {
                        setHeaderRowInput(String(sheet.headerRow))
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backfill-reference">{referenceLabel}</Label>
                  <Select
                    value={referenceColumn ? String(referenceColumn) : ''}
                    onValueChange={(v) => {
                      setReferenceColumn(Number(v))
                      resetResults()
                    }}
                  >
                    <SelectTrigger id="backfill-reference" className="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheet.columns.map((col) => (
                        <SelectItem key={col.index} value={String(col.index)}>
                          {columnLabel(col)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backfill-target">{targetLabel}</Label>
                  <Select
                    value={targetColumn ? String(targetColumn) : ''}
                    onValueChange={(v) => {
                      setTargetColumn(Number(v))
                      resetResults()
                    }}
                  >
                    <SelectTrigger id="backfill-target" className="w-full">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {sheet.columns.map((col) => (
                        <SelectItem key={col.index} value={String(col.index)} disabled={col.index === referenceColumn}>
                          {columnLabel(col)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {sheet.columns.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No headers found on row {sheet.headerRow}. Adjust the header row number.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button onClick={runMatch} disabled={!canMatch || busy !== null} className="gap-2">
                  {busy === 'match' && <Loader2 className="size-4 animate-spin" />}
                  {match ? 'Match again' : 'Match employees'}
                </Button>
                <Button variant="ghost" onClick={startOver} disabled={busy !== null} className="gap-2">
                  <RotateCcw className="size-4" />
                  Start over
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {match && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">2. Review matches</CardTitle>
            <CardDescription>
              {`${match.summary.totalRows} rows with a reference value. ${match.summary.alreadyFilled} already filled and skipped.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Matched', value: match.summary.matched, tone: 'text-emerald-600' },
                { label: 'Suggested', value: match.summary.suggested, tone: 'text-amber-600' },
                { label: 'Ambiguous', value: match.summary.ambiguous, tone: 'text-orange-600' },
                { label: 'Not found', value: match.summary.notFound, tone: 'text-muted-foreground' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border p-3">
                  <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                  <dd className={`text-2xl font-semibold ${stat.tone}`}>{stat.value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as ReviewFilter)}>
                <TabsList>
                  <TabsTrigger value="review">{`Needs review (${match.summary.suggested + match.summary.ambiguous})`}</TabsTrigger>
                  <TabsTrigger value="not_found">{`Not found (${match.summary.notFound})`}</TabsTrigger>
                  <TabsTrigger value="matched">{`Matched (${match.summary.matched})`}</TabsTrigger>
                  <TabsTrigger value="all">{`All (${match.rows.length})`}</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={acceptSuggestions} disabled={suggestedPending.length === 0}>
                  {`Accept ${suggestedPending.length} suggestions`}
                </Button>
                <Button variant="outline" size="sm" onClick={leaveRemainingBlank} disabled={pendingCount === 0}>
                  Leave remaining blank
                </Button>
              </div>
            </div>

            <ReviewTable
              rows={reviewRows}
              target={target}
              selections={selections}
              onSelect={(rowNumber, value) => {
                setSelections((prev) => ({ ...prev, [rowNumber]: value }))
                setFilledCount(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      {match && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">3. Download</CardTitle>
            <CardDescription>
              Your original workbook is returned with only the chosen empty cells filled. Formatting, other columns and sheets stay as they were.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              {pendingCount > 0 ? (
                <span className="text-amber-700 dark:text-amber-400">
                  {`${pendingCount} row${pendingCount === 1 ? '' : 's'} still need a decision.`}
                </span>
              ) : filledCount !== null ? (
                <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" />
                  {`Downloaded with ${filledCount} cell${filledCount === 1 ? '' : 's'} filled.`}
                </span>
              ) : (
                <span className="text-muted-foreground">{`${fillCount} cell${fillCount === 1 ? '' : 's'} will be filled.`}</span>
              )}
            </p>
            <Button onClick={download} disabled={pendingCount > 0 || busy !== null} className="gap-2">
              {busy === 'export' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Download filled file
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
