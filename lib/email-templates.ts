export interface EmailTemplate {
  id: string
  label: string
  subject: string
  message: string
}

// Initial templates - will be managed from superadmin
export const defaultEmailTemplates: EmailTemplate[] = [
  {
    id: 'payslip',
    label: 'Payslip Notification',
    subject: 'Your Monthly Payslip - Ready to Download',
    message: 'Dear Employee,\n\nYour payslip for this month is ready and attached to this email. Please review the details carefully.\n\nIf you have any questions about your compensation, please contact the HR department.\n\nBest regards,\nHuman Resources Team',
  },
  {
    id: 'bonus',
    label: 'Bonus Announcement',
    subject: 'Bonus Payment Notification',
    message: 'Dear Employee,\n\nWe are pleased to inform you that your bonus has been processed and will be transferred to your bank account shortly.\n\nThank you for your hard work and dedication.\n\nBest regards,\nHuman Resources Team',
  },
  {
    id: 'deduction',
    label: 'Deduction Notice',
    subject: 'Payroll Deduction Notification',
    message: 'Dear Employee,\n\nPlease note that a deduction has been applied to your payroll this month. For details about this deduction, please refer to your payslip or contact the HR department.\n\nBest regards,\nHuman Resources Team',
  },
  {
    id: 'custom',
    label: 'Custom Message',
    subject: '',
    message: '',
  },
]
