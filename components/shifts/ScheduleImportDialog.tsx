'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Upload, AlertTriangle, CheckCircle2 } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ScheduleImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface ParsedSchedule {
  employeeName: string
  employeeId: string
  date: string
  shift: string
}

export function ScheduleImportDialog({ open, onOpenChange, onSuccess }: ScheduleImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [preview, setPreview] = useState<ParsedSchedule[]>([])
  const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload')
  const [progress, setProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)')
      return
    }

    setFile(selectedFile)
    await parseExcel(selectedFile)
  }

  const parseExcel = async (file: File) => {
    try {
      setParsing(true)
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      
      // Get headers and data
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][]
      if (rows.length < 2) {
        toast.error('Excel file must have data')
        setParsing(false)
        return
      }

      const headers = rows[0]
      const dataRows = rows.slice(1)

      // Find column indices
      const nameIdx = headers.findIndex((h: any) => h && String(h).toUpperCase().includes('NAMA'))
      const dateColumns = headers
        .map((h: any, idx: number) => ({ header: h, idx }))
        .filter(({ header }) => header && !String(header).toUpperCase().includes('NAMA') && !String(header).toUpperCase().includes('JABATAN'))

      const parsed: ParsedSchedule[] = []

      dataRows.forEach((row: any[]) => {
        const employeeName = row[nameIdx] || ''
        if (!employeeName) return

        dateColumns.forEach(({ header, idx }) => {
          const shift = row[idx]
          if (shift && shift !== 'OFF' && shift !== '') {
            parsed.push({
              employeeName,
              employeeId: employeeName, // Use name as ID if not available
              date: String(header),
              shift: String(shift).toUpperCase(),
            })
          }
        })
      })

      setPreview(parsed.slice(0, 100))
      setStep('preview')
      toast.success(`Parsed ${parsed.length} schedule entries`)
    } catch (error) {
      toast.error('Failed to parse Excel file')
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    try {
      setImporting(true)
      setStep('importing')
      setProgress(0)

      const response = await fetch('/api/schedules/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: preview }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Import failed')
      }

      const result = await response.json()
      setProgress(100)
      toast.success(`Successfully imported ${result.created} schedules`)

      onSuccess?.()
      setTimeout(() => {
        onOpenChange(false)
        resetDialog()
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to import schedules')
      setStep('preview')
    } finally {
      setImporting(false)
    }
  }

  const resetDialog = () => {
    setFile(null)
    setPreview([])
    setStep('upload')
    setProgress(0)
  }

  const handleClose = () => {
    if (!importing) {
      resetDialog()
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Daily Schedules</DialogTitle>
          <DialogDescription>
            Upload an Excel file with employee names and daily shift assignments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'upload' && (
            <>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 transition ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border'
                }`}
              >
                <div className="text-center space-y-4">
                  <Upload className="size-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">Upload Excel File</h3>
                    <p className="text-sm text-muted-foreground mt-1">Drag and drop or click to select</p>
                  </div>
                  <Input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                    disabled={parsing}
                    className="hidden"
                    id="file-input"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('file-input')?.click()}
                    disabled={parsing}
                  >
                    {parsing ? 'Parsing...' : 'Select File'}
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="size-4" />
                <AlertDescription>
                  <strong>Format:</strong> First column: Employee names, then columns for each date with shift codes (P for Pagi/Morning, M for Malam/Evening, X for Off, OFF for Day off)
                </AlertDescription>
              </Alert>
            </>
          )}

          {step === 'preview' && (
            <>
              <Alert className="bg-blue-50 border-blue-200">
                <CheckCircle2 className="size-4 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  Found {preview.length} schedule entries. Review and confirm to import.
                </AlertDescription>
              </Alert>

              <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Employee</th>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Shift</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((item, idx) => (
                      <tr key={idx} className="border-t border-border hover:bg-muted/50">
                        <td className="px-4 py-2">{item.employeeName}</td>
                        <td className="px-4 py-2 text-xs">{item.date}</td>
                        <td className="px-4 py-2">{item.shift}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {preview.length > 20 && (
                <p className="text-sm text-muted-foreground">
                  ... and {preview.length - 20} more entries
                </p>
              )}
            </>
          )}

          {step === 'importing' && (
            <div className="space-y-4">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Importing {preview.length} schedules and generating today's attendance...
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={importing}>
            Cancel
          </Button>
          {step === 'preview' && (
            <Button onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Confirm & Import'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
