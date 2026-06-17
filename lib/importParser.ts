/**
 * Import Parser for bulk pattern assignments
 * Supports .xlsx and .csv file formats
 */

export interface RawImportRow {
  [key: string]: string | number | undefined
}

export interface ParsedImportRow {
  employeeId: string
  employeeName?: string
  site: string
  startDate: string
  endDate?: string
  monday?: string
  tuesday?: string
  wednesday?: string
  thursday?: string
  friday?: string
  saturday?: string
  sunday?: string
  [key: string]: string | undefined
}

export interface ImportParseResult {
  fileName: string
  totalRows: number
  rows: ParsedImportRow[]
  parseErrors: string[]
}

/**
 * Parse CSV file using built-in FileReader
 */
export async function parseCSV(file: File): Promise<RawImportRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string
        const lines = csv.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
        
        const rows: RawImportRow[] = []
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue
          
          const values = lines[i].split(',').map(v => v.trim())
          const row: RawImportRow = {}
          headers.forEach((header, idx) => {
            row[header] = values[idx]
          })
          rows.push(row)
        }
        
        resolve(rows)
      } catch (error) {
        reject(new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Parse Excel file (.xlsx) - requires client-side library
 * For now, returns empty array - user needs xlsx library installed
 */
export async function parseExcel(file: File): Promise<RawImportRow[]> {
  // Check if xlsx is available
  try {
    const XLSX = (await import('xlsx')).default
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'array' })
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const rows = XLSX.utils.sheet_to_json(worksheet) as RawImportRow[]
          resolve(rows)
        } catch (error) {
          reject(new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsArrayBuffer(file)
    })
  } catch {
    throw new Error('Excel parser not available. Please install xlsx library.')
  }
}

/**
 * Main parser function - detects file type and parses accordingly
 */
export async function parseImportFile(file: File): Promise<ImportParseResult> {
  const fileName = file.name
  const extension = fileName.split('.').pop()?.toLowerCase() || ''
  
  let rawRows: RawImportRow[] = []
  const parseErrors: string[] = []
  
  try {
    if (extension === 'csv') {
      rawRows = await parseCSV(file)
    } else if (extension === 'xlsx' || extension === 'xls') {
      rawRows = await parseExcel(file)
    } else {
      throw new Error(`Unsupported file format: .${extension}. Supported: .csv, .xlsx, .xls`)
    }
  } catch (error) {
    throw error
  }
  
  // Normalize and validate rows
  const rows: ParsedImportRow[] = []
  rawRows.forEach((raw, idx) => {
    try {
      const parsed: ParsedImportRow = {
        employeeId: String(raw.employee_id || raw.employeeid || raw['employee id'] || '').trim(),
        employeeName: String(raw.employee_name || raw.employeename || raw['employee name'] || '').trim() || undefined,
        site: String(raw.site || raw.location || '').trim(),
        startDate: String(raw.start_date || raw.startdate || raw['start date'] || '').trim(),
        endDate: String(raw.end_date || raw.enddate || raw['end date'] || '').trim() || undefined,
        monday: String(raw.monday || raw.mon || '').trim() || undefined,
        tuesday: String(raw.tuesday || raw.tue || '').trim() || undefined,
        wednesday: String(raw.wednesday || raw.wed || '').trim() || undefined,
        thursday: String(raw.thursday || raw.thu || '').trim() || undefined,
        friday: String(raw.friday || raw.fri || '').trim() || undefined,
        saturday: String(raw.saturday || raw.sat || '').trim() || undefined,
        sunday: String(raw.sunday || raw.sun || '').trim() || undefined,
      }
      
      // Validate required fields
      if (!parsed.employeeId) {
        parseErrors.push(`Row ${idx + 2}: Missing Employee ID`)
        return
      }
      if (!parsed.site) {
        parseErrors.push(`Row ${idx + 2}: Missing Site`)
        return
      }
      if (!parsed.startDate) {
        parseErrors.push(`Row ${idx + 2}: Missing Start Date`)
        return
      }
      
      // Validate date format (YYYY-MM-DD)
      if (!isValidDate(parsed.startDate)) {
        parseErrors.push(`Row ${idx + 2}: Invalid Start Date format (use YYYY-MM-DD)`)
        return
      }
      if (parsed.endDate && !isValidDate(parsed.endDate)) {
        parseErrors.push(`Row ${idx + 2}: Invalid End Date format (use YYYY-MM-DD)`)
        return
      }
      
      rows.push(parsed)
    } catch (error) {
      parseErrors.push(`Row ${idx + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  })
  
  return {
    fileName,
    totalRows: rawRows.length,
    rows,
    parseErrors
  }
}

/**
 * Validate date is in YYYY-MM-DD format
 */
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}
