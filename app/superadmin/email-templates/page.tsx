'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { defaultEmailTemplates, type EmailTemplate } from '@/lib/email-templates'

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultEmailTemplates)
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Omit<EmailTemplate, 'id'>>({
    label: '',
    subject: '',
    message: '',
  })

  const handleAddTemplate = () => {
    setEditingId(null)
    setFormData({ label: '', subject: '', message: '' })
    setIsOpen(true)
  }

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingId(template.id)
    setFormData({
      label: template.label,
      subject: template.subject,
      message: template.message,
    })
    setIsOpen(true)
  }

  const handleSaveTemplate = () => {
    if (!formData.label || !formData.subject || !formData.message) {
      alert('Please fill in all fields')
      return
    }

    if (editingId) {
      setTemplates(
        templates.map((t) =>
          t.id === editingId ? { ...t, ...formData } : t
        )
      )
    } else {
      const newId = `template-${Date.now()}`
      setTemplates([...templates, { id: newId, ...formData }])
    }

    setIsOpen(false)
    setFormData({ label: '', subject: '', message: '' })
  }

  const handleDeleteTemplate = (id: string) => {
    if (id === 'custom') {
      alert('Cannot delete the Custom Message template')
      return
    }
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter((t) => t.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage email templates for payroll communications
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddTemplate} className="gap-2">
              <Plus className="size-4" />
              Add Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Template' : 'Add New Template'}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? 'Update the template details'
                  : 'Create a new email template for payroll communications'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Template Name</Label>
                <Input
                  id="label"
                  placeholder="e.g., Attendance Report"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject..."
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter email message..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={6}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate}>
                  {editingId ? 'Update' : 'Create'} Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead>Template Name</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message Preview</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{template.label}</TableCell>
                <TableCell className="text-muted-foreground">
                  {template.subject || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {template.message
                    ? template.message.substring(0, 50) + '...'
                    : '-'}
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                    disabled={template.id === 'custom'}
                  >
                    <Edit2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                    disabled={template.id === 'custom'}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
        <p>
          <strong>Note:</strong> The &ldquo;Custom Message&rdquo; template is a
          special template that allows users to send custom emails without a
          predefined template. It cannot be edited or deleted.
        </p>
      </div>
    </div>
  )
}
