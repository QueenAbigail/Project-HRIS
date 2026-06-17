'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { validateBulkImport, processBulkImport } from '@/app/superadmin/actions'
import { parseImportFile } from '@/lib/importParser'
import type { ValidationResult } from '@/lib/importValidator'
import { toast } from 'sonner'
import { Upload, AlertCircle, CheckCircle, Info } from 'lucide-react'

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ImportStep = 'upload' | 'preview' | 'confirm' | 'processing' | 'complete'

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [importRows, setImportRows] = useState<any[]>([])
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
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
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileSelect = async (selectedFile: File) => {
    const validExts = ['.csv', '.xlsx', '.xls']
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase()

    if (!validExts.includes(ext)) {
      toast.error('Invalid file format. Accepted: CSV, XLSX, XLS')
      return
    }

    try {
      setLoading(true)
      const result = await parseImportFile(selectedFile)

      if (result.parseErrors.length > 0) {
        toast.error(`File has ${result.parseErrors.length} errors. Please fix and try again.`)
        console.error('Parse errors:', result.parseErrors)
        setLoading(false)
        return
      }

      setFile(selectedFile)
      setImportRows(result.rows)
      setStep('preview')
      setLoading(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse file')
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    try {
      setLoading(true)
      const result = await validateBulkImport(importRows, file?.name || 'import')
      setValidation(result)

      if (!result.isValid) {
        setStep('preview')
        toast.error(`${result.invalidRows} row(s) have errors. Fix and try again.`)
      } else {
        setStep('confirm')
      }
      setLoading(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Validation failed')
      setLoading(false)
    }
  }

  const handleProcess = async () => {
    try {
      setStep('processing')
      setLoading(true)

      const result = await processBulkImport(importRows, file?.name || 'import', 'current-user-id')

      toast.success(result.message)
      setStep('complete')
      setLoading(false)

      setTimeout(() => {
        onOpenChange(false)
        resetDialog()
      }, 2000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Processing failed')
      setStep('preview')
      setLoading(false)
    }
  }

  const resetDialog = () => {
    setStep('upload')
    setFile(null)
    setImportRows([])
    setValidation(null)
    setDragActive(false)
  }

  const handleClose = () => {
    if (step === 'processing' || step === 'complete') return
    onOpenChange(false)
    resetDialog()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import - Pattern Assignments</DialogTitle>
          <DialogDescription>
            Import up to 300+ employee pattern assignments from a CSV or Excel file
          </DialogDescription>
        </DialogHeader>

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-muted-foreground/25'
              }`}
            >
              <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
              <p className="font-semibold mb-1">Drop your file here or click to select</p>
              <p className="text-sm text-muted-foreground mb-4">Supported formats: CSV, XLSX, XLS</p>
              <input
                type="file"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                accept=".csv,.xlsx,.xls"
                className="hidden"
                id="file-input"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={loading}
              >
                Select File
              </Button>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>File Format Requirements:</strong>
                <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                  <li>Column A: Employee ID (required)</li>
                  <li>Column B: Employee Name (optional)</li>
                  <li>Column C: Site (required)</li>
                  <li>Column D: Start Date (YYYY-MM-DD)</li>
                  <li>Column E: End Date (optional, YYYY-MM-DD)</li>
                  <li>Columns F-L: Monday-Sunday shifts (at least one required)</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* STEP 2: PREVIEW & VALIDATION */}
        {step === 'preview' && validation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded border">
                <div className="text-sm text-muted-foreground">Total Rows</div>
                <div className="text-2xl font-bold">{validation.totalRows}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-sm text-muted-foreground">Valid Rows</div>
                <div className="text-2xl font-bold text-green-600">{validation.validRows}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-sm text-muted-foreground">Invalid Rows</div>
                <div className="text-2xl font-bold text-red-600">{validation.invalidRows}</div>
              </div>
              <div className="p-3 rounded border">
                <div className="text-sm text-muted-foreground">Conflicts</div>
                <div className="text-2xl font-bold text-yellow-600">{validation.conflicts.length}</div>
              </div>
            </div>

            {validation.invalidRows > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{validation.invalidRows} row(s) have errors:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    {validation.errors.slice(0, 5).map((err, idx) => (
                      <div key={idx}>
                        <strong>Row {err.rowIndex + 2}:</strong> {err.errors.join(', ')}
                      </div>
                    ))}
                    {validation.errors.length > 5 && (
                      <div>... and {validation.errors.length - 5} more errors</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {validation.conflicts.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{validation.conflicts.length} employee(s) already have assignments.</strong>
                  <div className="mt-2 text-sm">These will be replaced with new assignments.</div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* STEP 3: CONFIRM */}
        {step === 'confirm' && validation && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>All validations passed!</strong> Ready to import{' '}
                <span className="font-bold text-green-600">{validation.validRows}</span> employee assignments.
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Employees to be assigned:</span>
                <Badge>{validation.validRows}</Badge>
              </div>
              {validation.conflicts.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm">Existing assignments to replace:</span>
                  <Badge variant="outline">{validation.conflicts.length}</Badge>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              This action will create pattern assignments for employees from the {file?.name} file. All actions
              will be logged for audit purposes.
            </p>
          </div>
        )}

        {/* STEP 4: PROCESSING */}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-lg font-semibold">Processing import...</p>
            <p className="text-sm text-muted-foreground">Please wait, this may take a moment</p>
          </div>
        )}

        {/* STEP 5: COMPLETE */}
        {step === 'complete' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <p className="text-lg font-semibold text-green-600">Import Completed!</p>
            <p className="text-sm text-muted-foreground text-center">
              Pattern assignments have been successfully imported and are now active.
            </p>
          </div>
        )}

        {/* FOOTER */}
        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')} disabled={loading}>
                Back
              </Button>
              <Button onClick={handleValidate} disabled={loading || validation?.invalidRows !== 0}>
                {loading ? 'Validating...' : 'Proceed to Confirmation'}
              </Button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <Button variant="outline" onClick={() => setStep('preview')} disabled={loading}>
                Back
              </Button>
              <Button onClick={handleProcess} disabled={loading}>
                {loading ? 'Processing...' : 'Import Now'}
              </Button>
            </>
          )}

          {step === 'complete' && (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
