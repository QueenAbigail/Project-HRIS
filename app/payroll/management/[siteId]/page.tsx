'use client'

import { useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Edit,
  Eye,
  FileSpreadsheet,
  History,
  Lock,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
  type AuditLogEntry,
  type CalculatedEmployeePayroll,
  type CutoffOption,
  type DataSourceType,
  type SiteEmployeePayroll,
  type SitePayrollAdjustment,
  calculateEmployeePayroll,
  computeCutoffSummary,
  cutoffChoices,
  mockExcelPreviewRows,
  mockInitialAdjustments,
  mockInitialAuditLogs,
  mockSiteConfigs,
  mockSiteEmployeesMap,
} from '@/components/payroll/management/site-detail-types'

const sourceBadgeMeta: Record<DataSourceType, { label: string; className: string }> = {
  auto: { label: 'Auto App', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  edited: { label: 'Edited', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  excel: { label: 'Excel', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

const auditActionMeta: Record<AuditLogEntry['action'], { label: string; className: string }> = {
  EDIT_EMPLOYEE: { label: 'Edit Karyawan', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  EXCEL_IMPORT: { label: 'Import Excel', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  SET_CUTOFF: { label: 'Set Cut-Off', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  ADD_ADJUSTMENT: { label: 'Add Adjustment', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  DELETE_ADJUSTMENT: { label: 'Delete Adjustment', className: 'bg-red-50 text-red-700 border-red-200' },
  SYNC_AUTO: { label: 'Sync App', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  FINALIZE_LOCK: { label: 'Finalize & Lock', className: 'bg-purple-50 text-purple-700 border-purple-200' },
}

function nowTimestamp() {
  return '27 Mar 2026, ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function SiteManagementPage() {
  const router = useRouter()
  const params = useParams()
  const siteId = params.siteId as string
  const siteConfig = mockSiteConfigs[siteId]

  const [cutoffDay, setCutoffDay] = useState<CutoffOption>(siteConfig?.cutoffDay ?? 'eom')
  const [defaultEffectiveDays, setDefaultEffectiveDays] = useState<number>(siteConfig?.defaultEffectiveDays ?? 22)
  const [cutoffDialogOpen, setCutoffDialogOpen] = useState(false)
  const [draftCutoff, setDraftCutoff] = useState<CutoffOption>(cutoffDay)
  const [draftEffectiveDays, setDraftEffectiveDays] = useState<string>(String(defaultEffectiveDays))

  const [rawEmployees, setRawEmployees] = useState<SiteEmployeePayroll[]>(
    mockSiteEmployeesMap[siteId] ?? []
  )
  const [adjustments, setAdjustments] = useState<SitePayrollAdjustment[]>(
    mockInitialAdjustments[siteId] ?? []
  )
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockInitialAuditLogs)
  const [isFinalized, setIsFinalized] = useState(false)
  const [lockOpen, setLockOpen] = useState(false)

  // Breakdown view dialog
  const [viewingEmployee, setViewingEmployee] = useState<CalculatedEmployeePayroll | null>(null)

  // Quick Hybrid Edit dialog
  const [editingRow, setEditingRow] = useState<SiteEmployeePayroll | null>(null)
  const [editForm, setEditForm] = useState({
    presentDays: '0',
    alphaDays: '0',
    fixedOtHours: '0',
    holidayOtHours: '0',
    bkoOtHours: '0',
  })

  // Hybrid Excel Import dialog (with conflict resolution)
  const [importOpen, setImportOpen] = useState(false)
  const [excelStrategy, setExcelStrategy] = useState<'keep_edited' | 'overwrite_all'>('keep_edited')
  const [selectedFileName, setSelectedFileName] = useState<string>('rekap_absensi_site_mar2026.xlsx')

  // Adjustments dialog
  const [addAdjustmentOpen, setAddAdjustmentOpen] = useState(false)
  const [newAdjustment, setNewAdjustment] = useState({
    employee: '',
    type: 'bonus' as SitePayrollAdjustment['type'],
    reason: '',
    amount: '',
    date: '2026-03-27',
  })
  const [deleteTarget, setDeleteTarget] = useState<SitePayrollAdjustment | null>(null)

  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null)

  const cutoffSummary = computeCutoffSummary(cutoffDay)

  const calculatedEmployees = useMemo(
    () => rawEmployees.map((emp) => calculateEmployeePayroll(emp)),
    [rawEmployees]
  )

  const totals = useMemo(() => {
    const baseTotal = calculatedEmployees.reduce((sum, e) => sum + e.baseSalary, 0)
    const overtimeTotal = calculatedEmployees.reduce((sum, e) => sum + e.overtime, 0)
    const allowanceTotal = calculatedEmployees.reduce((sum, e) => sum + e.allowance, 0)
    const deductionTotal = calculatedEmployees.reduce((sum, e) => sum + e.deductions, 0)

    const adjAdditions = adjustments
      .filter((a) => a.type !== 'deduction')
      .reduce((sum, a) => sum + a.amount, 0)
    const adjDeductions = adjustments
      .filter((a) => a.type === 'deduction')
      .reduce((sum, a) => sum + a.amount, 0)

    const grossPayroll = baseTotal + overtimeTotal
    const totalAllowance = allowanceTotal + adjAdditions
    const totalDeductions = deductionTotal + adjDeductions
    const netPayroll = grossPayroll + totalAllowance - totalDeductions

    return {
      grossPayroll,
      totalAllowance,
      totalDeductions,
      netPayroll,
    }
  }, [calculatedEmployees, adjustments])

  const appendLog = (
    action: AuditLogEntry['action'],
    target: string,
    detail: string
  ) => {
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: nowTimestamp(),
        actor: 'Adi Candra (HR)',
        action,
        target,
        detail,
      },
      ...prev,
    ])
  }

  const openEditModal = (emp: CalculatedEmployeePayroll) => {
    setEditingRow(emp)
    setEditForm({
      presentDays: String(emp.presentDays),
      alphaDays: String(emp.alphaDays),
      fixedOtHours: String(emp.fixedOtHours),
      holidayOtHours: String(emp.holidayOtHours),
      bkoOtHours: String(emp.bkoOtHours),
    })
  }

  const editPreview = useMemo(() => {
    if (!editingRow) return null
    return calculateEmployeePayroll({
      ...editingRow,
      presentDays: Math.max(0, Number(editForm.presentDays) || 0),
      alphaDays: Math.max(0, Number(editForm.alphaDays) || 0),
      fixedOtHours: Math.max(0, Number(editForm.fixedOtHours) || 0),
      holidayOtHours: Math.max(0, Number(editForm.holidayOtHours) || 0),
      bkoOtHours: Math.max(0, Number(editForm.bkoOtHours) || 0),
    })
  }, [editingRow, editForm])

  const handleSaveEdit = () => {
    if (!editingRow || isFinalized) return
    const nextPresent = Math.max(0, Number(editForm.presentDays) || 0)
    const nextAlpha = Math.max(0, Number(editForm.alphaDays) || 0)
    const nextFixedOt = Math.max(0, Number(editForm.fixedOtHours) || 0)
    const nextHolidayOt = Math.max(0, Number(editForm.holidayOtHours) || 0)
    const nextBkoOt = Math.max(0, Number(editForm.bkoOtHours) || 0)

    setRawEmployees((prev) =>
      prev.map((emp) =>
        emp.employeeId === editingRow.employeeId
          ? {
              ...emp,
              source: 'edited',
              presentDays: nextPresent,
              alphaDays: nextAlpha,
              fixedOtHours: nextFixedOt,
              holidayOtHours: nextHolidayOt,
              bkoOtHours: nextBkoOt,
            }
          : emp
      )
    )

    appendLog(
      'EDIT_EMPLOYEE',
      editingRow.name,
      `Source -> Edited. Hadir: ${editingRow.presentDays}->${nextPresent}h, Alpha: ${editingRow.alphaDays}->${nextAlpha}h, FixedOT: ${editingRow.fixedOtHours}->${nextFixedOt}j, HolidayOT: ${editingRow.holidayOtHours}->${nextHolidayOt}j, BKO: ${editingRow.bkoOtHours}->${nextBkoOt}j.`
    )
    setFeedbackBanner(`Perubahan manual untuk ${editingRow.name} tersimpan dan tercatat di Audit Log.`)
    setEditingRow(null)
  }

  const handleResetToAuto = (emp: SiteEmployeePayroll) => {
    if (isFinalized) return
    const original = (mockSiteEmployeesMap[siteId] ?? []).find(
      (item) => item.employeeId === emp.employeeId
    )
    if (!original) return
    setRawEmployees((prev) =>
      prev.map((row) =>
        row.employeeId === emp.employeeId
          ? { ...original, source: 'auto', effectiveDays: defaultEffectiveDays }
          : row
      )
    )
    appendLog(
      'SYNC_AUTO',
      emp.name,
      'Reset ke data otomatis dari Absensi & Jadwal Aplikasi (Source -> Auto App).'
    )
    setFeedbackBanner(`${emp.name} dikembalikan ke perhitungan Auto App.`)
    setEditingRow(null)
  }

  const excelCandidateEmployees = useMemo(() => {
    return rawEmployees.filter((emp) => {
      const baseId = emp.employeeId.replace(/^S[23]-/, '')
      return Boolean(mockExcelPreviewRows[baseId])
    })
  }, [rawEmployees])

  const editedConflictCount = excelCandidateEmployees.filter((e) => e.source === 'edited').length

  const handleApplyExcelImport = () => {
    if (isFinalized) return
    let updatedCount = 0
    let skippedEditedCount = 0

    setRawEmployees((prev) =>
      prev.map((emp) => {
        const baseId = emp.employeeId.replace(/^S[23]-/, '')
        const incoming = mockExcelPreviewRows[baseId]
        if (!incoming) return emp
        if (emp.source === 'edited' && excelStrategy === 'keep_edited') {
          skippedEditedCount += 1
          return emp
        }
        updatedCount += 1
        return {
          ...emp,
          source: 'excel',
          presentDays: incoming.presentDays,
          alphaDays: incoming.alphaDays,
          fixedOtHours: incoming.fixedOtHours,
          holidayOtHours: incoming.holidayOtHours,
          bkoOtHours: incoming.bkoOtHours,
        }
      })
    )

    appendLog(
      'EXCEL_IMPORT',
      selectedFileName || 'Excel Import',
      `Mode: ${excelStrategy === 'keep_edited' ? 'Pertahankan Edit Manual' : 'Timpa Semua'}. Diperbarui: ${updatedCount} karyawan, dipertahankan: ${skippedEditedCount} karyawan.`
    )
    setFeedbackBanner(
      `Import Excel selesai: ${updatedCount} karyawan diperbarui (${skippedEditedCount} editan manual dipertahankan).`
    )
    setImportOpen(false)
  }

  const handleSaveCutoff = () => {
    if (isFinalized) return
    const nextEff = Math.max(1, Math.min(31, Number(draftEffectiveDays) || 22))
    setCutoffDay(draftCutoff)
    setDefaultEffectiveDays(nextEff)
    setRawEmployees((prev) => prev.map((e) => ({ ...e, effectiveDays: nextEff })))
    appendLog(
      'SET_CUTOFF',
      siteConfig.siteName,
      `Ubah Cut-Off ke ${draftCutoff === 'eom' ? 'Akhir Bulan' : `Tanggal ${draftCutoff}`} & Default Hari Kerja Efektif: ${nextEff} hari.`
    )
    setFeedbackBanner('Pengaturan Cut-Off dan Default Hari Kerja Efektif berhasil diperbarui.')
    setCutoffDialogOpen(false)
  }

  const handleAddAdjustment = () => {
    if (isFinalized) return
    const amount = Number(newAdjustment.amount)
    if (!newAdjustment.employee || !newAdjustment.reason || !Number.isFinite(amount) || amount <= 0) return
    const created: SitePayrollAdjustment = {
      id: `adj-${Date.now()}`,
      employee: newAdjustment.employee,
      type: newAdjustment.type,
      amount,
      reason: newAdjustment.reason,
      date: newAdjustment.date,
    }
    setAdjustments((current) => [...current, created])
    appendLog(
      'ADD_ADJUSTMENT',
      created.employee,
      `Tambah ${created.type.toUpperCase()} ${formatCurrency(created.amount)} (${created.reason}).`
    )
    setNewAdjustment({ employee: '', type: 'bonus', reason: '', amount: '', date: '2026-03-27' })
    setAddAdjustmentOpen(false)
  }

  const confirmDeleteAdjustment = () => {
    if (!deleteTarget || isFinalized) return
    setAdjustments((current) => current.filter((item) => item.id !== deleteTarget.id))
    appendLog(
      'DELETE_ADJUSTMENT',
      deleteTarget.employee,
      `Hapus ${deleteTarget.type.toUpperCase()} ${formatCurrency(deleteTarget.amount)} (${deleteTarget.reason}).`
    )
    setDeleteTarget(null)
  }

  const handleFinalizeAndLock = () => {
    setIsFinalized(true)
    setLockOpen(false)
    appendLog(
      'FINALIZE_LOCK',
      `${siteConfig.siteName} · ${cutoffSummary.periodLabel}`,
      `Payroll dikunci permanen. Net Pay akhir: ${formatCurrency(totals.netPayroll)}. Anti-backdate aktif.`
    )
    setFeedbackBanner('Payroll periode ini sudah Finalized & Locked. Semua edit dan backdate absen dikunci.')
  }

  if (!siteConfig) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p>Site not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back to Payroll Management">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {siteConfig.siteName}
              </h1>
              <Badge
                variant="outline"
                className={
                  isFinalized
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }
              >
                {isFinalized ? 'Finalized & Locked' : 'Draft / Ongoing'}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {cutoffSummary.periodLabel} · Cut-Off {cutoffSummary.cutoffLabel} ({cutoffSummary.cutoffRange}) · Default Kerja Efektif {defaultEffectiveDays} hari
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          disabled={isFinalized}
          onClick={() => {
            setDraftCutoff(cutoffDay)
            setDraftEffectiveDays(String(defaultEffectiveDays))
            setCutoffDialogOpen(true)
          }}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Set Cut-Off
        </Button>
      </div>

      {/* Lock / Feedback Notice */}
      {isFinalized && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700" />
          <span>
            Periode ini sudah <strong>Finalized & Locked</strong>. Perubahan absensi backdate, edit manual, dan import Excel dikunci; koreksi susulan masuk ke periode bulan berikutnya.
          </span>
        </div>
      )}

      {feedbackBanner && !isFinalized && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50/70 px-4 py-2.5 text-sm text-blue-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
            <span>{feedbackBanner}</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setFeedbackBanner(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Main 6 Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto">
          <TabsTrigger value="summary">Site Summary</TabsTrigger>
          <TabsTrigger value="employees">Employee Payroll</TabsTrigger>
          <TabsTrigger value="adjustments">Adjustments ({adjustments.length})</TabsTrigger>
          <TabsTrigger value="validation">Issues & Validation</TabsTrigger>
          <TabsTrigger value="audit">Audit Log ({auditLogs.length})</TabsTrigger>
          <TabsTrigger value="finalize">Finalize & Lock</TabsTrigger>
        </TabsList>

        {/* 1. Site Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{siteConfig.siteName} — Payroll Summary</CardTitle>
              <CardDescription>
                Ringkasan otomatis dari komponen gaji, aturan lembur, dan potongan untuk periode ini.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Gross Payroll (Base + OT)</p>
                <p className="mt-2 text-xl font-bold tabular-nums">{formatCurrency(totals.grossPayroll)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Allowance</p>
                <p className="mt-2 text-xl font-bold tabular-nums text-emerald-700">{formatCurrency(totals.totalAllowance)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Deductions (incl. Alpha)</p>
                <p className="mt-2 text-xl font-bold tabular-nums text-red-600">{formatCurrency(totals.totalDeductions)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Net Pay</p>
                <p className="mt-2 text-xl font-bold tabular-nums text-emerald-700">{formatCurrency(totals.netPayroll)}</p>
              </div>
              <div className="rounded-lg border p-4 sm:col-span-2 lg:col-span-4">
                <p className="text-sm text-muted-foreground">Jadwal Cut-Off & Hari Kerja</p>
                <p className="mt-2 text-sm font-medium">
                  {cutoffSummary.cutoffLabel} ({cutoffSummary.cutoffRange}) · {defaultEffectiveDays} hari kerja efektif
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Employee Payroll Tab */}
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Employee Payroll</CardTitle>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFeedbackBanner(`Template Excel untuk ${siteConfig.siteName} (${calculatedEmployees.length} karyawan) siap diunduh.`)}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download Template
                </Button>
                <Button size="sm" disabled={isFinalized} onClick={() => setImportOpen(true)}>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Import Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table className="min-w-[920px]">
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead className="text-center">Attendance</TableHead>
                      <TableHead className="text-right">Base Salary</TableHead>
                      <TableHead className="text-right">Overtime</TableHead>
                      <TableHead className="text-right">Allowance</TableHead>
                      <TableHead className="text-right">Deductions</TableHead>
                      <TableHead className="text-right">Net Pay</TableHead>
                      <TableHead className="text-center">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calculatedEmployees.map((emp) => (
                      <TableRow key={emp.employeeId}>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium">{emp.name}</span>
                            {emp.isNewHire && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-1.5 py-0 text-[10px]">
                                New Hire Prorate
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {emp.position}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums">
                          {emp.presentDays}/{emp.effectiveDays}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          {formatCurrency(emp.baseSalary)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums text-emerald-700">
                          {formatCurrency(emp.overtime)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-emerald-700">
                          {formatCurrency(emp.allowance)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-red-600">
                          {formatCurrency(emp.deductions)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold tabular-nums text-emerald-700">
                          {formatCurrency(emp.netPay)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`View breakdown ${emp.name}`}
                              onClick={() => setViewingEmployee(emp)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isFinalized}
                              aria-label={`Edit payroll data ${emp.name}`}
                              onClick={() => openEditModal(emp)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Adjustments Tab */}
        <TabsContent value="adjustments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Payroll Adjustments</h3>
              <p className="text-sm text-muted-foreground">
                Tambahan/potongan satu kali (misal rapel koreksi bulan lalu yang sudah Finalized).
              </p>
            </div>
            <Button disabled={isFinalized} onClick={() => setAddAdjustmentOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Adjustment
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              {adjustments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada adjustment untuk site ini.</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adjustments.map((adj) => (
                        <TableRow key={adj.id}>
                          <TableCell className="font-medium">{adj.employee}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                adj.type === 'overtime'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : adj.type === 'bonus'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                              }
                            >
                              {adj.type.charAt(0).toUpperCase() + adj.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{adj.reason}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">{formatCurrency(adj.amount)}</TableCell>
                          <TableCell className="text-sm tabular-nums">{adj.date}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isFinalized}
                              aria-label={`Delete adjustment for ${adj.employee}`}
                              onClick={() => setDeleteTarget(adj)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Issues & Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Issues & Validation
              </CardTitle>
              <CardDescription>
                Pengecekan otomatis proteksi payroll (non-blocking info vs hal yang perlu dikonfirmasi HR).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4 text-sm">
                <p className="font-semibold text-amber-900">1 Karyawan Alpha Otomatis (Dari Schedule)</p>
                <p className="mt-1 text-amber-800">
                  <strong>Agus Pratama</strong> terjadwal 22 hari dan tercatat hadir 21 hari tanpa izin/cuti. Penalty Alpha 1/{defaultEffectiveDays} sudah masuk di kolom Deductions (Base Salary tetap utuh).
                </p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 text-sm">
                <p className="font-semibold text-blue-900">Tukar Shift Hari Libur Nasional & Pembatasan Jam (Cap)</p>
                <p className="mt-1 text-blue-800">
                  <strong>Dedi Kurniawan</strong> mendapat Full National Holiday OT 12 jam (hasil tukar shift Approved), dan absen tgl 18 yang tercatat 20 jam sudah dibatasi otomatis sesuai shift 12 jam.
                </p>
              </div>
              <div className="rounded-lg border p-4 text-sm">
                <p className="font-semibold">Info: Karyawan Tanpa Schedule (Tetap Full Base Pay)</p>
                <p className="mt-1 text-muted-foreground">
                  <strong>Hendra Wijaya</strong> belum memiliki schedule di aplikasi (hadir tercatat 15 hari). Sesuai aturan aman, Alpha otomatis = 0 sehingga Gaji Pokok tetap utuh kecuali diisi manual/Excel.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Audit Log Tab (NEW) */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Audit Log — {siteConfig.siteName}
              </CardTitle>
              <CardDescription>
                Rekam jejak seluruh perubahan manual, import Excel, perubahan Cut-Off, adjustment, dan penguncian payroll.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Detail Perubahan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => {
                      const meta = auditActionMeta[log.action]
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground tabular-nums">
                            {log.timestamp}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm font-medium">{log.actor}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={meta.className}>
                              {meta.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm font-medium">{log.target}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.detail}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. Finalize & Lock Tab */}
        <TabsContent value="finalize" className="space-y-4">
          <Card className={isFinalized ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40'}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isFinalized ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                ) : (
                  <Lock className="h-5 w-5 text-amber-700" />
                )}
                {isFinalized
                  ? `${siteConfig.siteName} — Finalized & Locked`
                  : `Finalize & Lock Payroll (${siteConfig.siteName})`}
              </CardTitle>
              <CardDescription>
                {isFinalized
                  ? 'Snapshot payroll sudah dikunci permanen dan siap diterbitkan ke Manage Payslip serta Monthly Recap.'
                  : 'Setelah dikunci, seluruh edit manual, import Excel, perubahan cut-off, dan perubahan absen backdate untuk periode ini akan diblokir.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 rounded-lg border bg-background p-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Gross Payroll</span>
                  <p className="mt-1 font-semibold tabular-nums">{formatCurrency(totals.grossPayroll)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Allowance</span>
                  <p className="mt-1 font-semibold tabular-nums text-emerald-700">{formatCurrency(totals.totalAllowance)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Deductions</span>
                  <p className="mt-1 font-semibold tabular-nums text-red-600">{formatCurrency(totals.totalDeductions)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Net Pay</span>
                  <p className="mt-1 font-bold tabular-nums text-emerald-700">{formatCurrency(totals.netPayroll)}</p>
                </div>
              </div>

              {!isFinalized && (
                <Button onClick={() => setLockOpen(true)} className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Finalize & Lock Payroll Periode Ini
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog 1: Read-Only Calculation Breakdown */}
      <Dialog open={Boolean(viewingEmployee)} onOpenChange={(open) => !open && setViewingEmployee(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payroll Breakdown — {viewingEmployee?.name}</DialogTitle>
            <DialogDescription>
              {viewingEmployee?.position} · {cutoffSummary.periodLabel} · Sumber data: {viewingEmployee ? sourceBadgeMeta[viewingEmployee.source].label : ''}
            </DialogDescription>
          </DialogHeader>
          {viewingEmployee && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Base Salary</p>
                  <p className="mt-1 text-lg font-bold tabular-nums">{formatCurrency(viewingEmployee.baseSalary)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {viewingEmployee.isNewHire
                      ? `Prorate karyawan baru (${viewingEmployee.presentDays}/${viewingEmployee.effectiveDays} hari dari ${formatCurrency(viewingEmployee.fullBaseSalary)})`
                      : 'Utuh sesuai Manage Salary (Alpha tidak memotong Base Salary)'}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">Net Pay</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-emerald-700">{formatCurrency(viewingEmployee.netPay)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Base + Overtime + Allowance - Deductions
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-3 space-y-2">
                <p className="font-semibold">Rincian Lembur (Capped Sesuai Jadwal Shift)</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fixed OT (Shift 12j): {viewingEmployee.fixedOtHours} jam</span>
                  <span className="font-medium tabular-nums">{formatCurrency(viewingEmployee.fixedOtAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">National Holiday OT: {viewingEmployee.holidayOtHours} jam</span>
                  <span className="font-medium tabular-nums">{formatCurrency(viewingEmployee.holidayOtAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">OT Replacement (BKO): {viewingEmployee.bkoOtHours} jam</span>
                  <span className="font-medium tabular-nums">{formatCurrency(viewingEmployee.bkoOtAmount)}</span>
                </div>
                {viewingEmployee.swapHolidayNote && (
                  <p className="rounded bg-blue-50 px-2.5 py-1.5 text-xs text-blue-800">{viewingEmployee.swapHolidayNote}</p>
                )}
                {viewingEmployee.cappedClockNote && (
                  <p className="rounded bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">{viewingEmployee.cappedClockNote}</p>
                )}
              </div>

              <div className="rounded-lg border p-3 space-y-2">
                <p className="font-semibold">Rincian Tunjangan & Potongan</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Allowance (Bulanan {formatCurrency(viewingEmployee.monthlyAllowance)} + {viewingEmployee.presentDays}h x {formatCurrency(viewingEmployee.dailyAllowanceRate)})
                  </span>
                  <span className="font-medium text-emerald-700 tabular-nums">{formatCurrency(viewingEmployee.allowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potongan Tetap (BPJS / Pajak / dll)</span>
                  <span className="font-medium text-red-600 tabular-nums">{formatCurrency(viewingEmployee.fixedDeductionAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Penalty Alpha ({viewingEmployee.alphaDays} hari / {viewingEmployee.effectiveDays} hari kerja)
                  </span>
                  <span className="font-medium text-red-600 tabular-nums">{formatCurrency(viewingEmployee.alphaPenalty)}</span>
                </div>
              </div>

              {viewingEmployee.notes && (
                <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  {viewingEmployee.notes}
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingEmployee(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 2: Quick Activity Edit */}
      <Dialog open={Boolean(editingRow)} onOpenChange={(open) => !open && setEditingRow(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Aktivitas Payroll — {editingRow?.name}</DialogTitle>
            <DialogDescription>
              Koreksi hari kerja & jam lembur tanpa merusak absensi asli. Tarif gaji, tunjangan, dan potongan dihitung otomatis oleh sistem.
            </DialogDescription>
          </DialogHeader>
          {editingRow && (
            <div className="space-y-4 py-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-present">Hari Hadir (dari {editingRow.effectiveDays}h)</Label>
                  <Input
                    id="edit-present"
                    type="number"
                    min={0}
                    max={31}
                    value={editForm.presentDays}
                    onChange={(e) => setEditForm((f) => ({ ...f, presentDays: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-alpha">Hari Alpha (Penalty Deduction)</Label>
                  <Input
                    id="edit-alpha"
                    type="number"
                    min={0}
                    max={31}
                    value={editForm.alphaDays}
                    onChange={(e) => setEditForm((f) => ({ ...f, alphaDays: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-fixed-ot">Fixed OT (jam)</Label>
                  <Input
                    id="edit-fixed-ot"
                    type="number"
                    min={0}
                    value={editForm.fixedOtHours}
                    onChange={(e) => setEditForm((f) => ({ ...f, fixedOtHours: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-holiday-ot">Holiday OT (jam)</Label>
                  <Input
                    id="edit-holiday-ot"
                    type="number"
                    min={0}
                    value={editForm.holidayOtHours}
                    onChange={(e) => setEditForm((f) => ({ ...f, holidayOtHours: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-bko-ot">BKO OT (jam)</Label>
                  <Input
                    id="edit-bko-ot"
                    type="number"
                    min={0}
                    value={editForm.bkoOtHours}
                    onChange={(e) => setEditForm((f) => ({ ...f, bkoOtHours: e.target.value }))}
                  />
                </div>
              </div>

              {editPreview && (
                <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preview Overtime:</span>
                    <span className="font-medium text-emerald-700 tabular-nums">{formatCurrency(editPreview.overtime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preview Deductions (incl. Alpha):</span>
                    <span className="font-medium text-red-600 tabular-nums">{formatCurrency(editPreview.deductions)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5">
                    <span className="font-semibold">Preview Net Pay:</span>
                    <span className="font-bold text-emerald-700 tabular-nums">{formatCurrency(editPreview.netPay)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            {editingRow && editingRow.source !== 'auto' ? (
              <Button variant="ghost" type="button" onClick={() => handleResetToAuto(editingRow)}>
                Reset ke Auto App
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setEditingRow(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save & Catat Log</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 3: Hybrid Excel Import with Conflict Resolution */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
              Import Rekap Excel (Preview & Konflik)
            </DialogTitle>
            <DialogDescription>
              Pilih file rekap dari site, lalu cek apakah ada karyawan yang sebelumnya sudah diedit manual oleh HR.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="mock-excel-file">File Excel Rekap</Label>
              <Input
                id="mock-excel-file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) setSelectedFileName(f.name)
                }}
              />
              <p className="text-xs text-muted-foreground">
                Simulasi file aktif: <strong>{selectedFileName}</strong> (mengandung update untuk 3 karyawan).
              </p>
            </div>

            {editedConflictCount > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-sm space-y-2">
                <p className="font-semibold text-amber-900">
                  Terdeteksi {editedConflictCount} karyawan yang sudah pernah di-edit manual:
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    size="sm"
                    variant={excelStrategy === 'keep_edited' ? 'default' : 'outline'}
                    onClick={() => setExcelStrategy('keep_edited')}
                  >
                    Pertahankan Edit Manual (Aman)
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={excelStrategy === 'overwrite_all' ? 'default' : 'outline'}
                    onClick={() => setExcelStrategy('overwrite_all')}
                  >
                    Timpa Semua dengan Excel
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Status Saat Ini</TableHead>
                    <TableHead>Data Saat Ini</TableHead>
                    <TableHead>Data Baru di Excel</TableHead>
                    <TableHead>Hasil Terapkan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {excelCandidateEmployees.map((emp) => {
                    const baseId = emp.employeeId.replace(/^S[23]-/, '')
                    const incoming = mockExcelPreviewRows[baseId]
                    const willSkip = emp.source === 'edited' && excelStrategy === 'keep_edited'
                    return (
                      <TableRow key={emp.employeeId}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={sourceBadgeMeta[emp.source].className}>
                            {sourceBadgeMeta[emp.source].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {emp.presentDays}h hadir, {emp.alphaDays} alpha, {emp.fixedOtHours + emp.bkoOtHours}j OT
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {incoming.presentDays}h hadir, {incoming.alphaDays} alpha, {incoming.fixedOtHours + incoming.bkoOtHours}j OT
                        </TableCell>
                        <TableCell className="text-xs">
                          {willSkip ? (
                            <span className="font-medium text-amber-700">Dipertahankan (Edited)</span>
                          ) : (
                            <span className="font-medium text-emerald-700">Pakai Excel</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyExcelImport}>Terapkan Import Excel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 4: Set Cut-Off + Default Effective Days */}
      <Dialog open={cutoffDialogOpen} onOpenChange={setCutoffDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Cut-Off & Hari Kerja Site</DialogTitle>
            <DialogDescription>
              Atur tanggal tutup buku bulanan dan default hari kerja efektif khusus untuk {siteConfig.siteName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="site-cutoff-select">Jadwal Cut-Off Bulanan</Label>
              <Select value={draftCutoff} onValueChange={(v: CutoffOption) => setDraftCutoff(v)}>
                <SelectTrigger id="site-cutoff-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cutoffChoices.map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="site-effective-days">Default Hari Kerja Efektif (Pembagi Prorate & Alpha)</Label>
              <Input
                id="site-effective-days"
                type="number"
                min={1}
                max={31}
                value={draftEffectiveDays}
                onChange={(e) => setDraftEffectiveDays(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Dipakai untuk hitung prorate karyawan baru atau penalty jika admin input Alpha manual di site tanpa jadwal.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCutoffDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCutoff}>Save Cut-Off</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog 5: Add Adjustment */}
      <Dialog open={addAdjustmentOpen} onOpenChange={setAddAdjustmentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Payroll Adjustment</DialogTitle>
            <DialogDescription>Tambahkan penyesuaian satu kali untuk karyawan di site ini.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <label className="grid gap-1.5 text-sm font-medium">
              Employee
              <select
                className="h-10 rounded-md border bg-background px-3"
                value={newAdjustment.employee}
                onChange={(e) => setNewAdjustment((c) => ({ ...c, employee: e.target.value }))}
              >
                <option value="">Select employee</option>
                {rawEmployees.map((emp) => (
                  <option key={emp.employeeId} value={emp.name}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-medium">
                Type
                <select
                  className="h-10 rounded-md border bg-background px-3"
                  value={newAdjustment.type}
                  onChange={(e) =>
                    setNewAdjustment((c) => ({
                      ...c,
                      type: e.target.value as SitePayrollAdjustment['type'],
                    }))
                  }
                >
                  <option value="bonus">Bonus</option>
                  <option value="overtime">Overtime (Rapel)</option>
                  <option value="deduction">Deduction</option>
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-medium">
                Amount
                <Input
                  type="number"
                  min={1}
                  placeholder="500000"
                  value={newAdjustment.amount}
                  onChange={(e) => setNewAdjustment((c) => ({ ...c, amount: e.target.value }))}
                />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm font-medium">
              Reason
              <Input
                placeholder="Insentif / Rapel bulan lalu"
                value={newAdjustment.reason}
                onChange={(e) => setNewAdjustment((c) => ({ ...c, reason: e.target.value }))}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Date
              <Input
                type="date"
                value={newAdjustment.date}
                onChange={(e) => setNewAdjustment((c) => ({ ...c, date: e.target.value }))}
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddAdjustmentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdjustment}>Save Adjustment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog 6: Delete Adjustment */}
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Adjustment?</AlertDialogTitle>
            <AlertDialogDescription>
              Adjustment untuk <strong>{deleteTarget?.employee}</strong> ({deleteTarget?.reason}) akan dihapus dan dicatat di Audit Log.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAdjustment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog 7: Finalize & Lock */}
      <AlertDialog open={lockOpen} onOpenChange={setLockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalize & Lock Payroll {siteConfig.siteName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Total Net Pay <strong>{formatCurrency(totals.netPayroll)}</strong> akan dikunci permanen untuk periode {cutoffSummary.periodLabel}. Edit manual, import Excel, dan backdate absen tidak lagi memengaruhi periode ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleFinalizeAndLock}>Ya, Finalize & Lock</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
