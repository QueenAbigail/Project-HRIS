import { FileSpreadsheet, type LucideIcon } from 'lucide-react'

export interface SystemTool {
  title: string
  description: string
  href: string
  icon: LucideIcon
  allowedRoles?: string[]
}

export const systemTools: SystemTool[] = [
  {
    title: 'Employee Backfill',
    description:
      'Upload an Excel file and fill in missing employee codes or names, with a review step before download.',
    href: '/system/tools/employee-backfill',
    icon: FileSpreadsheet,
    allowedRoles: ['SUPER_ADMIN', 'HR_ADMIN'],
  },
]

export function getToolsForRole(role?: string | null) {
  return systemTools.filter(
    (tool) => !tool.allowedRoles || (role != null && tool.allowedRoles.includes(role)),
  )
}
