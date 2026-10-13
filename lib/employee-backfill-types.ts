export type BackfillTarget = 'code' | 'name'

export type MatchStatus = 'matched' | 'suggested' | 'ambiguous' | 'not_found'

export interface SheetColumn {
  index: number
  letter: string
  header: string
}

export interface InspectResponse {
  sheetNames: string[]
  sheetName: string
  headerRow: number
  columns: SheetColumn[]
  suggestedNameColumn: number | null
  suggestedCodeColumn: number | null
}

export interface BackfillCandidate {
  id: string
  name: string
  employeeCode: string | null
  siteName: string | null
  position: string | null
  status: string
  score: number
}

export interface BackfillRow {
  rowNumber: number
  reference: string
  status: MatchStatus
  candidates: BackfillCandidate[]
}

export interface MatchSummary {
  totalRows: number
  alreadyFilled: number
  matched: number
  suggested: number
  ambiguous: number
  notFound: number
}

export interface MatchResponse {
  rows: BackfillRow[]
  summary: MatchSummary
}

export interface BackfillResolution {
  rowNumber: number
  employeeId: string
}

export const SKIP_ROW = '__skip__'
